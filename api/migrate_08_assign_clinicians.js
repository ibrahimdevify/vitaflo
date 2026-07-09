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
  let row = [], field = '', inQ = false;
  for (let i = 0; i < len; i++) {
    const c = content[i];
    if (inQ) { if (c === '"') { inQ = false; continue; } field += c; continue; }
    if (c === '"') { inQ = true; continue; }
    if (c === ',') { row.push(field.trim()); field = ''; continue; }
    if (c === '\r') continue;
    if (c === '\n') { row.push(field.trim()); field = ''; rows.push(row); row = []; continue; }
    field += c;
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
  console.log('║  Step 8: Assign Clinicians       ║');
  console.log('╚══════════════════════════════════╝\n');
  
  const patients = parseCSV('patient.csv');
  console.log('Loaded ' + patients.length + ' patient records');
  
  let assigned = 0, skipped = 0;
  
  for (const p of patients) {
    if (!p.andeuser_ptr_id || !p.assigned_clinician_id) { skipped++; continue; }
    
    // Find patient user
    const patientUser = await prisma.dc_users.findUnique({
      where: { source_uuid: p.andeuser_ptr_id }
    }).catch(() => null);
    
    if (!patientUser) { skipped++; continue; }
    
    // Find clinician user
    const clinicianUser = await prisma.dc_users.findUnique({
      where: { source_uuid: p.assigned_clinician_id }
    }).catch(() => null);
    
    if (!clinicianUser) { skipped++; continue; }
    
    // Update patient details with clinician
    await prisma.dc_patient_details.update({
      where: { user_id_fk: patientUser.user_id },
      data: { assigned_clinician_id: clinicianUser.user_id }
    }).catch(() => {});
    
    assigned++;
    if (assigned % 500 === 0) console.log('   Assigned: ' + assigned);
  }
  
  console.log('\nAssigned: ' + assigned);
  console.log('Skipped: ' + skipped);
  
  // Verify
  const withPatients = await prisma.dc_users.count({
    where: { ut_id_fk: 3, assigned_patients: { some: {} } }
  });
  console.log('Clinicians with patients now: ' + withPatients);
  
  await prisma.$disconnect();
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
