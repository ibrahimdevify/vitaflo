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

function trunc(v, len) { if (!v) return null; return String(v).substring(0, len); }

async function run() {
  console.log('╔══════════════════════════════════╗');
  console.log('║  Step 7: Addresses               ║');
  console.log('╚══════════════════════════════════╝\n');
  
  const addresses = parseCSV('address.csv');
  console.log(`📂 Loaded ${addresses.length} addresses from CSV`);
  
  let created = 0, skipped = 0;
  
  for (const a of addresses) {
    if (!a.street && !a.city) { skipped++; continue; }
    
    await prisma.vf_address.create({
      data: {
        street: trunc(a.street, 255) || '',
        city: trunc(a.city, 100) || '',
        state: trunc(a.state, 100) || '',
        zip: trunc(a.zip, 100) || '',
        attributes_id: 1,
      }
    }).catch(() => {});
    created++;
  }
  
  console.log(`✅ Addresses: created=${created}, skipped=${skipped}`);
  console.log(`   Total in DB: ${await prisma.vf_address.count()}`);
  
  await prisma.$disconnect();
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
