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
  console.log('║  Step 6: Account Admins          ║');
  console.log('╚══════════════════════════════════╝\n');
  
  const admins = parseCSV('account_admin.csv');
  console.log(`📂 Loaded ${admins.length} admins from CSV`);
  
  let updated = 0, notFound = 0;
  
  for (const a of admins) {
    if (!a.andeuser_ptr_id) continue;
    
    const user = await prisma.dc_users.findUnique({ 
      where: { source_uuid: a.andeuser_ptr_id } 
    }).catch(() => null);
    
    if (!user) { notFound++; continue; }
    
    await prisma.dc_users.update({
      where: { user_id: user.user_id },
      data: { ut_id_fk: 2 }
    }).catch(() => {});
    updated++;
  }
  
  console.log(`✅ Admins: updated=${updated}, notFound=${notFound}`);
  console.log(`   Total admins (ut_id_fk=2): ${await prisma.dc_users.count({ where: { ut_id_fk: 2 } })}`);
  
  await prisma.$disconnect();
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
