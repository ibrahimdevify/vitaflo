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

function toDate(v) { if (!v) return new Date(); const d = new Date(v); return isNaN(d.getTime()) ? new Date() : d; }
function trunc(v, len) { if (!v) return null; return String(v).substring(0, len); }

async function run() {
  console.log('╔══════════════════════════════════╗');
  console.log('║  Step 5: Accounts                ║');
  console.log('╚══════════════════════════════════╝\n');
  
  const accounts = parseCSV('account.csv');
  console.log(`📂 Loaded ${accounts.length} accounts from CSV`);
  
  let created = 0, skipped = 0;
  
  for (const a of accounts) {
    if (!a.id || !a.name) { skipped++; continue; }
    
    const exists = await prisma.vf_account.findFirst({
      where: { name: a.name }
    }).catch(() => null);
    
    if (exists) { skipped++; continue; }
    
    await prisma.vf_account.create({
      data: {
        name: trunc(a.name, 50) || 'Unnamed Account',
        creation_date: toDate(a.creation_date),
      }
    }).catch(() => {});
    created++;
  }
  
  console.log(`✅ Accounts: created=${created}, skipped=${skipped}`);
  console.log(`   Total in DB: ${await prisma.vf_account.count()}`);
  
  await prisma.$disconnect();
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
