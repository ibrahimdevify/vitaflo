const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const idMap = {};
let phoneCounter = 0;
function uniquePhone() { phoneCounter++; return 'mig2-' + Date.now() + '-' + phoneCounter; }

function parseCSV(filename) {
    const filepath = path.join(__dirname, 'migration', filename);
    if (!fs.existsSync(filepath)) return [];
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = []; let current = '', inQuotes = false;
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
    console.log('=== Final Migration - Creating Missing Users ===\n');

    // Rebuild idMap
    const usersCsv = parseCSV('users.csv');
    for (const u of usersCsv) {
        if (!u.id) continue;
        const email = u.email || u.username || 'user_' + u.id.substring(0, 8) + '@migrated.com';
        const dbUser = await prisma.dc_users.findUnique({ where: { email } }).catch(() => null);
        if (dbUser) idMap[u.id] = dbUser.user_id;
    }
    console.log('Mapped: ' + Object.keys(idMap).length + ' UUIDs');

    // Find patient UUIDs that have no matching user
    const patients = parseCSV('patient.csv');
    const missingUUIDs = new Set();
    for (const p of patients) {
        if (p.andeuser_ptr_id && !idMap[p.andeuser_ptr_id]) {
            missingUUIDs.add(p.andeuser_ptr_id);
        }
    }
    console.log('Missing UUIDs that need users: ' + missingUUIDs.size);

    // Create users for missing UUIDs
    let created = 0;
    const tempPass = await bcrypt.hash('Welcome2026!', 10);
    for (const uuid of missingUUIDs) {
        try {
            const email = 'pt_' + uuid.substring(0, 8) + '@migrated.com';
            const existing = await prisma.dc_users.findUnique({ where: { email } }).catch(() => null);
            if (existing) { idMap[uuid] = existing.user_id; continue; }
            const user = await prisma.dc_users.create({
                data: { email, phone: uniquePhone(), password: tempPass, f_name: 'Patient', l_name: uuid.substring(0, 8), us_id_fk: 1, ut_id_fk: 4, is_availible: true, reg_date: new Date() }
            });
            idMap[uuid] = user.user_id;
            created++;
            if (created % 500 === 0) console.log('  Created: ' + created);
        } catch (e) { }
    }
    console.log('Created ' + created + ' new users for missing patients');

    // Now migrate remaining patients
    let patCount = 0;
    for (const p of patients) {
        const userId = idMap[p.andeuser_ptr_id];
        if (!userId) continue;
        try {
            const exists = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } }).catch(() => null);
            if (exists) continue;
            await prisma.dc_patient_details.create({
                data: {
                    user_id_fk: userId,
                    chart_no: String(p.access_code || 'CH' + userId).substring(0, 30),
                    invite_code: String(p.access_code || 'INV' + userId).substring(0, 30),
                    access_code: p.access_code ? String(p.access_code).substring(0, 30) : null,
                    graph_view: p.graph_view === 'True',
                    rpm_consent: p.rpm_consent === 'True',
                    status: String(p.status || 'unverified').substring(0, 50),
                }
            });
            patCount++;
        } catch (e) { }
    }
    console.log('New patients: ' + patCount);

    // Migrate remaining attributes
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
            if (exists) continue;
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
        } catch (e) { }
    }
    console.log('New attributes: ' + attrCount);

    // Final counts
    console.log('\n=== FINAL COUNTS ===');
    console.log('Users: ' + await prisma.dc_users.count());
    console.log('Patients: ' + await prisma.dc_patient_details.count());
    console.log('Attributes: ' + await prisma.vf_attributes.count());
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());