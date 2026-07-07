const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const idMap = {};
const accountMap = {};
const groupMap = {};

function parseCSV(filename) {
    const filepath = path.join(__dirname, 'migration', filename);
    if (!fs.existsSync(filepath)) { console.log('   File not found: ' + filename); return []; }
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') { inQuotes = !inQuotes; }
            else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
            else { current += char; }
        }
        values.push(current.trim());
        const row = {};
        headers.forEach((h, idx) => { row[h] = values[idx] ? values[idx].replace(/^"|"$/g, '') : ''; });
        rows.push(row);
    }
    return rows;
}

async function migrate() {
    console.log('=== VitalFlow Migration ===');

    const accounts = parseCSV('account.csv');
    for (const a of accounts) {
        if (!a.id || !a.name) continue;
        try { const acc = await prisma.vf_account.create({ data: { name: String(a.name).substring(0, 50), creation_date: a.creation_date ? new Date(a.creation_date) : new Date() } }); accountMap[a.id] = acc.id; } catch (e) { }
    }
    console.log('Accounts: ' + Object.keys(accountMap).length);

    const groups = parseCSV('patientgroup.csv');
    for (const g of groups) {
        if (!g.id || !g.name) continue;
        try { const grp = await prisma.vf_patient_group.create({ data: { name: String(g.name).substring(0, 100), creation_date: g.creation_date ? new Date(g.creation_date) : new Date(), account_id: accountMap[g.account_id] || 1 } }); groupMap[g.id] = grp.id; } catch (e) { }
    }
    console.log('Groups: ' + Object.keys(groupMap).length);

    const users = parseCSV('andeuser.csv');
    let userCount = 0;
    for (const u of users) {
        if (!u.id) continue;
        try {
            const tempPass = await bcrypt.hash('Welcome2026!', 10);
            const email = u.email || u.username || 'user_' + u.id.substring(0, 8) + '@migrated.com';
            const existing = await prisma.dc_users.findUnique({ where: { email } }).catch(() => null);
            if (existing) { idMap[u.id] = existing.user_id; continue; }
            const user = await prisma.dc_users.create({
                data: {
                    email: email,
                    phone: String(u.username || email).replace(/[^0-9+]/g, '').substring(0, 20) || 'ph_' + u.id.substring(0, 8),
                    password: tempPass,
                    f_name: String(u.username || 'User').split('@')[0].substring(0, 20),
                    l_name: '',
                    us_id_fk: (u.is_active === 'True' || u.is_active === 'true') ? 1 : 2,
                    ut_id_fk: 4, is_availible: true,
                    reg_date: u.date_joined ? new Date(u.date_joined) : new Date(),
                }
            });
            idMap[u.id] = user.user_id;
            userCount++;
            if (userCount % 1000 === 0) console.log('Users: ' + userCount);
        } catch (e) { console.log('Skip user: ' + e.message); }
    }
    console.log('Users: ' + userCount);

    const patients = parseCSV('patient.csv');
    let patCount = 0;
    for (const p of patients) {
        const userId = idMap[p.andeuser_ptr_id];
        if (!userId) continue;
        try {
            const existing = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
            if (existing) continue;
            await prisma.dc_patient_details.create({
                data: {
                    user_id_fk: userId,
                    chart_no: String(p.access_code || 'CH' + userId).substring(0, 30),
                    invite_code: String(p.access_code || 'INV' + userId).substring(0, 30),
                    access_code: p.access_code ? String(p.access_code).substring(0, 30) : null,
                    assigned_clinician_id: idMap[p.assigned_clinician_id] || null,
                    patient_group_id: groupMap[p.patient_group_id] || null,
                    graph_view: p.graph_view === 'True' || p.graph_view === 'true',
                    awair_refresh_token: p.awair_refresh_token ? String(p.awair_refresh_token).substring(0, 200) : null,
                    rpm_consent: p.rpm_consent === 'True' || p.rpm_consent === 'true',
                    status: String(p.status || 'unverified').substring(0, 50),
                }
            });
            patCount++;
        } catch (e) { }
    }
    console.log('Patients: ' + patCount);

    const attrs = parseCSV('attributes.csv');
    let attrCount = 0;
    for (const a of attrs) {
        if (!a.patient_id) continue;
        const userId = idMap[a.patient_id];
        if (!userId) continue;
        try {
            const patient = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
            if (!patient) continue;
            const existing = await prisma.vf_attributes.findUnique({ where: { pd_id: patient.pd_id } }).catch(() => null);
            if (existing) continue;
            await prisma.vf_attributes.create({
                data: {
                    pd_id: patient.pd_id,
                    first_name: String(a.first_name || '').substring(0, 100),
                    last_name: String(a.last_name || '').substring(0, 100),
                    phone: a.phone ? String(a.phone).substring(0, 20) : null,
                    dob: String(a.dob || ''),
                    height: parseFloat(a.height) || 0,
                    weight: parseFloat(a.weight) || null,
                    gender: String(a.gender || '').substring(0, 20),
                    ethnic_group: a.ethnic_group ? String(a.ethnic_group).substring(0, 100) : null,
                    lookup_table: String(a.lookup_table || ''),
                    smoking: a.smoking === 'True' || a.smoking === 'true',
                    start_date: a.start_date ? new Date(a.start_date) : new Date(),
                    chart_number: a.chart_number ? String(a.chart_number).substring(0, 100) : null,
                    account_type: String(a.account_type || 'test').substring(0, 10),
                    welcome_method: String(a.welcome_method || 'text').substring(0, 10),
                    identify: a.identify ? String(a.identify).substring(0, 255) : null,
                }
            });
            attrCount++;
        } catch (e) { }
    }
    console.log('Attributes: ' + attrCount);

    const clinicians = parseCSV('clinician.csv');
    let clinCount = 0;
    for (const c of clinicians) {
        const userId = idMap[c.andeuser_ptr_id];
        if (!userId) continue;
        try {
            await prisma.dc_users.update({ where: { user_id: userId }, data: { ut_id_fk: 3 } }).catch(() => { });
            const existing = await prisma.dc_doctor_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
            if (!existing) {
                await prisma.dc_doctor_details.create({
                    data: { user_id_fk: userId, about_doctor: '', education: String(c.title || '').substring(0, 255), license_no: 'LIC-' + userId, h_id_fk: accountMap[c.account_id] || 1, ps_id_fk: 1 }
                }).catch(() => { });
            }
            clinCount++;
        } catch (e) { }
    }
    console.log('Clinicians: ' + clinCount);

    const admins = parseCSV('accountadmin.csv');
    let adminCount = 0;
    for (const a of admins) {
        const userId = idMap[a.andeuser_ptr_id];
        if (!userId) continue;
        try { await prisma.dc_users.update({ where: { user_id: userId }, data: { ut_id_fk: 2 } }).catch(() => { }); adminCount++; } catch (e) { }
    }
    console.log('Admins: ' + adminCount);

    console.log('=== DONE! Users:' + userCount + ' Patients:' + patCount + ' Attrs:' + attrCount + ' ===');
    console.log('ALL PASSWORDS: Welcome2026!');
}

migrate().catch(e => console.error(e)).finally(() => prisma.$disconnect());