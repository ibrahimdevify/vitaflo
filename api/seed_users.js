// seed_users.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
    console.log('=== Seeding Initial Users ===\n');

    // 1. Create User Types
    console.log('Creating user types...');
    const types = [
        { ut_id: 1, name: 'technician' },
        { ut_id: 2, name: 'admin' },
        { ut_id: 3, name: 'clinician' },
        { ut_id: 4, name: 'patient' },
        { ut_id: 5, name: 'account_admin' },
    ];

    for (const t of types) {
        await prisma.dc_user_type.upsert({
            where: { ut_id: t.ut_id },
            update: { name: t.name },
            create: t,
        });
    }
    console.log('✅ User types created');

    // 2. Create User Statuses
    console.log('Creating user statuses...');
    const statuses = [
        { us_id: 1, name: 'active' },
        { us_id: 2, name: 'inactive' },
        { us_id: 3, name: 'suspended' },
        { us_id: 4, name: 'pending' },
    ];

    for (const s of statuses) {
        await prisma.dc_user_status.upsert({
            where: { us_id: s.us_id },
            update: { name: s.name },
            create: s,
        });
    }
    console.log('✅ User statuses created');

    // 3. Create Admin User
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin@123456', 10);
    const admin = await prisma.dc_users.upsert({
        where: { email: 'admin@vitalflow.com' },
        update: { password: adminPassword, ut_id_fk: 2 },
        create: {
            f_name: 'System',
            l_name: 'Admin',
            email: 'admin@vitalflow.com',
            phone: '+1000000001',
            password: adminPassword,
            us_id_fk: 1,
            ut_id_fk: 2,
            is_availible: true,
        },
    });
    console.log('✅ Admin: admin@vitalflow.com / Admin@123456');

    // 4. Create Clinician User
    console.log('Creating clinician user...');
    const clinicianPassword = await bcrypt.hash('Doctor@123456', 10);
    const clinician = await prisma.dc_users.upsert({
        where: { email: 'doctor@vitalflow.com' },
        update: { password: clinicianPassword, ut_id_fk: 3 },
        create: {
            f_name: 'Sarah',
            l_name: 'Johnson',
            email: 'doctor@vitalflow.com',
            phone: '+1000000002',
            password: clinicianPassword,
            us_id_fk: 1,
            ut_id_fk: 3,
            is_availible: true,
        },
    });
    console.log('✅ Clinician: doctor@vitalflow.com / Doctor@123456');

    // 5. Create Patient User
    console.log('Creating patient user...');
    const patientPassword = await bcrypt.hash('Patient@123', 10);
    const patient = await prisma.dc_users.upsert({
        where: { email: 'patient@vitalflow.com' },
        update: { password: patientPassword, ut_id_fk: 4 },
        create: {
            f_name: 'John',
            l_name: 'Doe',
            email: 'patient@vitalflow.com',
            phone: '+1000000003',
            password: patientPassword,
            us_id_fk: 1,
            ut_id_fk: 4,
            is_availible: true,
        },
    });
    console.log('✅ Patient: patient@vitalflow.com / Patient@123');

    console.log('\n=== SEED COMPLETE ===');
    console.log('Users created: 3');
}

seed()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });