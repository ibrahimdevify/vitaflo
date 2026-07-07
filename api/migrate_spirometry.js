/**
 * VitalFlow Spirometry Migration (PostgreSQL → MySQL)
 * 
 * Migrates dashboard_spirometry + dashboard_observation from vitalport DB
 * into portal_observation + portal_spirometry on Render MySQL.
 * 
 * Run: node migrate_spirometry.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const MIGRATION_DIR = path.join(__dirname, 'migration');
const IDMAP_FILE = path.join(__dirname, 'idmaps.json');
const BATCH_LOG_EVERY = 500;
const CONCURRENCY = 5;

// Load existing user UUID→ID map from first migration
let idMap = {};
let phoneCounter = Date.now();

function uniquePhone() { phoneCounter++; return 'spiro-' + phoneCounter; }

function loadIdMap() {
    if (fs.existsSync(IDMAP_FILE)) {
        try {
            const saved = JSON.parse(fs.readFileSync(IDMAP_FILE, 'utf8'));
            idMap = saved.user || {};
            console.log(`Loaded ${Object.keys(idMap).length} existing user UUID mappings`);
        } catch (e) {
            console.warn('Could not load idmaps.json:', e.message);
        }
    } else {
        console.warn('idmaps.json not found - will rebuild from DB');
    }
}

// Save updated map
function saveIdMap() {
    try {
        const existing = fs.existsSync(IDMAP_FILE) ? JSON.parse(fs.readFileSync(IDMAP_FILE, 'utf8')) : {};
        existing.user = { ...existing.user, ...idMap };
        fs.writeFileSync(IDMAP_FILE, JSON.stringify(existing, null, 2));
    } catch (e) {
        console.warn('Could not save idmaps.json:', e.message);
    }
}

// Parse CSV with quoted fields
function parseCSV(filename) {
    const filepath = path.join(MIGRATION_DIR, filename);
    if (!fs.existsSync(filepath)) {
        console.warn(`  File not found: ${filename}`);
        return [];
    }
    const content = fs.readFileSync(filepath, 'utf8');
    const rows = [];
    let row = [], field = '', inQuotes = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (inQuotes) {
            if (char === '"') { inQuotes = false; continue; }
            field += char; continue;
        }
        if (char === '"') { inQuotes = true; continue; }
        if (char === ',') { row.push(field.trim()); field = ''; continue; }
        if (char === '\r') continue;
        if (char === '\n') { row.push(field.trim()); field = ''; rows.push(row); row = []; continue; }
        field += char;
    }
    if (field || row.length) { row.push(field.trim()); rows.push(row); }
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.replace(/"/g, ''));
    const out = [];
    for (let r = 1; r < rows.length; r++) {
        if (rows[r].length === 1 && rows[r][0] === '') continue;
        const obj = {};
        headers.forEach((h, idx) => obj[h] = rows[r][idx] || '');
        out.push(obj);
    }
    return out;
}

function toFloat(v) {
    if (!v || v === 'None' || v === 'NULL' || v === 'null') return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
}
function toInt(v) {
    if (!v || v === 'None' || v === 'NULL' || v === 'null') return null;
    const n = parseInt(v);
    return isNaN(n) ? null : n;
}
function toBool(v) {
    return String(v).toLowerCase() === 'true' || v === '1' || v === 't';
}
function toDate(v) {
    if (!v) return new Date();
    const d = new Date(v);
    return isNaN(d.getTime()) ? new Date() : d;
}

async function rebuildIdMapFromDB() {
    console.log('Rebuilding user UUID map from existing DB...');
    const users = await prisma.dc_users.findMany({ select: { user_id: true, email: true } });
    // Try to match by various patterns
    let count = 0;
    for (const u of users) {
        // Store by user_id as string too for lookup
        idMap[String(u.user_id)] = u.user_id;
        count++;
    }
    console.log(`Mapped ${count} existing user IDs`);
}

async function ensureUserExists(uuid, hashedPassword) {
    if (idMap[uuid]) return idMap[uuid];

    // Try to find by various UUID patterns in email
    const email = `spiro_${uuid.substring(0, 8)}@migrated.com`;
    let user = await prisma.dc_users.findUnique({ where: { email } }).catch(() => null);

    if (!user) {
        user = await prisma.dc_users.create({
            data: {
                email,
                phone: uniquePhone(),
                password: hashedPassword,
                f_name: 'SpiroUser',
                l_name: uuid.substring(0, 8),
                us_id_fk: 1,
                ut_id_fk: 4,
                is_availible: true,
                reg_date: new Date(),
            },
        }).catch(() => null);
    }

    if (user) {
        idMap[uuid] = user.user_id;
        return user.user_id;
    }
    return null;
}

async function migrateObservations(obsCsv, hashedPassword) {
    console.log(`\n--- Observations (${obsCsv.length} rows) ---`);
    let created = 0, skipped = 0;

    // First pass: ensure all users exist
    const uniqueUserIds = new Set(obsCsv.map(o => o.user_id).filter(Boolean));
    console.log(`Unique users in observations: ${uniqueUserIds.size}`);

    for (const uuid of uniqueUserIds) {
        await ensureUserExists(uuid, hashedPassword);
    }

    // Second pass: insert observations
    for (const o of obsCsv) {
        if (!o.id || !o.user_id) continue;
        const userId = idMap[o.user_id];
        if (!userId) continue;

        // Check if observation already exists by original ID
        // We'll store the original ID in a note or skip if exists
        const existing = await prisma.portal_observation.findFirst({
            where: { user_id: userId, dbdate: toDate(o.dbdate) }
        }).catch(() => null);

        if (existing) { skipped++; continue; }

        try {
            await prisma.portal_observation.create({
                data: {
                    user_id: userId,
                    dbdate: toDate(o.dbdate),
                    fev1_grade: toInt(o.fev1_grade),
                    fvc_grade: toInt(o.fvc_grade),
                    is_post_bronchodilator: toBool(o.is_post_bronchodilator),
                    height: toFloat(o.height),
                },
            });
            created++;
            if (created % BATCH_LOG_EVERY === 0) console.log(`  Obs: ${created}`);
        } catch (e) {
            // Skip duplicates silently
        }
    }
    console.log(`Observations: created=${created}, skipped=${skipped}`);
}

async function migrateSpirometry(spiroCsv) {
    console.log(`\n--- Spirometry (${spiroCsv.length} rows) ---`);
    let created = 0, skipped = 0;

    // Build observation lookup: original_obs_id -> new observation
    const allObs = await prisma.portal_observation.findMany({
        select: { id: true, user_id: true, dbdate: true }
    });

    for (const s of spiroCsv) {
        if (!s.id) continue;

        // Find the observation by matching user_id and dbdate
        const userId = idMap[s.observation_id] || null;

        // Try to find matching observation
        let observationId = null;
        if (userId) {
            const obs = allObs.find(o => o.user_id === userId &&
                Math.abs(new Date(o.dbdate).getTime() - toDate(s.dbdate).getTime()) < 60000);
            if (obs) observationId = obs.id;
        }

        if (!observationId) { skipped++; continue; }

        // Check if spirometry already exists
        const existing = await prisma.portal_spirometry.findFirst({
            where: { observation_id: observationId, dbdate: toDate(s.dbdate) }
        }).catch(() => null);

        if (existing) { skipped++; continue; }

        try {
            await prisma.portal_spirometry.create({
                data: {
                    observation_id: observationId,
                    dbdate: toDate(s.dbdate),
                    fvc: toFloat(s.fvc),
                    fev1: toFloat(s.fev1),
                    pefr: toFloat(s.pefr),
                    fef2575: toFloat(s.fef2575),
                    fev6: toFloat(s.fev6),
                    fev1_perc: toFloat(s["fev1Perc"]),
                    btps: toFloat(s.btps),
                    temp_celsius: toFloat(s["tempCelsius"]),
                    quality_message: toFloat(s["qualityMessage"]),
                    symptom: s.symptom || null,
                    fev1_acceptability: toInt(s["fev1Acceptability"]),
                    fvc_acceptability: toInt(s["fvcAcceptability"]),
                },
            });
            created++;
            if (created % BATCH_LOG_EVERY === 0) console.log(`  Spiro: ${created}`);
        } catch (e) {
            // Skip duplicates
        }
    }
    console.log(`Spirometry: created=${created}, skipped=${skipped}`);
}

async function run() {
    console.log('=== VitalFlow Spirometry Migration ===\n');

    loadIdMap();
    await rebuildIdMapFromDB();

    const obsCsv = parseCSV('vitalport_observation.csv');
    const spiroCsv = parseCSV('vitalport_spirometry.csv');

    console.log(`Loaded: ${obsCsv.length} observations, ${spiroCsv.length} spirometry records`);

    const hashedPassword = await bcrypt.hash('Welcome2026!', 10);

    await migrateObservations(obsCsv, hashedPassword);
    await migrateSpirometry(spiroCsv);

    saveIdMap();

    console.log('\n=== FINAL COUNTS ===');
    console.log('Observations: ' + await prisma.portal_observation.count());
    console.log('Spirometry: ' + await prisma.portal_spirometry.count());
}

run().catch(e => console.error('FATAL:', e)).finally(() => prisma.$disconnect());