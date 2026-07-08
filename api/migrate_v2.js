const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const MIGRATION_DIR = path.join(__dirname, 'migration');
const DEFAULT_PASSWORD = 'Welcome2026!';
const BATCH_LOG_EVERY = 500;

let phoneCounter = Date.now();
function uniquePhone() { phoneCounter++; return 'mig-' + phoneCounter; }

function parseCSV(filename) {
    const filepath = path.join(MIGRATION_DIR, filename);
    if (!fs.existsSync(filepath)) { console.log('File not found: ' + filename); return []; }
    const content = fs.readFileSync(filepath, 'utf8');
    const rows = [], len = content.length;
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < len; i++) {
        const char = content[i];
        if (inQuotes) { if (char === '"') { inQuotes = false; continue; } field += char; continue; }
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

function toBool(v) { return String(v).toLowerCase() === 'true'; }
function toFloat(v) { if (!v || v === 'None' || v === 'NULL') return null; const n = parseFloat(v); return isNaN(n) ? null : n; }
function toDate(v) { if (!v) return new Date(); const d = new Date(v); return isNaN(d.getTime()) ? new Date() : d; }
function trunc(v, len) { if (!v) return null; return String(v).substring(0, len); }

async function run() {
    console.log('=== VitalFlow Migration v2 (with UUIDs) ===\n');
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // ─── Step 1: Accounts ───
    console.log('1/8 Migrating Accounts...');
    const accounts = parseCSV('account.csv');
    for (const a of accounts) {
        if (!a.id || !a.name) continue;
        await prisma.vf_account.create({
            data: { name: trunc(a.name, 50), creation_date: toDate(a.creation_date) }
        }).catch(() => { });
    }
    console.log('   Accounts: ' + await prisma.vf_account.count());

    // ─── Step 2: Groups ───
    console.log('2/8 Migrating Groups...');
    const groups = parseCSV('patient_group.csv');
    for (const g of groups) {
        if (!g.id || !g.name) continue;
        await prisma.vf_patient_group.create({
            data: { name: trunc(g.name, 100), creation_date: toDate(g.creation_date), account_id: 1 }
        }).catch(() => { });
    }
    console.log('   Groups: ' + await prisma.vf_patient_group.count());

    // ─── Step 3: Users (with source_uuid!) ───
    console.log('3/8 Migrating Users (with UUIDs)...');
    const users = parseCSV('users.csv');
    let userCount = 0;
    for (const u of users) {
        if (!u.id) continue;
        const email = u.email || u.username || 'user_' + u.id.substring(0, 8) + '@migrated.com';
        try {
            await prisma.dc_users.create({
                data: {
                    email,
                    phone: uniquePhone(),
                    password: hashedPassword,
                    f_name: trunc(u.username || 'User', 255) || 'User',
                    l_name: '',
                    us_id_fk: toBool(u.is_active) ? 1 : 2,
                    ut_id_fk: 4,
                    is_availible: true,
                    reg_date: toDate(u.date_joined),
                    source_uuid: u.id,  // 🔑 STORING THE UUID!
                }
            });
            userCount++;
            if (userCount % 1000 === 0) console.log('   Users: ' + userCount);
        } catch (e) { /* skip duplicates */ }
    }
    console.log('   Users: ' + userCount);

    // ─── Step 4: Patients ───
    console.log('4/8 Migrating Patients...');
    const patients = parseCSV('patient.csv');
    let patCount = 0;
    for (const p of patients) {
        if (!p.andeuser_ptr_id) continue;
        const user = await prisma.dc_users.findUnique({ where: { source_uuid: p.andeuser_ptr_id } }).catch(() => null);
        if (!user) continue;
        try {
            await prisma.dc_patient_details.create({
                data: {
                    user_id_fk: user.user_id,
                    chart_no: trunc(p.access_code || 'CH' + user.user_id, 255),
                    invite_code: trunc(p.access_code || 'INV' + user.user_id, 255),
                    status: trunc(p.status || 'unverified', 50),
                    graph_view: toBool(p.graph_view),
                    rpm_consent: toBool(p.rpm_consent),
                }
            });
            patCount++;
        } catch (e) { }
    }
    console.log('   Patients: ' + patCount);

    // ─── Step 5: Attributes ───
    console.log('5/8 Migrating Attributes...');
    const attrs = parseCSV('attribute.csv');
    let attrCount = 0;
    for (const a of attrs) {
        if (!a.patient_id) continue;
        const user = await prisma.dc_users.findUnique({ where: { source_uuid: a.patient_id } }).catch(() => null);
        if (!user) continue;
        const patient = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: user.user_id } }).catch(() => null);
        if (!patient) continue;
        try {
            await prisma.vf_attributes.create({
                data: {
                    patient: { connect: { pd_id: patient.pd_id } },
                    first_name: trunc(a.first_name, 100) || '',
                    last_name: trunc(a.last_name, 100) || '',
                    dob: trunc(a.dob, 20) || '',
                    height: toFloat(a.height) || 0,
                    weight: toFloat(a.weight),
                    gender: trunc(a.gender, 20) || '',
                    ethnic_group: trunc(a.ethnic_group, 100),
                    lookup_table: trunc(a.lookup_table, 100) || '',
                    smoking: toBool(a.smoking),
                    start_date: toDate(a.start_date),
                    chart_number: trunc(a.chart_number, 100),
                    account_type: trunc(a.account_type || 'test', 10),
                    welcome_method: trunc(a.welcome_method || 'text', 10),
                }
            });
            attrCount++;
            if (attrCount % 1000 === 0) console.log('   Attrs: ' + attrCount);
        } catch (e) { }
    }
    console.log('   Attributes: ' + attrCount);

    // ─── Step 6: Clinicians ───
    console.log('6/8 Migrating Clinicians...');
    const clinicians = parseCSV('clinic.csv');
    let clinCount = 0;
    for (const c of clinicians) {
        if (!c.andeuser_ptr_id) continue;
        const user = await prisma.dc_users.findUnique({ where: { source_uuid: c.andeuser_ptr_id } }).catch(() => null);
        if (!user) continue;
        await prisma.dc_users.update({ where: { user_id: user.user_id }, data: { ut_id_fk: 3 } }).catch(() => { });
        await prisma.dc_doctor_details.create({
            data: {
                user_id_fk: user.user_id,
                about_doctor: trunc(c.title, 255) || 'doctor',
                license_no: 'LIC-' + user.user_id,
                h_id_fk: 1,
                ps_id_fk: 1,
            }
        }).catch(() => { });
        clinCount++;
    }
    console.log('   Clinicians: ' + clinCount);

    // ─── Step 7: Admins ───
    console.log('7/8 Migrating Admins...');
    const admins = parseCSV('account_admin.csv');
    let adminCount = 0;
    for (const a of admins) {
        if (!a.andeuser_ptr_id) continue;
        const user = await prisma.dc_users.findUnique({ where: { source_uuid: a.andeuser_ptr_id } }).catch(() => null);
        if (!user) continue;
        await prisma.dc_users.update({ where: { user_id: user.user_id }, data: { ut_id_fk: 2 } }).catch(() => { });
        adminCount++;
    }
    console.log('   Admins: ' + adminCount);

    // ─── Step 8: Spirometry (from 2nd DB - using source_uuid!) ───
    console.log('8/8 Migrating Spirometry Data...');
    const dashUsers = parseCSV('vitalport_user.csv');
    const observations = parseCSV('vitalport_observation.csv');
    const spiroData = parseCSV('vitalport_spirometry.csv');

    // Build dash_user.id -> dash_user.user_id (UUID) map
    const dashUserMap = {};
    for (const du of dashUsers) {
        if (du.id && du.user_id) dashUserMap[du.id] = du.user_id;
    }
    console.log('   Dashboard users mapped: ' + Object.keys(dashUserMap).length);

    // Migrate observations
    let obsCreated = 0;
    for (const o of observations) {
        if (!o.id || !o.user_id) continue;
        const uuid = dashUserMap[o.user_id];
        if (!uuid) continue;
        const user = await prisma.dc_users.findUnique({ where: { source_uuid: uuid } }).catch(() => null);
        if (!user) continue;
        try {
            await prisma.portal_observation.create({
                data: {
                    user_id: user.user_id,
                    dbdate: toDate(o.dbdate),
                    fev1_grade: parseInt(o.fev1_grade) || null,
                    fvc_grade: parseInt(o.fvc_grade) || null,
                    is_post_bronchodilator: toBool(o.is_post_bronchodilator),
                    height: toFloat(o.height),
                }
            });
            obsCreated++;
        } catch (e) { }
    }
    console.log('   Observations: ' + obsCreated);

    // Migrate spirometry
    let spiroCreated = 0;
    for (const s of spiroData) {
        if (!s.id || !s.observation_id) continue;
        const uuid = dashUserMap[s.observation_id];
        if (!uuid) continue;
        const user = await prisma.dc_users.findUnique({ where: { source_uuid: uuid } }).catch(() => null);
        if (!user) continue;
        const obs = await prisma.portal_observation.findFirst({
            where: { user_id: user.user_id },
            orderBy: { dbdate: 'desc' }
        }).catch(() => null);
        if (!obs) continue;
        try {
            await prisma.portal_spirometry.create({
                data: {
                    observation_id: obs.id,
                    dbdate: toDate(s.dbdate),
                    fvc: toFloat(s.fvc),
                    fev1: toFloat(s.fev1),
                    pefr: toFloat(s.pefr),
                    fef2575: toFloat(s.fef2575),
                    fev6: toFloat(s.fev6),
                    fev1_perc: toFloat(s['fev1Perc']),
                    btps: toFloat(s.btps),
                    temp_celsius: toFloat(s['tempCelsius']),
                    quality_message: toFloat(s['qualityMessage']),
                }
            });
            spiroCreated++;
        } catch (e) { }
    }
    console.log('   Spirometry: ' + spiroCreated);

    // ─── Final ───
    console.log('\n=== MIGRATION COMPLETE ===');
    console.log('Users: ' + await prisma.dc_users.count());
    console.log('Patients: ' + await prisma.dc_patient_details.count());
    console.log('Attributes: ' + await prisma.vf_attributes.count());
    console.log('Observations: ' + await prisma.portal_observation.count());
    console.log('Spirometry: ' + await prisma.portal_spirometry.count());
    console.log('\nALL PASSWORDS: ' + DEFAULT_PASSWORD);
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());