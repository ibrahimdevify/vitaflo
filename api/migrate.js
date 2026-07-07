/**
 * VitalFlow PostgreSQL -> MySQL (Prisma) migration script
 *
 * Run with:  node migrate.js
 *
 * Reads CSV exports from ./migration and loads them into the MySQL schema
 * via Prisma. Safe to re-run: it rebuilds its UUID -> INT id maps from a
 * local idmaps.json cache (fast path) and falls back to reconciling against
 * existing DB rows via unique fields (email, etc.) if the cache is missing,
 * so a second run will skip records that already exist instead of erroring
 * or duplicating them.
 *
 * Migration order (per spec):
 *   Accounts -> Groups -> Users (+ users created for orphan patient/clinician
 *   rows) -> Patients -> Attributes -> Clinicians -> Admins
 *
 * Notes / things NOT migrated because no Prisma model was provided for them:
 *   - address.csv   (no `address` model in the target schema given)
 *   - fcm_tokens.csv (no `fcm_tokens` model in the target schema given)
 *   These are easy to add later once the corresponding Prisma models exist.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const MIGRATION_DIR = path.join(__dirname, 'migration');
const IDMAP_FILE = path.join(__dirname, 'idmaps.json');
const DEFAULT_PASSWORD = 'Welcome2026!';
const BATCH_LOG_EVERY = 500;

// ---------------------------------------------------------------------------
// idMaps: uuid (or other source key) -> new INT id, one map per entity type.
// Persisted to disk so re-runs don't have to rediscover everything by
// querying the DB row-by-row, but we also reconcile against the DB (see
// rebuildFromDb()) so the script is correct even if idmaps.json is deleted.
// ---------------------------------------------------------------------------
const maps = {
    account: {},   // account.csv id (UUID)          -> vf_account.id
    group: {},     // patient_group.csv id (UUID)    -> vf_patient_group.id
    user: {},      // users.csv id / any andeuser_ptr_id (UUID) -> dc_users.user_id
};

// pd cache: dc_users.user_id -> dc_patient_details.pd_id (avoids refetching)
const pdByUserId = {};

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
    fs.writeFileSync(IDMAP_FILE, JSON.stringify(maps, null, 2));
}

// ---------------------------------------------------------------------------
// Proper CSV parser: handles quoted fields, embedded commas, embedded
// newlines inside quotes, and escaped "" quotes. The naive split('\n') /
// split(',') approach breaks on any multi-line quoted field, which is a
// likely cause of the "missing records" problem described in the brief.
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
                if (content[i + 1] === '"') { // escaped quote
                    field += '"';
                    i += 2;
                    continue;
                }
                inQuotes = false;
                i++;
                continue;
            }
            field += char;
            i++;
            continue;
        }

        if (char === '"') {
            inQuotes = true;
            i++;
            continue;
        }
        if (char === ',') {
            row.push(field);
            field = '';
            i++;
            continue;
        }
        if (char === '\r') { i++; continue; }
        if (char === '\n') {
            row.push(field);
            field = '';
            rows.push(row);
            row = [];
            i++;
            continue;
        }
        field += char;
        i++;
    }
    // flush last field/row (files may or may not end with a trailing newline)
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
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

function toBool(v) {
    return String(v).trim().toLowerCase() === 'true';
}
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

// ---------------------------------------------------------------------------
// Rebuild maps from existing DB rows for anything the idmaps.json cache
// didn't already cover. Uses fields that are stable/derivable from the
// source UUID (email for users, name for accounts/groups) so re-running
// the script after losing the cache still converges correctly.
// ---------------------------------------------------------------------------
async function rebuildFromDb(accountsCsv, groupsCsv, usersCsv) {
    // Accounts: match by name (no other unique identifier exists on the row)
    for (const a of accountsCsv) {
        if (!a.id || maps.account[a.id]) continue;
        const existing = await prisma.vf_account.findFirst({ where: { name: a.name } }).catch(() => null);
        if (existing) maps.account[a.id] = existing.id;
    }
    // Groups: match by name + account_id
    for (const g of groupsCsv) {
        if (!g.id || maps.group[g.id]) continue;
        const accountId = maps.account[g.account_id] || undefined;
        const existing = await prisma.vf_patient_group
            .findFirst({ where: { name: g.name, account_id: accountId } })
            .catch(() => null);
        if (existing) maps.group[g.id] = existing.id;
    }
    // Users: match by email
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
    let created = 0, skipped = 0;
    for (const [idx, a] of rows.entries()) {
        if (!a.id) continue;
        if (maps.account[a.id]) { skipped++; continue; }
        try {
            const rec = await prisma.vf_account.create({
                data: {
                    name: truncate(a.name, 255) || 'Unnamed Account',
                    creation_date: toDateOrNull(a.creation_date) || new Date(),
                },
            });
            maps.account[a.id] = rec.id;
            created++;
        } catch (e) {
            console.error(`  account error [${a.id}]: ${e.message}`);
        }
        if ((idx + 1) % BATCH_LOG_EVERY === 0) console.log(`  processed ${idx + 1}/${rows.length}`);
    }
    console.log(`Accounts: created=${created}, alreadyMapped=${skipped}`);
}

// ---------------------------------------------------------------------------
// Step 2: Patient groups
// ---------------------------------------------------------------------------
async function migrateGroups() {
    const rows = parseCSV('patient_group.csv');
    console.log(`\n--- Patient Groups (${rows.length} rows) ---`);
    let created = 0, skipped = 0;
    for (const [idx, g] of rows.entries()) {
        if (!g.id) continue;
        if (maps.group[g.id]) { skipped++; continue; }
        try {
            const rec = await prisma.vf_patient_group.create({
                data: {
                    name: truncate(g.name, 255) || 'Unnamed Group',
                    creation_date: toDateOrNull(g.creation_date) || new Date(),
                    account_id: maps.account[g.account_id] || null,
                },
            });
            maps.group[g.id] = rec.id;
            created++;
        } catch (e) {
            console.error(`  group error [${g.id}]: ${e.message}`);
        }
        if ((idx + 1) % BATCH_LOG_EVERY === 0) console.log(`  processed ${idx + 1}/${rows.length}`);
    }
    console.log(`Groups: created=${created}, alreadyMapped=${skipped}`);
}

// ---------------------------------------------------------------------------
// Step 3: Users (from users.csv)
// ---------------------------------------------------------------------------
async function migrateUsers(usersCsv, hashedDefaultPassword) {
    console.log(`\n--- Users (${usersCsv.length} rows) ---`);
    let created = 0, skipped = 0;
    for (const [idx, u] of usersCsv.entries()) {
        if (!u.id) continue;
        if (maps.user[u.id]) { skipped++; continue; }

        const email = u.email || u.username || ('user_' + u.id.substring(0, 8) + '@migrated.com');
        try {
            let dbUser = await prisma.dc_users.findUnique({ where: { email } }).catch(() => null);
            if (!dbUser) {
                dbUser = await prisma.dc_users.create({
                    data: {
                        email,
                        phone: uniquePhone(),
                        password: hashedDefaultPassword,
                        f_name: truncate(u.username, 100) || 'Unknown',
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
        } catch (e) {
            console.error(`  user error [${u.id}] (${email}): ${e.message}`);
        }
        if ((idx + 1) % BATCH_LOG_EVERY === 0) console.log(`  processed ${idx + 1}/${usersCsv.length}`);
    }
    console.log(`Users (from users.csv): created=${created}, alreadyMapped=${skipped}`);
}

// ---------------------------------------------------------------------------
// Step 3b: Fill in users for any UUID referenced by patient/clinic rows that
// wasn't present in users.csv at all. MUST run before patients/clinicians
// are migrated so every foreign key resolves.
// ---------------------------------------------------------------------------
async function fillMissingUsers(uuids, hashedDefaultPassword, emailPrefix, defaultUtId) {
    let created = 0, alreadyMapped = 0;
    for (const uuid of uuids) {
        if (maps.user[uuid]) { alreadyMapped++; continue; }
        const email = `${emailPrefix}_${uuid.substring(0, 8)}@migrated.com`;
        try {
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
        } catch (e) {
            console.error(`  missing-user error [${uuid}]: ${e.message}`);
        }
    }
    return { created, alreadyMapped };
}

// ---------------------------------------------------------------------------
// Step 4: Patients (dc_patient_details)
// ---------------------------------------------------------------------------
async function migratePatients(patientsCsv) {
    console.log(`\n--- Patients (${patientsCsv.length} rows) ---`);
    let created = 0, skipped = 0, noUser = 0;
    const pendingClinicianAssignments = []; // { pd_id, clinicianUuid } to fix up after clinicians are migrated

    for (const [idx, p] of patientsCsv.entries()) {
        if (!p.andeuser_ptr_id) { noUser++; continue; }
        const userId = maps.user[p.andeuser_ptr_id];
        if (!userId) { noUser++; continue; }

        try {
            let existing = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
            if (existing) {
                pdByUserId[userId] = existing.pd_id;
                skipped++;
                continue;
            }

            const groupId = maps.group[p.patient_group_id] || null;
            const clinicianUuid = p.assigned_clinician_id || null;
            const clinicianId = clinicianUuid ? (maps.user[clinicianUuid] || null) : null;

            const rec = await prisma.dc_patient_details.create({
                data: {
                    user_id_fk: userId,
                    chart_no: truncate(p.access_code || ('CH' + userId), 30),
                    invite_code: truncate(p.access_code || ('INV' + userId), 30),
                    access_code: p.access_code ? truncate(p.access_code, 30) : null,
                    assigned_clinician_id: clinicianId,
                    patient_group_id: groupId,
                    graph_view: toBool(p.graph_view),
                    awair_refresh_token: p.awair_refresh_token || null,
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
        } catch (e) {
            console.error(`  patient error [${p.andeuser_ptr_id}]: ${e.message}`);
        }
        if ((idx + 1) % BATCH_LOG_EVERY === 0) console.log(`  processed ${idx + 1}/${patientsCsv.length}`);
    }
    console.log(`Patients: created=${created}, alreadyExisted=${skipped}, noMatchingUser=${noUser}`);
    return pendingClinicianAssignments;
}

// ---------------------------------------------------------------------------
// Step 5: Attributes (vf_attributes)
// ---------------------------------------------------------------------------
async function migrateAttributes(attrsCsv) {
    console.log(`\n--- Attributes (${attrsCsv.length} rows) ---`);
    let created = 0, skipped = 0, noPatient = 0;

    for (const [idx, a] of attrsCsv.entries()) {
        if (!a.patient_id) { noPatient++; continue; }
        const userId = maps.user[a.patient_id];
        if (!userId) { noPatient++; continue; }

        let pdId = pdByUserId[userId];
        if (!pdId) {
            const patient = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
            if (!patient) { noPatient++; continue; }
            pdId = patient.pd_id;
            pdByUserId[userId] = pdId;
        }

        try {
            const existing = await prisma.vf_attributes.findUnique({ where: { pd_id: pdId } }).catch(() => null);
            if (existing) { skipped++; continue; }

            await prisma.vf_attributes.create({
                data: {
                    patient: { connect: { pd_id: pdId } },
                    first_name: truncate(a.first_name, 100) || '',
                    last_name: truncate(a.last_name, 100) || '',
                    phone: a.phone ? truncate(a.phone, 30) : null,
                    dob: a.dob || '',
                    height: toFloatOrNull(a.height) || 0,
                    weight: toFloatOrNull(a.weight),
                    gender: truncate(a.gender, 20) || '',
                    ethnic_group: a.ethnic_group ? truncate(a.ethnic_group, 100) : null,
                    lookup_table: a.lookup_table || '',
                    smoking: toBool(a.smoking),
                    start_date: toDateOrNull(a.start_date) || new Date(),
                    chart_number: a.chart_number ? truncate(a.chart_number, 100) : null,
                    account_type: truncate(a.account_type || 'test', 10),
                    welcome_method: truncate(a.welcome_method || 'text', 10),
                    identify: a.identify ? truncate(a.identify, 100) : null,
                },
            });

            // best-effort backfill of the user's name from attribute data
            await prisma.dc_users.update({
                where: { user_id: userId },
                data: {
                    f_name: truncate(a.first_name, 100) || undefined,
                    l_name: truncate(a.last_name, 100) || undefined,
                },
            }).catch(() => { });

            created++;
        } catch (e) {
            console.error(`  attribute error [${a.patient_id}]: ${e.message}`);
        }
        if ((idx + 1) % BATCH_LOG_EVERY === 0) console.log(`  processed ${idx + 1}/${attrsCsv.length}`);
    }
    console.log(`Attributes: created=${created}, alreadyExisted=${skipped}, noMatchingPatient=${noPatient}`);
}

// ---------------------------------------------------------------------------
// Step 6: Clinicians (clinic.csv -> upgrade user to ut_id_fk=3 + dc_doctor_details)
// ---------------------------------------------------------------------------
async function migrateClinicians(clinicCsv, pendingClinicianAssignments) {
    console.log(`\n--- Clinicians (${clinicCsv.length} rows) ---`);
    let upgraded = 0, doctorDetailsCreated = 0, skipped = 0;

    for (const [idx, c] of clinicCsv.entries()) {
        if (!c.andeuser_ptr_id) continue;
        const userId = maps.user[c.andeuser_ptr_id];
        if (!userId) continue;

        try {
            await prisma.dc_users.update({ where: { user_id: userId }, data: { ut_id_fk: 3 } });
            upgraded++;

            const existingDoc = await prisma.dc_doctor_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
            if (existingDoc) { skipped++; }
            else {
                await prisma.dc_doctor_details.create({
                    data: {
                        user_id_fk: userId,
                        about_doctor: truncate(c.title, 255) || null,
                        license_no: `LIC-${userId}`,
                    },
                });
                doctorDetailsCreated++;
            }
        } catch (e) {
            console.error(`  clinician error [${c.andeuser_ptr_id}]: ${e.message}`);
        }
        if ((idx + 1) % BATCH_LOG_EVERY === 0) console.log(`  processed ${idx + 1}/${clinicCsv.length}`);
    }
    console.log(`Clinicians: upgraded=${upgraded}, doctorDetailsCreated=${doctorDetailsCreated}, alreadyExisted=${skipped}`);

    // Patch up patient -> clinician links that couldn't be resolved earlier
    let patched = 0;
    for (const { pd_id, clinicianUuid } of pendingClinicianAssignments) {
        const clinicianId = maps.user[clinicianUuid];
        if (!clinicianId) continue;
        try {
            await prisma.dc_patient_details.update({ where: { pd_id }, data: { assigned_clinician_id: clinicianId } });
            patched++;
        } catch (e) {
            console.error(`  clinician-link patch error [pd_id=${pd_id}]: ${e.message}`);
        }
    }
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
    for (const a of adminCsv) {
        if (!a.andeuser_ptr_id) continue;
        const userId = maps.user[a.andeuser_ptr_id];
        if (!userId) { noUser++; continue; }
        try {
            await prisma.dc_users.update({ where: { user_id: userId }, data: { ut_id_fk: 2 } });
            upgraded++;
        } catch (e) {
            console.error(`  admin error [${a.andeuser_ptr_id}]: ${e.message}`);
        }
    }
    console.log(`Admins: upgraded=${upgraded}, noMatchingUser=${noUser}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function run() {
    console.log('=== VitalFlow PostgreSQL -> MySQL Migration ===');

    loadIdMaps();

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

    // 1. Accounts
    await migrateAccounts();

    // 2. Groups
    await migrateGroups();

    // 3. Users
    await migrateUsers(usersCsv, hashedDefaultPassword);

    // 3b. Fill missing users referenced by patient.csv (must happen before Patients)
    const missingPatientUuids = new Set();
    for (const p of patientsCsv) {
        if (p.andeuser_ptr_id && !maps.user[p.andeuser_ptr_id]) missingPatientUuids.add(p.andeuser_ptr_id);
    }
    console.log(`\nMissing users referenced by patient.csv: ${missingPatientUuids.size}`);
    const patientFillResult = await fillMissingUsers(missingPatientUuids, hashedDefaultPassword, 'pt', 4);
    console.log(`Filled missing patient users: created=${patientFillResult.created}, alreadyMapped=${patientFillResult.alreadyMapped}`);

    // Also fill missing users referenced by clinic.csv, so patient->clinician
    // links and the Clinicians step both have a user to attach to.
    const missingClinicianUuids = new Set();
    for (const c of clinicCsv) {
        if (c.andeuser_ptr_id && !maps.user[c.andeuser_ptr_id]) missingClinicianUuids.add(c.andeuser_ptr_id);
    }
    console.log(`Missing users referenced by clinic.csv: ${missingClinicianUuids.size}`);
    const clinicianFillResult = await fillMissingUsers(missingClinicianUuids, hashedDefaultPassword, 'dr', 3);
    console.log(`Filled missing clinician users: created=${clinicianFillResult.created}, alreadyMapped=${clinicianFillResult.alreadyMapped}`);

    saveIdMaps(); // checkpoint before the heavier patient/attribute loops

    // 4. Patients
    const pendingClinicianAssignments = await migratePatients(patientsCsv);

    // 5. Attributes
    await migrateAttributes(attrsCsv);

    saveIdMaps();

    // 6. Clinicians
    await migrateClinicians(clinicCsv, pendingClinicianAssignments);

    // 7. Admins
    await migrateAdmins(adminCsv);

    saveIdMaps();

    console.log('\n=== FINAL COUNTS ===');
    console.log('Accounts: ' + await prisma.vf_account.count());
    console.log('Groups: ' + await prisma.vf_patient_group.count());
    console.log('Users: ' + await prisma.dc_users.count());
    console.log('Patients: ' + await prisma.dc_patient_details.count());
    console.log('Attributes: ' + await prisma.vf_attributes.count());
    console.log('Clinicians (dc_doctor_details): ' + await prisma.dc_doctor_details.count());
    console.log('Admins (ut_id_fk=2): ' + await prisma.dc_users.count({ where: { ut_id_fk: 2 } }));
    console.log('Clinicians (ut_id_fk=3): ' + await prisma.dc_users.count({ where: { ut_id_fk: 3 } }));
    console.log('Patients (ut_id_fk=4): ' + await prisma.dc_users.count({ where: { ut_id_fk: 4 } }));
}

run()
    .catch(e => console.error('FATAL:', e))
    .finally(() => prisma.$disconnect());