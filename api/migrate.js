#!/usr/bin/env node
/**
 * VitalFlow PostgreSQL -> MySQL (Prisma) migration script
 * ========================================================
 *
 * USAGE
 *   node migrate.js               Run the full migration
 *   node migrate.js --validate    Preflight only: parse & sanity-check every
 *                                 CSV and report problems. No DB writes.
 *   node migrate.js --concurrency=20   Override the default batch concurrency
 *
 * WHAT THIS DOES
 *   Reads CSV exports from ./migration and loads them into the MySQL schema
 *   via Prisma, in this order (per spec):
 *     Accounts -> Groups -> Users (+ users created for orphan patient/
 *     clinician rows) -> Patients -> Attributes -> Clinicians -> Admins
 *
 * SAFE TO RE-RUN
 *   - Users are reconciled by their unique `email`.
 *   - Accounts/Groups have no natural unique column, so this script stashes
 *     the source UUID inside their existing *_attributes side tables
 *     (`vf_account_attributes.extra` / `vf_patient_group_attributes.extra`)
 *     the first time each row is created. This survives an ephemeral
 *     filesystem (e.g. Render without a persistent disk wiping local
 *     idmaps.json on every restart) because the UUID lives in MySQL, not
 *     on disk.
 *   - idmaps.json is still used as a fast-path cache; it's optional.
 *   - Every create is preceded by an existence check on the relevant unique
 *     field, so a second run skips what's already there instead of erroring
 *     or duplicating it.
 *
 * NOT MIGRATED (no corresponding Prisma model was provided)
 *   - address.csv, fcm_tokens.csv
 *
 * KNOWN ASSUMPTION TO VERIFY
 *   - dc_doctor_details.ps_id_fk is a required column with no source data
 *     and no specialization table in the schema. It's defaulted to
 *     DEFAULT_SPECIALIZATION_ID below. Confirm that's valid for your DB.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const VALIDATE_ONLY = args.includes('--validate') || args.includes('--validate-only');
const concurrencyArg = args.find(a => a.startsWith('--concurrency='));
const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg.split('=')[1], 10) : 10;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const MIGRATION_DIR = path.join(__dirname, 'migration');
const IDMAP_FILE = path.join(__dirname, 'idmaps.json');
const REPORT_FILE = path.join(__dirname, 'migration-report.json');
const DEFAULT_PASSWORD = 'Welcome2026!';
const BATCH_LOG_EVERY = 500;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// dc_doctor_details.ps_id_fk is required in the schema but there is no
// specialization data anywhere in the source CSVs and no `ps` table in the
// provided Prisma schema to look one up in. Defaulting to 1 so the row can
// be created at all - if your DB has a real specializations table with no
// row at id=1, change this (or set MIGRATION_DEFAULT_PS_ID env var) or the
// insert will fail with a foreign key constraint error.
const DEFAULT_SPECIALIZATION_ID = parseInt(process.env.MIGRATION_DEFAULT_PS_ID || '1', 10);

const prisma = VALIDATE_ONLY ? null : new PrismaClient();

// ---------------------------------------------------------------------------
// idMaps: uuid -> new INT id, one map per entity type. Persisted to disk as
// a fast-path cache; rebuildFromDb() reconciles against MySQL directly so
// correctness never depends on this file surviving a restart.
// ---------------------------------------------------------------------------
const maps = { account: {}, group: {}, user: {} };
const pdByUserId = {}; // dc_users.user_id -> dc_patient_details.pd_id

let phoneCounter = 0;
function uniquePhone() {
    phoneCounter++;
    return 'mig-' + Date.now() + '-' + phoneCounter;
}

function loadIdMaps() {
    if (fs.existsSync(IDMAP_FILE)) {
        try {
            const saved = JSON.parse(fs.readFileSync(IDMAP_FILE, 'utf8'));
            Object.assign(maps.account, saved.account || {});
            Object.assign(maps.group, saved.group || {});
            Object.assign(maps.user, saved.user || {});
            console.log(
                `Loaded idmaps.json cache (accounts=${Object.keys(maps.account).length}, ` +
                `groups=${Object.keys(maps.group).length}, users=${Object.keys(maps.user).length})`
            );
        } catch (e) {
            console.warn('Could not parse idmaps.json, ignoring cache:', e.message);
        }
    }
}
function saveIdMaps() {
    try {
        fs.writeFileSync(IDMAP_FILE, JSON.stringify(maps, null, 2));
    } catch (e) {
        console.warn('Could not write idmaps.json (non-fatal):', e.message);
    }
}

// Save on any interruption so progress isn't lost mid-run.
let shuttingDown = false;
function registerGracefulShutdown() {
    const handler = (signal) => {
        if (shuttingDown) return;
        shuttingDown = true;
        console.log(`\nReceived ${signal}, saving idmaps.json before exit...`);
        saveIdMaps();
        prisma?.$disconnect().finally(() => process.exit(1));
    };
    process.on('SIGINT', handler);
    process.on('SIGTERM', handler);
}

// ---------------------------------------------------------------------------
// CSV parser: RFC4180-style, handles quoted fields, embedded commas,
// embedded newlines inside quotes, and escaped "" quotes.
// ---------------------------------------------------------------------------
function parseCSV(filename) {
    const filepath = path.join(MIGRATION_DIR, filename);
    if (!fs.existsSync(filepath)) {
        console.warn(`  (missing file, skipping) ${filename}`);
        return [];
    }
    const content = fs.readFileSync(filepath, 'utf8');
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    let i = 0;
    const len = content.length;

    while (i < len) {
        const char = content[i];
        if (inQuotes) {
            if (char === '"') {
                if (content[i + 1] === '"') { field += '"'; i += 2; continue; }
                inQuotes = false; i++; continue;
            }
            field += char; i++; continue;
        }
        if (char === '"') { inQuotes = true; i++; continue; }
        if (char === ',') { row.push(field); field = ''; i++; continue; }
        if (char === '\r') { i++; continue; }
        if (char === '\n') { row.push(field); field = ''; rows.push(row); row = []; i++; continue; }
        field += char; i++;
    }
    if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
    if (rows.length === 0) return [];

    const headers = rows[0].map(h => h.trim());
    const out = [];
    for (let r = 1; r < rows.length; r++) {
        const values = rows[r];
        if (values.length === 1 && values[0] === '') continue; // blank trailing line
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = values[idx] !== undefined ? values[idx] : ''; });
        out.push(obj);
    }
    return out;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
function toBool(v) { return String(v).trim().toLowerCase() === 'true'; }
function toFloatOrNull(v) {
    if (v === undefined || v === null || String(v).trim() === '') return null;
    const n = parseFloat(v);
    return Number.isNaN(n) ? null : n;
}
function toDateOrNull(v) {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
}
function truncate(v, len) {
    if (v === undefined || v === null) return null;
    return String(v).substring(0, len);
}
function isUuid(v) { return typeof v === 'string' && UUID_RE.test(v.trim()); }

/**
 * Run `workerFn` over `items` with bounded concurrency, instead of either
 * fully sequential (slow for 10k rows) or a single unbounded Promise.all
 * (can exhaust the DB connection pool). Each item's errors are caught and
 * logged individually so one bad row never aborts the batch.
 */
async function runConcurrent(items, concurrency, label, workerFn) {
    let processed = 0;
    let cursor = 0;
    const total = items.length;

    async function worker() {
        while (true) {
            const idx = cursor++;
            if (idx >= total) return;
            try {
                await workerFn(items[idx], idx);
            } catch (e) {
                console.error(`  ${label} error: ${e.message}`);
            }
            processed++;
            if (processed % BATCH_LOG_EVERY === 0 || processed === total) {
                console.log(`  ${label}: processed ${processed}/${total}`);
            }
        }
    }
    const workers = Array.from({ length: Math.min(concurrency, Math.max(total, 1)) }, worker);
    await Promise.all(workers);
}

// ---------------------------------------------------------------------------
// VALIDATION MODE - no DB writes, just sanity-checks the CSV export itself.
// ---------------------------------------------------------------------------
const REQUIRED_COLUMNS = {
    'users.csv': ['id', 'username', 'email', 'password', 'date_joined', 'is_active'],
    'patient.csv': ['andeuser_ptr_id', 'access_code', 'graph_view', 'status', 'rpm_consent', 'assigned_clinician_id', 'patient_group_id'],
    'attribute.csv': ['id', 'first_name', 'last_name', 'dob', 'height', 'weight', 'gender', 'patient_id', 'account_type'],
    'clinic.csv': ['andeuser_ptr_id', 'title', 'account_id'],
    'account_admin.csv': ['andeuser_ptr_id', 'is_staff'],
    'account.csv': ['id', 'name', 'creation_date'],
    'patient_group.csv': ['id', 'name', 'creation_date', 'account_id'],
};

function validateCsvs() {
    console.log('=== VALIDATE MODE: no database writes will be made ===\n');
    const data = {};
    const problems = [];
    const info = [];

    for (const [filename, requiredCols] of Object.entries(REQUIRED_COLUMNS)) {
        const rows = parseCSV(filename);
        data[filename] = rows;
        if (rows.length === 0) {
            problems.push(`${filename}: 0 rows parsed (missing file, or empty after header)`);
            continue;
        }
        const actualCols = new Set(Object.keys(rows[0]));
        const missingCols = requiredCols.filter(c => !actualCols.has(c));
        if (missingCols.length) {
            problems.push(`${filename}: missing expected column(s): ${missingCols.join(', ')}`);
        }
        info.push(`${filename}: ${rows.length} rows, columns: ${Object.keys(rows[0]).join(', ')}`);
    }

    console.log(info.join('\n'));

    if (data['users.csv']?.length) {
        const ids = data['users.csv'].map(u => u.id);
        const badUuids = ids.filter(id => id && !isUuid(id));
        const dupes = ids.length - new Set(ids).size;
        const badEmails = data['users.csv'].filter(u => u.email && !EMAIL_RE.test(u.email)).length;
        if (badUuids.length) problems.push(`users.csv: ${badUuids.length} row(s) with malformed id (not a UUID)`);
        if (dupes) problems.push(`users.csv: ${dupes} duplicate id value(s)`);
        if (badEmails) problems.push(`users.csv: ${badEmails} row(s) with malformed email (will fall back to username-based email)`);
    }

    if (data['patient.csv']?.length && data['users.csv']?.length) {
        const userIds = new Set(data['users.csv'].map(u => u.id));
        const orphanPatients = data['patient.csv'].filter(p => p.andeuser_ptr_id && !userIds.has(p.andeuser_ptr_id)).length;
        console.log(`\npatient.csv rows with no matching users.csv row (will get an auto-created user): ${orphanPatients}`);
    }

    if (data['clinic.csv']?.length && data['users.csv']?.length) {
        const userIds = new Set(data['users.csv'].map(u => u.id));
        const orphanClinicians = data['clinic.csv'].filter(c => c.andeuser_ptr_id && !userIds.has(c.andeuser_ptr_id)).length;
        console.log(`clinic.csv rows with no matching users.csv row (will get an auto-created user): ${orphanClinicians}`);
    }

    if (data['clinic.csv']?.length && data['account.csv']?.length) {
        const accountIds = new Set(data['account.csv'].map(a => a.id));
        const missingHospital = data['clinic.csv'].filter(c => c.account_id && !accountIds.has(c.account_id)).length;
        if (missingHospital) problems.push(`clinic.csv: ${missingHospital} row(s) reference an account_id not found in account.csv (dc_doctor_details requires a hospital - these rows will be skipped for that table)`);
    }

    if (data['patient_group.csv']?.length && data['account.csv']?.length) {
        const accountIds = new Set(data['account.csv'].map(a => a.id));
        const missingAccount = data['patient_group.csv'].filter(g => g.account_id && !accountIds.has(g.account_id)).length;
        if (missingAccount) problems.push(`patient_group.csv: ${missingAccount} row(s) reference an account_id not found in account.csv (account_id is required on vf_patient_group - these rows will be skipped)`);
    }

    if (data['attribute.csv']?.length) {
        const dupPatientIds = data['attribute.csv'].map(a => a.patient_id);
        const dupes = dupPatientIds.length - new Set(dupPatientIds.filter(Boolean)).size;
        if (dupes) problems.push(`attribute.csv: ${dupes} duplicate patient_id value(s) (vf_attributes.pd_id is unique - only the first per patient will be kept)`);
    }

    console.log('\n=== VALIDATION RESULT ===');
    if (problems.length === 0) {
        console.log('No problems found. Safe to run the full migration: node migrate.js');
    } else {
        console.log(`${problems.length} issue(s) found:`);
        problems.forEach(p => console.log('  - ' + p));
        console.log('\nThese are warnings, not hard blockers - the migration will skip/log affected rows individually rather than fail outright. Review before running the full migration.');
    }
}

// ---------------------------------------------------------------------------
// Durable UUID stash for accounts/groups (see file header for why).
// ---------------------------------------------------------------------------
async function stashAccountUuid(accountId, uuid) {
    await prisma.vf_account_attributes.upsert({
        where: { account_id: accountId },
        create: { account_id: accountId, extra: { source_uuid: uuid } },
        update: { extra: { source_uuid: uuid } },
    }).catch(e => console.error(`  could not stash uuid for account ${accountId}: ${e.message}`));
}
async function stashGroupUuid(groupId, uuid) {
    await prisma.vf_patient_group_attributes.upsert({
        where: { group_id: groupId },
        create: { group_id: groupId, extra: { source_uuid: uuid } },
        update: { extra: { source_uuid: uuid } },
    }).catch(e => console.error(`  could not stash uuid for group ${groupId}: ${e.message}`));
}
async function findAccountIdByUuid(uuid) {
    const attr = await prisma.vf_account_attributes
        .findFirst({ where: { extra: { path: ['source_uuid'], equals: uuid } } })
        .catch(() => null);
    return attr ? attr.account_id : null;
}
async function findGroupIdByUuid(uuid) {
    const attr = await prisma.vf_patient_group_attributes
        .findFirst({ where: { extra: { path: ['source_uuid'], equals: uuid } } })
        .catch(() => null);
    return attr ? attr.group_id : null;
}

async function rebuildFromDb(accountsCsv, groupsCsv, usersCsv) {
    for (const a of accountsCsv) {
        if (!a.id || maps.account[a.id]) continue;
        const byUuid = await findAccountIdByUuid(a.id);
        if (byUuid) { maps.account[a.id] = byUuid; continue; }
        const existing = await prisma.vf_account.findFirst({ where: { name: a.name } }).catch(() => null);
        if (existing) {
            maps.account[a.id] = existing.id;
            await stashAccountUuid(existing.id, a.id);
        }
    }
    for (const g of groupsCsv) {
        if (!g.id || maps.group[g.id]) continue;
        const byUuid = await findGroupIdByUuid(g.id);
        if (byUuid) { maps.group[g.id] = byUuid; continue; }
        const accountId = maps.account[g.account_id] || undefined;
        const existing = await prisma.vf_patient_group
            .findFirst({ where: { name: g.name, account_id: accountId } })
            .catch(() => null);
        if (existing) {
            maps.group[g.id] = existing.id;
            await stashGroupUuid(existing.id, g.id);
        }
    }
    for (const u of usersCsv) {
        if (!u.id || maps.user[u.id]) continue;
        const email = u.email || u.username;
        if (!email) continue;
        const existing = await prisma.dc_users.findUnique({ where: { email } }).catch(() => null);
        if (existing) maps.user[u.id] = existing.user_id;
    }
}

// ---------------------------------------------------------------------------
// Step 1: Accounts
// ---------------------------------------------------------------------------
async function migrateAccounts() {
    const rows = parseCSV('account.csv');
    console.log(`\n--- Accounts (${rows.length} rows) ---`);
    let created = 0, skipped = 0, invalid = 0;

    await runConcurrent(rows, CONCURRENCY, 'accounts', async (a) => {
        if (!a.id) { invalid++; return; }
        if (maps.account[a.id]) { skipped++; return; }
        const rec = await prisma.vf_account.create({
            data: {
                name: truncate(a.name, 50) || 'Unnamed Account', // schema caps this at VarChar(50)
                creation_date: toDateOrNull(a.creation_date) || new Date(),
            },
        });
        maps.account[a.id] = rec.id;
        await stashAccountUuid(rec.id, a.id);
        created++;
    });
    console.log(`Accounts: created=${created}, alreadyMapped=${skipped}, invalidRows=${invalid}`);
}

// ---------------------------------------------------------------------------
// Step 2: Patient groups
// ---------------------------------------------------------------------------
async function migrateGroups() {
    const rows = parseCSV('patient_group.csv');
    console.log(`\n--- Patient Groups (${rows.length} rows) ---`);
    let created = 0, skipped = 0, noAccount = 0;

    await runConcurrent(rows, CONCURRENCY, 'groups', async (g) => {
        if (!g.id) return;
        if (maps.group[g.id]) { skipped++; return; }
        const accountId = maps.account[g.account_id];
        if (!accountId) {
            noAccount++;
            console.error(`  group error [${g.id}]: no matching account for account_id=${g.account_id} (account_id is required, skipping)`);
            return;
        }
        const rec = await prisma.vf_patient_group.create({
            data: {
                name: truncate(g.name, 100) || 'Unnamed Group',
                creation_date: toDateOrNull(g.creation_date) || new Date(),
                account_id: accountId,
            },
        });
        maps.group[g.id] = rec.id;
        await stashGroupUuid(rec.id, g.id);
        created++;
    });
    console.log(`Groups: created=${created}, alreadyMapped=${skipped}, noMatchingAccount=${noAccount}`);
}

// ---------------------------------------------------------------------------
// Step 3: Users (from users.csv)
// ---------------------------------------------------------------------------
async function migrateUsers(usersCsv, hashedDefaultPassword) {
    console.log(`\n--- Users (${usersCsv.length} rows) ---`);
    let created = 0, skipped = 0;

    await runConcurrent(usersCsv, CONCURRENCY, 'users', async (u) => {
        if (!u.id) return;
        if (maps.user[u.id]) { skipped++; return; }

        const rawEmail = u.email && EMAIL_RE.test(u.email) ? u.email : null;
        const email = rawEmail || u.username || ('user_' + u.id.substring(0, 8) + '@migrated.com');

        let dbUser = await prisma.dc_users.findUnique({ where: { email } }).catch(() => null);
        if (!dbUser) {
            dbUser = await prisma.dc_users.create({
                data: {
                    email,
                    phone: uniquePhone(),
                    password: hashedDefaultPassword,
                    f_name: truncate(u.username, 255) || 'Unknown',
                    l_name: '',
                    us_id_fk: toBool(u.is_active) ? 1 : 2,
                    ut_id_fk: 4, // default patient; upgraded to clinician/admin later
                    is_availible: toBool(u.is_active),
                    reg_date: toDateOrNull(u.date_joined) || new Date(),
                },
            });
            created++;
        }
        maps.user[u.id] = dbUser.user_id;
    });
    console.log(`Users (from users.csv): created=${created}, alreadyMapped=${skipped}`);
}

// ---------------------------------------------------------------------------
// Step 3b: Fill in users for any UUID referenced by patient/clinic rows that
// wasn't present in users.csv at all. MUST run before patients/clinicians.
// ---------------------------------------------------------------------------
async function fillMissingUsers(uuidSet, hashedDefaultPassword, emailPrefix, defaultUtId) {
    const uuids = Array.from(uuidSet);
    let created = 0, alreadyMapped = 0;

    await runConcurrent(uuids, CONCURRENCY, `missing-users(${emailPrefix})`, async (uuid) => {
        if (maps.user[uuid]) { alreadyMapped++; return; }
        const email = `${emailPrefix}_${uuid.substring(0, 8)}@migrated.com`;
        let dbUser = await prisma.dc_users.findUnique({ where: { email } }).catch(() => null);
        if (!dbUser) {
            dbUser = await prisma.dc_users.create({
                data: {
                    email,
                    phone: uniquePhone(),
                    password: hashedDefaultPassword,
                    f_name: 'Migrated',
                    l_name: uuid.substring(0, 8),
                    us_id_fk: 1,
                    ut_id_fk: defaultUtId,
                    is_availible: true,
                    reg_date: new Date(),
                },
            });
            created++;
        }
        maps.user[uuid] = dbUser.user_id;
    });
    return { created, alreadyMapped };
}

// ---------------------------------------------------------------------------
// Step 4: Patients (dc_patient_details)
// ---------------------------------------------------------------------------
async function migratePatients(patientsCsv) {
    console.log(`\n--- Patients (${patientsCsv.length} rows) ---`);
    let created = 0, skipped = 0, noUser = 0;
    const pendingClinicianAssignments = []; // { pd_id, clinicianUuid }

    await runConcurrent(patientsCsv, CONCURRENCY, 'patients', async (p) => {
        if (!p.andeuser_ptr_id) { noUser++; return; }
        const userId = maps.user[p.andeuser_ptr_id];
        if (!userId) { noUser++; return; }

        const existing = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
        if (existing) {
            pdByUserId[userId] = existing.pd_id;
            skipped++;
            return;
        }

        const groupId = maps.group[p.patient_group_id] || null;
        const clinicianUuid = p.assigned_clinician_id || null;
        const clinicianId = clinicianUuid ? (maps.user[clinicianUuid] || null) : null;

        const rec = await prisma.dc_patient_details.create({
            data: {
                user_id_fk: userId,
                chart_no: truncate(p.access_code || ('CH' + userId), 255),
                invite_code: truncate(p.access_code || ('INV' + userId), 255),
                access_code: p.access_code ? truncate(p.access_code, 200) : null,
                assigned_clinician_id: clinicianId,
                patient_group_id: groupId,
                graph_view: p.graph_view === '' ? true : toBool(p.graph_view),
                awair_refresh_token: p.awair_refresh_token ? truncate(p.awair_refresh_token, 200) : null,
                date_spirometer_received: toDateOrNull(p.date_spirometer_received),
                rpm_consent: toBool(p.rpm_consent),
                status: truncate(p.status || 'unverified', 50),
            },
        });
        pdByUserId[userId] = rec.pd_id;
        created++;

        // clinician user might not exist yet (Clinicians step runs after
        // Patients); remember it so we can patch it in once available.
        if (clinicianUuid && !clinicianId) {
            pendingClinicianAssignments.push({ pd_id: rec.pd_id, clinicianUuid });
        }
    });
    console.log(`Patients: created=${created}, alreadyExisted=${skipped}, noMatchingUser=${noUser}`);
    return pendingClinicianAssignments;
}

// ---------------------------------------------------------------------------
// Step 5: Attributes (vf_attributes)
// ---------------------------------------------------------------------------
async function migrateAttributes(attrsCsv) {
    console.log(`\n--- Attributes (${attrsCsv.length} rows) ---`);
    let created = 0, skipped = 0, noPatient = 0;
    const seenPdIds = new Set(); // attribute.csv can contain duplicate patient_id rows; pd_id is unique

    await runConcurrent(attrsCsv, CONCURRENCY, 'attributes', async (a) => {
        if (!a.patient_id) { noPatient++; return; }
        const userId = maps.user[a.patient_id];
        if (!userId) { noPatient++; return; }

        let pdId = pdByUserId[userId];
        if (!pdId) {
            const patient = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
            if (!patient) { noPatient++; return; }
            pdId = patient.pd_id;
            pdByUserId[userId] = pdId;
        }

        if (seenPdIds.has(pdId)) { skipped++; return; } // duplicate patient_id within this run
        seenPdIds.add(pdId);

        const existing = await prisma.vf_attributes.findUnique({ where: { pd_id: pdId } }).catch(() => null);
        if (existing) { skipped++; return; }

        await prisma.vf_attributes.create({
            data: {
                patient: { connect: { pd_id: pdId } },
                first_name: truncate(a.first_name, 100) || '',
                last_name: truncate(a.last_name, 100) || '',
                phone: a.phone ? truncate(a.phone, 20) : null,
                dob: truncate(a.dob, 20) || '',
                height: toFloatOrNull(a.height) || 0,
                weight: toFloatOrNull(a.weight),
                gender: truncate(a.gender, 20) || '',
                ethnic_group: a.ethnic_group ? truncate(a.ethnic_group, 100) : null,
                lookup_table: truncate(a.lookup_table, 100) || '',
                smoking: toBool(a.smoking),
                start_date: toDateOrNull(a.start_date) || new Date(),
                chart_number: a.chart_number ? truncate(a.chart_number, 100) : null,
                account_type: truncate(a.account_type || 'test', 10),
                welcome_method: truncate(a.welcome_method || 'text', 10),
                identify: a.identify ? truncate(a.identify, 255) : null,
            },
        });

        // best-effort backfill of the user's name from attribute data
        await prisma.dc_users.update({
            where: { user_id: userId },
            data: {
                f_name: truncate(a.first_name, 255) || undefined,
                l_name: truncate(a.last_name, 255) || undefined,
            },
        }).catch(() => { });

        created++;
    });
    console.log(`Attributes: created=${created}, alreadyExistedOrDuplicate=${skipped}, noMatchingPatient=${noPatient}`);
}

// ---------------------------------------------------------------------------
// Step 6: Clinicians (clinic.csv -> upgrade user to ut_id_fk=3 + dc_doctor_details)
// ---------------------------------------------------------------------------
async function migrateClinicians(clinicCsv, pendingClinicianAssignments) {
    console.log(`\n--- Clinicians (${clinicCsv.length} rows) ---`);
    let upgraded = 0, doctorDetailsCreated = 0, skipped = 0, noHospital = 0;

    await runConcurrent(clinicCsv, CONCURRENCY, 'clinicians', async (c) => {
        if (!c.andeuser_ptr_id) return;
        const userId = maps.user[c.andeuser_ptr_id];
        if (!userId) return;

        await prisma.dc_users.update({ where: { user_id: userId }, data: { ut_id_fk: 3 } });
        upgraded++;

        const existingDoc = await prisma.dc_doctor_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
        if (existingDoc) { skipped++; return; }

        // h_id_fk ("hospital") is a required FK to vf_account - clinic.csv's
        // account_id is the natural source for it. ps_id_fk (specialization)
        // is also required but there is no source data or schema table for
        // it, so it falls back to DEFAULT_SPECIALIZATION_ID (see file header).
        const hospitalId = maps.account[c.account_id];
        if (!hospitalId) {
            noHospital++;
            console.error(`  clinician error [${c.andeuser_ptr_id}]: no matching account/hospital for account_id=${c.account_id}, skipping dc_doctor_details`);
            return;
        }
        await prisma.dc_doctor_details.create({
            data: {
                user_id_fk: userId,
                about_doctor: truncate(c.title, 255) || 'doctor',
                license_no: `LIC-${userId}`,
                h_id_fk: hospitalId,
                ps_id_fk: DEFAULT_SPECIALIZATION_ID,
            },
        });
        doctorDetailsCreated++;
    });

    console.log(`Clinicians: upgraded=${upgraded}, doctorDetailsCreated=${doctorDetailsCreated}, alreadyExisted=${skipped}, noMatchingHospital=${noHospital}`);

    // Patch up patient -> clinician links that couldn't be resolved earlier
    let patched = 0;
    await runConcurrent(pendingClinicianAssignments, CONCURRENCY, 'clinician-link-patch', async ({ pd_id, clinicianUuid }) => {
        const clinicianId = maps.user[clinicianUuid];
        if (!clinicianId) return;
        await prisma.dc_patient_details.update({ where: { pd_id }, data: { assigned_clinician_id: clinicianId } });
        patched++;
    });
    if (pendingClinicianAssignments.length) {
        console.log(`Patched ${patched}/${pendingClinicianAssignments.length} deferred patient->clinician links`);
    }
}

// ---------------------------------------------------------------------------
// Step 7: Admins (account_admin.csv -> upgrade user to ut_id_fk=2)
// ---------------------------------------------------------------------------
async function migrateAdmins(adminCsv) {
    console.log(`\n--- Admins (${adminCsv.length} rows) ---`);
    let upgraded = 0, noUser = 0;

    await runConcurrent(adminCsv, CONCURRENCY, 'admins', async (a) => {
        if (!a.andeuser_ptr_id) return;
        const userId = maps.user[a.andeuser_ptr_id];
        if (!userId) { noUser++; return; }
        await prisma.dc_users.update({ where: { user_id: userId }, data: { ut_id_fk: 2 } });
        upgraded++;
    });
    console.log(`Admins: upgraded=${upgraded}, noMatchingUser=${noUser}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function run() {
    const startedAt = Date.now();
    console.log('=== VitalFlow PostgreSQL -> MySQL Migration ===');
    console.log(`Concurrency: ${CONCURRENCY}`);

    loadIdMaps();
    registerGracefulShutdown();

    const accountsCsv = parseCSV('account.csv');
    const groupsCsv = parseCSV('patient_group.csv');
    const usersCsv = parseCSV('users.csv');
    const patientsCsv = parseCSV('patient.csv');
    const attrsCsv = parseCSV('attribute.csv');
    const clinicCsv = parseCSV('clinic.csv');
    const adminCsv = parseCSV('account_admin.csv');

    console.log('\nReconciling id maps against existing DB rows (in case idmaps.json is missing/partial)...');
    await rebuildFromDb(accountsCsv, groupsCsv, usersCsv);

    const hashedDefaultPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    await migrateAccounts();
    await migrateGroups();
    await migrateUsers(usersCsv, hashedDefaultPassword);

    const missingPatientUuids = new Set(
        patientsCsv.filter(p => p.andeuser_ptr_id && !maps.user[p.andeuser_ptr_id]).map(p => p.andeuser_ptr_id)
    );
    console.log(`\nMissing users referenced by patient.csv: ${missingPatientUuids.size}`);
    const patientFillResult = await fillMissingUsers(missingPatientUuids, hashedDefaultPassword, 'pt', 4);
    console.log(`Filled missing patient users: created=${patientFillResult.created}, alreadyMapped=${patientFillResult.alreadyMapped}`);

    const missingClinicianUuids = new Set(
        clinicCsv.filter(c => c.andeuser_ptr_id && !maps.user[c.andeuser_ptr_id]).map(c => c.andeuser_ptr_id)
    );
    console.log(`Missing users referenced by clinic.csv: ${missingClinicianUuids.size}`);
    const clinicianFillResult = await fillMissingUsers(missingClinicianUuids, hashedDefaultPassword, 'dr', 3);
    console.log(`Filled missing clinician users: created=${clinicianFillResult.created}, alreadyMapped=${clinicianFillResult.alreadyMapped}`);

    saveIdMaps(); // checkpoint before the heavier patient/attribute loops

    const pendingClinicianAssignments = await migratePatients(patientsCsv);
    await migrateAttributes(attrsCsv);
    saveIdMaps();

    await migrateClinicians(clinicCsv, pendingClinicianAssignments);
    await migrateAdmins(adminCsv);
    saveIdMaps();

    const finalCounts = {
        accounts: await prisma.vf_account.count(),
        groups: await prisma.vf_patient_group.count(),
        users: await prisma.dc_users.count(),
        patients: await prisma.dc_patient_details.count(),
        attributes: await prisma.vf_attributes.count(),
        clinicians_doctor_details: await prisma.dc_doctor_details.count(),
        admins_by_type: await prisma.dc_users.count({ where: { ut_id_fk: 2 } }),
        clinicians_by_type: await prisma.dc_users.count({ where: { ut_id_fk: 3 } }),
        patients_by_type: await prisma.dc_users.count({ where: { ut_id_fk: 4 } }),
    };

    console.log('\n=== FINAL COUNTS ===');
    Object.entries(finalCounts).forEach(([k, v]) => console.log(`${k}: ${v}`));

    const durationSec = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`\nDone in ${durationSec}s.`);

    try {
        fs.writeFileSync(REPORT_FILE, JSON.stringify({ finishedAt: new Date().toISOString(), durationSec, finalCounts }, null, 2));
        console.log(`Report written to ${REPORT_FILE}`);
    } catch (e) {
        console.warn('Could not write migration-report.json (non-fatal):', e.message);
    }
}

if (VALIDATE_ONLY) {
    validateCsvs();
} else {
    run()
        .catch(e => console.error('FATAL:', e))
        .finally(() => prisma?.$disconnect());
}