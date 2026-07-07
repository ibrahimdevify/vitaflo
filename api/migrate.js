const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const idMap = {};

function parseCSV(filename) {
    const filepath = path.join(__dirname, 'migration', filename);
    if (!fs.existsSync(filepath)) return [];
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let current = '', inQuotes = false;
        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
            else current += char;
        }
        values.push(current.trim());
        const row = {};
        headers.forEach((h, idx) => { row[h] = values[idx] ? values[idx].replace(/^"|"$/g, '') : ''; });
        rows.push(row);
    }
    return rows;
}

async function run() {
    console.log('Building UUID map from 3012 existing users...');
    const usersCsv = parseCSV('users.csv');
    let mapped = 0;
    for (const u of usersCsv) {
        if (!u.id) continue;
        const email = u.email || u.username || 'user_' + u.id.substring(0, 8) + '@migrated.com';
        const dbUser = await prisma.dc_users.findUnique({ where: { email } }).catch(() => null);
        if (dbUser) { idMap[u.id] = dbUser.user_id; mapped++; }
    }
    console.log('Mapped: ' + mapped + ' UUIDs');
    console.log('Sample idMap entry:', Object.entries(idMap).slice(0, 2));

    // Migrate Patients
    console.log('\nMigrating Patients...');
    const patients = parseCSV('patient.csv');
    let patCount = 0;
    for (const p of patients) {
        const userId = idMap[p.andeuser_ptr_id];
        if (!userId) continue;
        try {
            const exists = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
            if (exists) { patCount++; continue; }
            await prisma.dc_patient_details.create({
                data: {
                    user_id_fk: userId,
                    chart_no: String(p.access_code || 'CH' + userId).substring(0, 30),
                    invite_code: String(p.access_code || 'INV' + userId).substring(0, 30),
                    access_code: p.access_code ? String(p.access_code).substring(0, 30) : null,
                    assigned_clinician_id: idMap[p.assigned_clinician_id] || null,
                    graph_view: p.graph_view === 'True',
                    rpm_consent: p.rpm_consent === 'True',
                    status: String(p.status || 'unverified').substring(0, 50),
                }
            });
            patCount++;
            if (patCount % 1000 === 0) console.log('  Patients: ' + patCount);
        } catch (e) { }
    }
    console.log('Patients done: ' + patCount);

    // Migrate Attributes
    console.log('\nMigrating Attributes...');
    const attrs = parseCSV('attribute.csv');
    let attrCount = 0;
    for (const a of attrs) {
        if (!a.patient_id) continue;
        const userId = idMap[a.patient_id];
        if (!userId) continue;
        try {
            const patient = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
            if (!patient) continue;
            const exists = await prisma.vf_attributes.findUnique({ where: { pd_id: patient.pd_id } }).catch(() => null);
            if (exists) { attrCount++; continue; }
            await prisma.vf_attributes.create({
                data: {
                    pd_id: patient.pd_id,
                    first_name: String(a.first_name || '').substring(0, 100),
                    last_name: String(a.last_name || '').substring(0, 100),
                    dob: String(a.dob || ''),
                    height: parseFloat(a.height) || 0,
                    weight: parseFloat(a.weight) || null,
                    gender: String(a.gender || '').substring(0, 20),
                    ethnic_group: a.ethnic_group ? String(a.ethnic_group).substring(0, 100) : null,
                    lookup_table: String(a.lookup_table || ''),
                    smoking: a.smoking === 'True',
                    start_date: a.start_date ? new Date(a.start_date) : new Date(),
                    chart_number: a.chart_number ? String(a.chart_number).substring(0, 100) : null,
                    account_type: String(a.account_type || 'test').substring(0, 10),
                }
            });
            attrCount++;
            if (attrCount % 1000 === 0) console.log('  Attrs: ' + attrCount);
        } catch (e) { }
    }
    console.log('Attrs done: ' + attrCount);

    console.log('\n=== FINAL: Patients=' + patCount + ' Attrs=' + attrCount + ' ===');
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());