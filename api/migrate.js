// migrate.js - PostgreSQL to MySQL Migration Script
// Run in Render Shell: node migrate.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// UUID to new INT ID mapping
const idMap = {};
const accountMap = {};
const groupMap = {};

// Simple CSV parser (no extra dependencies needed)
function parseCSV(filename) {
    const filepath = path.join(__dirname, 'migration', filename);
    if (!fs.existsSync(filepath)) {
        console.log(`   ⚠️ File not found: ${filename}`);
        return [];
    }
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((h, idx) => row[h] = values[idx]?.trim());
        rows.push(row);
    }
    return rows;
}

async function migrate() {
    console.log('========================================');
    console.log('  VitalFlow Migration: PostgreSQL → MySQL');
    console.log('========================================\n');

    // 1. Migrate Accounts
    console.log('1/9 Migrating Accounts...');
    const accounts = parseCSV('account.csv');
    for (const a of accounts) {
        if (!a.id || !a.name) continue;
        try {
            const acc = await prisma.vf_account.create({
                data: {
                    name: a.name.substring(0, 50),
                    creation_date: a.creation_date ? new Date(a.creation_date) : new Date(),
                }
            });
            accountMap[a.id] = acc.id;
            console.log(`   Account: ${a.name} → ID ${acc.id}`);
        } catch (e) {
            console.log(`   ⚠️ Account ${a.name}: ${e.message}`);
        }
    }
    console.log(`   ✅ ${Object.keys(accountMap).length} accounts migrated\n`);

    // 2. Migrate Patient Groups
    console.log('2/9 Migrating Patient Groups...');
    const groups = parseCSV('patientgroup.csv');
    for (const g of groups) {
        if (!g.id || !g.name) continue;
        try {
            const group = await prisma.vf_patient_group.create({
                data: {
                    name: g.name.substring(0, 100),
                    creation_date: g.creation_date ? new Date(g.creation_date) : new Date(),
                    account_id: accountMap[g.account_id] || 1,
                }
            });
            groupMap[g.id] = group.id;
            console.log(`   Group: ${g.name} → ID ${group.id}`);
        } catch (e) {
            console.log(`   ⚠️ Group ${g.name}: ${e.message}`);
        }
    }
    console.log(`   ✅ ${Object.keys(groupMap).length} groups migrated\n`);

    // 3. Migrate Users
    console.log('3/9 Migrating Users...');
    const users = parseCSV('andeuser.csv');
    let userCount = 0;
    for (const u of users) {
        if (!u.id) continue;
        try {
            const tempPass = await bcrypt.hash('Welcome2026!', 10);
            const email = u.email || u.username || `user_${u.id.substring(0, 8)}@migrated.com`;

            const existing = await prisma.dc_users.findUnique({ where: { email } });
            if (existing) {
                idMap[u.id] = existing.user_id;
                continue;
            }

            const user = await prisma.dc_users.create({
                data: {
                    email: email,
                    phone: (u.username || email).replace(/[^0-9+]/g, '').substring(0, 20) || `phone_${u.id.substring(0, 8)}`,
                    password: tempPass,
                    f_name: (u.username || 'User').split('@')[0].substring(0, 20),
                    l_name: '',
                    us_id_fk: (u.is_active === 'true' || u.is_active === 'True' || u.is_active === '1') ? 1 : 2,
                    ut_id_fk: 4, // patient by default
                    is_availible: true,
                    reg_date: u.date_joined ? new Date(u.date_joined) : new Date(),
                }
            });
            idMap[u.id] = user.user_id;
            userCount++;
            if (userCount % 500 === 0) console.log(`   ${userCount} users processed...`);
        } catch (e) {
            console.log(`   ⚠️ User ${u.email || u.username}: ${e.message}`);
        }
    }
    console.log(`   ✅ ${userCount} users migrated\n`);

    // 4. Migrate Patients
    console.log('4/9 Migrating Patients...');
    const patients = parseCSV('patient.csv');
    let patCount = 0;
    for (const p of patients) {
        const userId = idMap[p.andeuser_ptr_id];
        if (!userId) continue;

        try {
            const existing = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } });
            if (existing) continue;

            await prisma.dc_patient_details.create({
                data: {
                    user_id_fk: userId,
                    chart_no: (p.access_code || `CH${userId}`).substring(0, 30),
                    invite_code: (p.access_code || `INV${userId}`).substring(0, 30),
                    access_code: p.access_code?.substring(0, 30) || null,
                    assigned_clinician_id: idMap[p.assigned_clinician_id] || null,
                    patient_group_id: groupMap[p.patient_group_id] || null,
                    graph_view: p.graph_view === 'true' || p.graph_view === 'True',
                    awair_refresh_token: p.awair_refresh_token?.substring(0, 200) || null,
                    date_spirometer_received: p.date_spirometer_received ? new Date(p.date_spirometer_received) : null,
                    rpm_consent: p.rpm_consent === 'true' || p.rpm_consent === 'True',
                    status: p.status || 'unverified',
                }
            });
            patCount++;
        } catch (e) {
            console.log(`   ⚠️ Patient ${p.andeuser_ptr_id}: ${e.message}`);
        }
    }
    console.log(`   ✅ ${patCount} patients migrated\n`);

    // 5. Migrate Attributes
    console.log('5/9 Migrating Attributes...');
    const attrs = parseCSV('attributes.csv');
    let attrCount = 0;
    for (const a of attrs) {
        if (!a.patient_id) continue;
        const userId = idMap[a.patient_id];
        if (!userId) continue;

        try {
            const patient = await prisma.dc_patient_details.findUnique({ where: { user_id_fk: userId } });
            if (!patient) continue;

            const existing = await prisma.vf_attributes.findUnique({ where: { pd_id: patient.pd_id } });
            if (existing) continue;

            await prisma.vf_attributes.create({
                data: {
                    pd_id: patient.pd_id,
                    first_name: (a.first_name || '').substring(0, 100),
                    last_name: (a.last_name || '').substring(0, 100),
                    phone: a.phone?.substring(0, 20) || null,
                    dob: a.dob || '',
                    height: parseFloat(a.height) || 0,
                    weight: parseFloat(a.weight) || null,
                    gender: (a.gender || '').substring(0, 20),
                    ethnic_group: a.ethnic_group?.substring(0, 100) || null,
                    lookup_table: (a.lookup_table || '').substring(0, 100),
                    smoking: a.smoking === 'true' || a.smoking === 'True',
                    start_date: a.start_date ? new Date(a.start_date) : new Date(),
                    chart_number: a.chart_number?.substring(0, 100) || null,
                    account_type: (a.account_type || 'test').substring(0, 10),
                    welcome_method: (a.welcome_method || 'text').substring(0, 10),
                    identify: a.identify?.substring(0, 255) || null,
                }
            });
            attrCount++;
        } catch (e) {
            console.log(`   ⚠️ Attr ${a.id}: ${e.message}`);
        }
    }
    console.log(`   ✅ ${attrCount} attributes migrated\n`);

    // 6. Migrate Clinicians
    console.log('6/9 Migrating Clinicians...');
    const clinicians = parseCSV('clinician.csv');
    let clinCount = 0;
    for (const c of clinicians) {
        const userId = idMap[c.andeuser_ptr_id];
        if (!userId) continue;

        try {
            await prisma.dc_users.update({
                where: { user_id: userId },
                data: { ut_id_fk: 3 }
            });

            const existing = await prisma.dc_doctor_details.findUnique({ where: { user_id_fk: userId } });
            if (!existing) {
                await prisma.dc_doctor_details.create({
                    data: {
                        user_id_fk: userId,
                        about_doctor: '',
                        education: (c.title || '').substring(0, 255),
                        license_no: `LIC-${userId}`,
                        h_id_fk: accountMap[c.account_id] || 1,
                        ps_id_fk: 1,
                    }
                });
            }
            clinCount++;
        } catch (e) {
            console.log(`   ⚠️ Clinician ${c.andeuser_ptr_id}: ${e.message}`);
        }
    }
    console.log(`   ✅ ${clinCount} clinicians migrated\n`);

    // 7. Migrate Account Admins
    console.log('7/9 Migrating Admins...');
    const admins = parseCSV('accountadmin.csv');
    let adminCount = 0;
    for (const a of admins) {
        const userId = idMap[a.andeuser_ptr_id];
        if (!userId) continue;

        try {
            await prisma.dc_users.update({
                where: { user_id: userId },
                data: { ut_id_fk: 2 }
            });
            adminCount++;
        } catch (e) {
            console.log(`   ⚠️ Admin ${a.andeuser_ptr_id}: ${e.message}`);
        }
    }
    console.log(`   ✅ ${adminCount} admins migrated\n`);

    // 8. Migrate Addresses
    console.log('8/9 Migrating Addresses...');
    const addresses = parseCSV('address.csv');
    let addrCount = 0;
    for (const a of addresses) {
        if (!a.street && !a.city) continue;
        try {
            await prisma.vf_address.create({
                data: {
                    street: (a.street || '').substring(0, 255),
                    city: (a.city || '').substring(0, 100),
                    state: (a.state || '').substring(0, 100),
                    zip: (a.zip || '').substring(0, 100),
                    attributes_id: 1, // Default
                }
            });
            addrCount++;
        } catch (e) {
            // Skip silently
        }
    }
    console.log(`   ✅ ${addrCount} addresses migrated\n`);

    // 9. Migrate FCM Tokens
    console.log('9/9 Migrating FCM Tokens...');
    const tokens = parseCSV('fcmtoken.csv');
    let tokenCount = 0;
    for (const t of tokens) {
        const userId = idMap[t.patient_id];
        if (!userId || !t.token) continue;

        try {
            await prisma.dc_fcm_token.create({
                data: {
                    fcm_token: t.token.substring(0, 255),
                    device: 'android',
                    user_id_fk: userId,
                    date_time: t.creation_date ? new Date(t.creation_date) : new Date(),
                    is_enabled: true,
                }
            });
            tokenCount++;
        } catch (e) {
            // Skip duplicates
        }
    }
    console.log(`   ✅ ${tokenCount} tokens migrated\n`);

    console.log('========================================');
    console.log('  🎉 MIGRATION COMPLETE!');
    console.log('========================================');
    console.log(`  Users: ${userCount}`);
    console.log(`  Patients: ${patCount}`);
    console.log(`  Attributes: ${attrCount}`);
    console.log(`  Clinicians: ${clinCount}`);
    console.log(`  Admins: ${adminCount}`);
    console.log(`  Accounts: ${Object.keys(accountMap).length}`);
    console.log(`  Groups: ${Object.keys(groupMap).length}`);
    console.log('');
    console.log('  ⚠️  ALL USERS HAVE TEMP PASSWORD: Welcome2026!');
    console.log('========================================');
}

migrate()
    .catch(e => {
        console.error('❌ Migration failed:', e.message);
        console.error(e);
    })
    .finally(() => prisma.$disconnect());