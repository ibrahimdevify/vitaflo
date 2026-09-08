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

    // 3. Create Account (Hospital)
    console.log('Creating account/hospital...');
    const account = await prisma.vf_account.upsert({
        where: { id: 1 },
        update: { name: 'VitalFlo Test Hospital' },
        create: {
            id: 1,
            name: 'VitalFlo Test Hospital',
        },
    });
    console.log('✅ Account created');

    // 4. Create Account Attributes
    console.log('Creating account attributes...');
    await prisma.vf_account_attributes.upsert({
        where: { account_id: 1 },
        update: {
            breezometer: false,
            awair: false,
            bronchodilator_responsiveness_testing: true,
        },
        create: {
            account_id: 1,
            breezometer: false,
            awair: false,
            bronchodilator_responsiveness_testing: true,
        },
    });
    console.log('✅ Account attributes created');

    // 5. Create Admin User
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin@123456', 10);
    const admin = await prisma.dc_users.upsert({
        where: { email: 'admin@VitalFlo.com' },
        update: { password: adminPassword, ut_id_fk: 2 },
        create: {
            f_name: 'System',
            l_name: 'Admin',
            email: 'admin@VitalFlo.com',
            phone: '+1000000001',
            password: adminPassword,
            userName: 'admin',
            us_id_fk: 1,
            ut_id_fk: 2,
            is_availible: true,
        },
    });
    console.log('✅ Admin: admin@VitalFlo.com / Admin@123456');

    // 6. Create Clinician User (Doctor)
    console.log('Creating clinician user...');
    const clinicianPassword = await bcrypt.hash('Doctor@123456', 10);
    const clinician = await prisma.dc_users.upsert({
        where: { email: 'doctor@VitalFlo.com' },
        update: { password: clinicianPassword, ut_id_fk: 3 },
        create: {
            f_name: 'Sarah',
            l_name: 'Johnson',
            email: 'doctor@VitalFlo.com',
            phone: '+1000000002',
            password: clinicianPassword,
            userName: 'sarahjohnson',
            us_id_fk: 1,
            ut_id_fk: 3,
            is_availible: true,
        },
    });
    console.log('✅ Clinician: doctor@VitalFlo.com / Doctor@123456');
    console.log('   Clinician ID:', clinician.user_id);

    // 7. Create Doctor Details for Clinician
    console.log('Creating doctor details...');
    await prisma.dc_doctor_details.upsert({
        where: { user_id_fk: clinician.user_id },
        update: {
            license_no: 'LIC123456',
            h_id_fk: 1,
            ps_id_fk: 1,
        },
        create: {
            about_doctor: 'Test Doctor',
            license_no: 'LIC123456',
            h_id_fk: 1,
            ps_id_fk: 1,
            user_id_fk: clinician.user_id,
            is_specialist: false,
            experience: '2 yrs',
            education: 'MD',
        },
    }).catch(async (e) => {
        // If ps_id_fk doesn't exist, try without it
        console.log('Retrying doctor details without ps_id_fk...');
        await prisma.dc_doctor_details.upsert({
            where: { user_id_fk: clinician.user_id },
            update: {
                license_no: 'LIC123456',
                h_id_fk: 1,
            },
            create: {
                about_doctor: 'Test Doctor',
                license_no: 'LIC123456',
                h_id_fk: 1,
                ps_id_fk: 1,
                user_id_fk: clinician.user_id,
                is_specialist: false,
                experience: '2 yrs',
                education: 'MD',
            },
        });
    });
    console.log('✅ Doctor details created');

    // 8. Create Patient User
    console.log('Creating patient user...');
    const patientPassword = await bcrypt.hash('Patient@123', 10);
    const patient = await prisma.dc_users.upsert({
        where: { email: 'patient@VitalFlo.com' },
        update: { password: patientPassword, ut_id_fk: 4 },
        create: {
            f_name: 'John',
            l_name: 'Doe',
            email: 'patient@VitalFlo.com',
            phone: '+1000000003',
            password: patientPassword,
            userName: 'johndoe',
            us_id_fk: 1,
            ut_id_fk: 4,
            is_availible: true,
        },
    });
    console.log('✅ Patient: patient@VitalFlo.com / Patient@123');
    console.log('   Patient ID:', patient.user_id);

    // 9. Create Patient Details and Assign to Clinician
    console.log('Creating patient details and assigning to clinician...');
    const patientDetails = await prisma.dc_patient_details.upsert({
        where: { user_id_fk: patient.user_id },
        update: {
            assigned_clinician_id: clinician.user_id,
            status: 'active',
        },
        create: {
            user_id_fk: patient.user_id,
            chart_no: 'CHART123',
            invite_code: 'INVITE123',
            access_code: 'ACCESS123',
            assigned_clinician_id: clinician.user_id, // ✅ ASSIGN TO DOCTOR
            status: 'active',
            graph_view: true,
            rpm_consent: false,
        },
    });
    console.log('✅ Patient details created');
    console.log('   pd_id:', patientDetails.pd_id);
    console.log('   Assigned to clinician:', patientDetails.assigned_clinician_id);

    // 10. Create Patient Attributes
    console.log('Creating patient attributes...');
    await prisma.vf_attributes.upsert({
        where: { pd_id: patientDetails.pd_id },
        update: {
            first_name: 'John',
            last_name: 'Doe',
            dob: '1990-01-01',
            gender: 'M',
            height: 175.0,
            weight: 70.0,
        },
        create: {
            pd_id: patientDetails.pd_id,
            first_name: 'John',
            last_name: 'Doe',
            phone: '+1000000003',
            dob: '1990-01-01',
            gender: 'M',
            height: 175.0,
            weight: 70.0,
            chart_number: 'CHART123',
            account_type: 'test',
            welcome_method: 'text',
        },
    });
    console.log('✅ Patient attributes created');

    console.log('\n=== SEED COMPLETE ===');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin:     admin@VitalFlo.com / Admin@123456');
    console.log('  Clinician: doctor@VitalFlo.com / Doctor@123456');
    console.log('  Patient:   patient@VitalFlo.com / Patient@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Patient is assigned to Clinician ✅');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

seed()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });