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

function toBool(v) { return String(v).toLowerCase() === 'true'; }
function toFloat(v) { if (!v || v === 'None' || v === 'NULL') return null; const n = parseFloat(v); return isNaN(n) ? null : n; }
function toDate(v) { if (!v) return new Date(); const d = new Date(v); return isNaN(d.getTime()) ? new Date() : d; }
function trunc(v, len) { if (!v) return null; return String(v).substring(0, len); }

async function run() {
  console.log('╔══════════════════════════════════╗');
  console.log('║  Step 3: Patient Details + Attrs ║');
  console.log('╚══════════════════════════════════╝\n');
  
  // --- Part A: Patient Details ---
  console.log('📋 Part A: Migrating Patient Details...');
  const patients = parseCSV('patient.csv');
  console.log(`   Loaded ${patients.length} patients from CSV`);
  
  let patCreated = 0, patSkipped = 0, patNotFound = 0;
  
  for (const p of patients) {
    if (!p.andeuser_ptr_id) continue;
    
    const user = await prisma.dc_users.findUnique({ 
      where: { source_uuid: p.andeuser_ptr_id } 
    }).catch(() => null);
    
    if (!user) { patNotFound++; continue; }
    
    const exists = await prisma.dc_patient_details.findUnique({ 
      where: { user_id_fk: user.user_id } 
    }).catch(() => null);
    
    if (exists) { patSkipped++; continue; }
    
    await prisma.dc_patient_details.create({
      data: {
        user_id_fk: user.user_id,
        chart_no: trunc(p.access_code || 'CH' + user.user_id, 255),
        invite_code: trunc(p.access_code || 'INV' + user.user_id, 255),
        status: trunc(p.status || 'unverified', 50),
        graph_view: toBool(p.graph_view),
        rpm_consent: toBool(p.rpm_consent),
      }
    }).catch(() => {});
    patCreated++;
    
    if (patCreated % 500 === 0) console.log(`   📊 ${patCreated} patients created`);
  }
  
  console.log(`   ✅ Patients: created=${patCreated}, skipped=${patSkipped}, notFound=${patNotFound}`);
  
  // --- Part B: Attributes ---
  console.log('\n📋 Part B: Migrating Attributes...');
  const attrs = parseCSV('attribute.csv');
  console.log(`   Loaded ${attrs.length} attributes from CSV`);
  
  let attrCreated = 0, attrSkipped = 0, attrNotFound = 0;
  
  for (const a of attrs) {
    if (!a.patient_id) continue;
    
    const user = await prisma.dc_users.findUnique({ 
      where: { source_uuid: a.patient_id } 
    }).catch(() => null);
    
    if (!user) { attrNotFound++; continue; }
    
    const patient = await prisma.dc_patient_details.findUnique({ 
      where: { user_id_fk: user.user_id } 
    }).catch(() => null);
    
    if (!patient) { attrNotFound++; continue; }
    
    const exists = await prisma.vf_attributes.findUnique({ 
      where: { pd_id: patient.pd_id } 
    }).catch(() => null);
    
    if (exists) { attrSkipped++; continue; }
    
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
    }).catch(() => {});
    attrCreated++;
    
    if (attrCreated % 500 === 0) console.log(`   📊 ${attrCreated} attributes created`);
  }
  
  console.log(`   ✅ Attributes: created=${attrCreated}, skipped=${attrSkipped}, notFound=${attrNotFound}`);
  
  // Final counts
  console.log('\n=== FINAL COUNTS ===');
  console.log('Patients: ' + await prisma.dc_patient_details.count());
  console.log('Attributes: ' + await prisma.vf_attributes.count());
  
  await prisma.$disconnect();
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
