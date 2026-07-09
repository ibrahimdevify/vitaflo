const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const MIGRATION_DIR = path.join(__dirname, 'migration');

function parseCSV(filename) {
  const filepath = path.join(MIGRATION_DIR, filename);
  if (!fs.existsSync(filepath)) return [];
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

async function run() {
  console.log('╔══════════════════════════════════╗');
  console.log('║  Step 2: Update Clinicians       ║');
  console.log('╚══════════════════════════════════╝\n');
  
  const clinicians = parseCSV('clinic.csv');
  console.log(`📂 Loaded ${clinicians.length} clinicians from CSV`);
  
  let updated = 0, doctorCreated = 0, notFound = 0;
  
  for (const c of clinicians) {
    if (!c.andeuser_ptr_id) continue;
    
    // Find user by source_uuid
    const user = await prisma.dc_users.findUnique({ 
      where: { source_uuid: c.andeuser_ptr_id } 
    }).catch(() => null);
    
    if (!user) { notFound++; continue; }
    
    // Update user type to clinician
    await prisma.dc_users.update({
      where: { user_id: user.user_id },
      data: { ut_id_fk: 3 }
    }).catch(() => {});
    updated++;
    
    // Create doctor details
    const exists = await prisma.dc_doctor_details.findUnique({ 
      where: { user_id_fk: user.user_id } 
    }).catch(() => null);
    
    if (!exists) {
      await prisma.dc_doctor_details.create({
        data: {
          user_id_fk: user.user_id,
          about_doctor: c.title || 'doctor',
          license_no: 'LIC-' + user.user_id,
          h_id_fk: 1,
          ps_id_fk: 1,
        }
      }).catch(() => {});
      doctorCreated++;
    }
    
    if (updated % 100 === 0) console.log(`   📊 ${updated} clinicians updated`);
  }
  
  const totalClinicians = await prisma.dc_users.count({ where: { ut_id_fk: 3 } });
  const totalDoctorDetails = await prisma.dc_doctor_details.count();
  
  console.log(`\n✅ COMPLETED:`);
  console.log(`   Updated to clinician: ${updated}`);
  console.log(`   Doctor details created: ${doctorCreated}`);
  console.log(`   Not found by UUID: ${notFound}`);
  console.log(`   Total clinicians (ut_id_fk=3): ${totalClinicians}`);
  console.log(`   Total doctor_details: ${totalDoctorDetails}`);
  
  await prisma.$disconnect();
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
