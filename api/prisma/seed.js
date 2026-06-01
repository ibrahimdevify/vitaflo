const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create user types
  await prisma.dc_user_type.createMany({
    data: [
      { name: 'technician' },
      { name: 'account_admin' },
      { name: 'clinician' },
      { name: 'patient' },
    ],
    skipDuplicates: true,
  });

  // Create user statuses
  await prisma.dc_user_status.createMany({
    data: [
      { name: 'active' },
      { name: 'inactive' },
      { name: 'suspended' },
      { name: 'unverified' },
    ],
    skipDuplicates: true,
  });

  // Create an account (hospital)
  const account = await prisma.vf_account.create({
    data: {
      name: 'Test Hospital',
    },
  });

  // Create patient group
  const patientGroup = await prisma.vf_patient_group.create({
    data: {
      name: 'Default',
      account_id: account.id,
    },
  });

  // Create test clinician
  const hashedPassword = await bcrypt.hash('testpass123', 10);
  
  await prisma.dc_users.create({
    data: {
      f_name: 'Clinician',
      l_name: 'One',
      email: 'clinician1@test.com',
      phone: '1234567890',
      password: hashedPassword,
      ut_id_fk: 3,
      us_id_fk: 1,
      is_profile_completed: true,
      doctor_details: {
        create: {
          about_doctor: 'Test clinician',
          license_no: 'LIC-001',
          h_id_fk: account.id,
          ps_id_fk: 1,
        },
      },
    },
  });

  // Create test patient
  await prisma.dc_users.create({
    data: {
      f_name: 'Patient',
      l_name: 'One',
      email: 'patient1@test.com',
      phone: '0987654321',
      password: hashedPassword,
      ut_id_fk: 4,
      us_id_fk: 1,
      is_profile_completed: true,
      patient_details: {
        create: {
          chart_no: 'CH-001',
          patient_group_id: patientGroup.id,
          status: 'active',
          invite_code: 'INV-001',
        },
      },
    },
  });

  console.log('✅ Seed complete!');
  console.log('---');
  console.log('Clinician: clinician1@test.com / testpass123');
  console.log('Patient:   patient1@test.com / testpass123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
