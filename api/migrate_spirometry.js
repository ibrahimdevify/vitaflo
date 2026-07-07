/**
 * VitalFlow Spirometry Migration v2 (CORRECTED)
 * 
 * Correct mapping chain:
 *   dashboard_observation.user_id → dashboard_user.id → dashboard_user.user_id (UUID) → dc_users.user_id
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
const DEFAULT_PASSWORD = 'Welcome2026!';

// Maps
const idMap = {};          // UUID → dc_users.user_id
const dashUserMap = {};    // dashboard_user.id → dashboard_user.user_id (UUID)
let phoneCounter = Date.now();
function uniquePhone() { phoneCounter++; return 'sp-' + phoneCounter; }

// ─── Load existing UUID map from first migration ───
function loadIdMap() {
    if (fs.existsSync(IDMAP_FILE)) {
        try {
            const saved = JSON.parse(fs.readFileSync(IDMAP_FILE, 'utf8'));
            Object.assign(idMap, saved.user || {});
            console.log(`📂 Loaded ${Object.keys(idMap).length} existing user UUIDs from idmaps.json`);
        } catch (e) {
            console.warn('⚠️  Could not load idmaps.json:', e.message);
        }
    } else {
        console.warn('⚠️  idmaps.json not found - will query DB directly');
    }
}

function saveIdMap() {
    try {
        const existing = fs.existsSync(IDMAP_FILE) ? JSON.parse(fs.readFileSync(IDMAP_FILE, 'utf8')) : {};
        existing.user = { ...existing.user, ...idMap };
        fs.writeFileSync(IDMAP_FILE, JSON.stringify(existing, null, 2));
    } catch (e) {
        console.warn('⚠️  Could not save idmaps.json:', e.message);
    }
}

// ─── CSV Parser (handles quoted fields) ───
function parseCSV(filename) {
    const filepath = path.join(MIGRATION_DIR, filename);
    if (!fs.existsSync(filepath)) {
        console.warn(`  ❌ File not found: ${filename}`);
        return [];
    }
    const content = fs.readFileSync(filepath, 'utf8');
    const rows = [], len = content.length;
    let row = [], field = '', inQuotes = false;

    for (let i = 0; i < len; i++) {
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

// ─── Helper functions ───
function toFloat(v) {
    if (!v || v === 'None' || v === 'NULL' || v === 'null' || v === '') return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
}
function toInt(v) {
    if (!v || v === 'None' || v === 'NULL' || v === 'null' || v === '') return null;
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

// ─── Step 1: Build dashUserMap from vitalport_user.csv ───
async function buildDashUserMap(userCsv) {
    console.log(`\n🔍 Step 1: Building dashboard_user mapping (${userCsv.length} rows)...`);

    for (const u of userCsv) {
        if (!u.id || !u.user_id) continue;
        // dashboard_user.id → dashboard_user.user_id (UUID)
        dashUserMap[u.id] = u.user_id;
    }
    console.log(`   ✅ Mapped ${Object.keys(dashUserMap).length} dashboard users`);

    // Check how many UUIDs are already in idMap
    let found = 0, missing = 0;
    for (const uuid of Object.values(dashUserMap)) {
        if (idMap[uuid]) found++;
        else missing++;
    }
    console.log(`   📊 UUIDs already in dc_users: ${found}, need to create: ${missing}`);

    return { found, missing };
}

// ─── Step 2: Ensure all UUIDs have corresponding dc_users ───
async function ensureUsersExist(hashedPassword) {
    console.log(`\n🔧 Step 2: Creating missing users...`);
    let created = 0, alreadyExist = 0;

    for (const [dashId, uuid] of Object.entries(dashUserMap)) {
        if (idMap[uuid]) { alreadyExist++; continue; }

        // Try to find by UUID in email patterns
        const email = `sp_${uuid.substring(0, 8)}@migrated.com`;
        let user = await prisma.dc_users.findUnique({ where: { email } }).catch(() => null);

        if (!user) {
            user = await prisma.dc_users.create({
                data: {
                    email,
                    phone: uniquePhone(),
                    password: hashedPassword,
                    f_name: 'SpiroPatient',
                    l_name: uuid.substring(0, 8),
                    us_id_fk: 1,
                    ut_id_fk: 4,
                    is_availible: true,
                    reg_date: new Date(),
                },
            }).catch(() => null);

            if (user) created++;
        }

        if (user) {
            idMap[uuid] = user.user_id;
        }
    }

    console.log(`   ✅ Created: ${created} new users, Already exist: ${alreadyExist}`);
    return { created, alreadyExist };
}

// ─── Step 3: Migrate Observations ───
async function migrateObservations(obsCsv) {
    console.log(`\n📋 Step 3: Migrating Observations (${obsCsv.length} rows)...`);
    let created = 0, skipped = 0, noUser = 0, errors = 0;

    for (const o of obsCsv) {
        if (!o.id || !o.user_id) { skipped++; continue; }

        // Get the dashboard_user.user_id (UUID) from dashUserMap
        const uuid = dashUserMap[o.user_id];
        if (!uuid) { noUser++; continue; }

        // Get dc_users.user_id from idMap
        const dcUserId = idMap[uuid];
        if (!dcUserId) { noUser++; continue; }

        try {
            await prisma.portal_observation.create({
                data: {
                    user_id: dcUserId,
                    dbdate: toDate(o.dbdate),
                    fev1_grade: toInt(o.fev1_grade),
                    fvc_grade: toInt(o.fvc_grade),
                    is_post_bronchodilator: toBool(o.is_post_bronchodilator),
                    height: toFloat(o.height),
                },
            });
            created++;
        } catch (e) {
            errors++;
            if (errors <= 5) console.error(`   ❌ Obs error [id=${o.id}]: ${e.message}`);
        }

        if (created % BATCH_LOG_EVERY === 0) {
            console.log(`   📊 Observations: ${created} created, ${skipped} skipped, ${noUser} no-user`);
        }
    }

    console.log(`   ✅ Observations: created=${created}, skipped=${skipped}, noUser=${noUser}, errors=${errors}`);
    return created;
}

// ─── Step 4: Migrate Spirometry ───
async function migrateSpirometry(spiroCsv, obsCsv) {
    console.log(`\n📋 Step 4: Migrating Spirometry (${spiroCsv.length} rows)...`);

    // Build a lookup: original_observation_id → dashboard_observation
    const origObsMap = {};
    for (const o of obsCsv) {
        origObsMap[o.id] = o;
    }

    // Get all existing observations from DB for matching
    const allObs = await prisma.portal_observation.findMany({
        select: { id: true, user_id: true, dbdate: true }
    });
    console.log(`   📊 Found ${allObs.length} existing observations in DB`);

    let created = 0, skipped = 0, noMatch = 0, errors = 0;

    for (const s of spiroCsv) {
        if (!s.id || !s.observation_id) { skipped++; continue; }

        // Find the original observation to get user info
        const origObs = origObsMap[s.observation_id];
        if (!origObs) { noMatch++; continue; }

        // Get UUID from dashUserMap
        const uuid = dashUserMap[origObs.user_id];
        if (!uuid) { noMatch++; continue; }

        // Get dc_users.user_id
        const dcUserId = idMap[uuid];
        if (!dcUserId) { noMatch++; continue; }

        // Find matching observation in DB by user_id + date
        const dbObs = allObs.find(o =>
            o.user_id === dcUserId &&
            Math.abs(new Date(o.dbdate).getTime() - toDate(origObs.dbdate).getTime()) < 120000
        );

        if (!dbObs) { noMatch++; continue; }

        try {
            await prisma.portal_spirometry.create({
                data: {
                    observation_id: dbObs.id,
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
        } catch (e) {
            errors++;
            if (errors <= 5) console.error(`   ❌ Spiro error [id=${s.id}]: ${e.message}`);
        }

        if (created % BATCH_LOG_EVERY === 0) {
            console.log(`   📊 Spirometry: ${created} created, ${skipped} skipped, ${noMatch} no-match`);
        }
    }

    console.log(`   ✅ Spirometry: created=${created}, skipped=${skipped}, noMatch=${noMatch}, errors=${errors}`);
    return created;
}

// ─── Main ───
async function run() {
    const startTime = Date.now();
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  VitalFlow Spirometry Migration v2       ║');
    console.log('║  Correct User Mapping:                   ║');
    console.log('║  obs.user_id → dash_user.id → UUID → dc_users ║');
    console.log('╚══════════════════════════════════════════╝\n');

    loadIdMap();

    // Parse all CSVs
    console.log('📂 Loading CSV files...');
    const userCsv = parseCSV('vitalport_user.csv');
    const obsCsv = parseCSV('vitalport_observation.csv');
    const spiroCsv = parseCSV('vitalport_spirometry.csv');

    console.log(`   vitalport_user.csv: ${userCsv.length} rows`);
    console.log(`   vitalport_observation.csv: ${obsCsv.length} rows`);
    console.log(`   vitalport_spirometry.csv: ${spiroCsv.length} rows`);

    // Step 1: Build dashboard_user mapping
    await buildDashUserMap(userCsv);

    // Step 2: Create missing dc_users
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await ensureUsersExist(hashedPassword);

    saveIdMap();

    // Step 3: Migrate observations
    const obsCreated = await migrateObservations(obsCsv);

    // Step 4: Migrate spirometry
    const spiroCreated = await migrateSpirometry(spiroCsv, obsCsv);

    saveIdMap();

    // Final counts
    const finalObs = await prisma.portal_observation.count();
    const finalSpiro = await prisma.portal_spirometry.count();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║  🎉 MIGRATION COMPLETE!                  ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Observations: ${finalObs} (created: ${obsCreated})`);
    console.log(`║  Spirometry:   ${finalSpiro} (created: ${spiroCreated})`);
    console.log(`║  Duration:     ${duration}s`);
    console.log(`║  Users mapped: ${Object.keys(idMap).length}`);
    console.log('╚══════════════════════════════════════════╝');
}

run()
    .catch(e => console.error('💥 FATAL:', e))
    .finally(() => prisma.$disconnect());