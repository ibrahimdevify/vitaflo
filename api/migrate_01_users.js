const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const MIGRATION_DIR = path.join(__dirname, 'migration');
const DEFAULT_PASSWORD = 'Welcome2026!';
let phoneCounter = Date.now();
function uniquePhone() { phoneCounter++; return 'mig-' + phoneCounter; }

function parseCSV(filename) {
  const filepath = path.join(MIGRATION_DIR, filename);
  if (!fs.existsSync(filepath)) { console.log('❌ File not found: ' + filename); return []; }
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
function toDate(v) { if (!v) return new Date(); const d = new Date(v); return isNaN(d.getTime()) ? new Date() : d; }
function trunc(v, len) { if (!v) return null; return String(v).substring(0, len); }

async function run() {
  console.log('╔══════════════════════════════════╗');
  console.log('║  Step 1: Migrate Users ONLY      ║');
  console.log('╚══════════════════════════════════╝\n');
  
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const users = parseCSV('users.csv');
  
  console.log(`📂 Loaded ${users.length} users from CSV`);
  
  let created = 0, skipped = 0, errors = 0;
  
  for (const u of users) {
    if (!u.id) { skipped++; continue; }
    
    const email = u.email || u.username || 'user_' + u.id.substring(0,8) + '@migrated.com';
    
    try {
      const existing = await prisma.dc_users.findUnique({ where: { email } }).catch(() => null);
      if (existing) { skipped++; continue; }
      
      await prisma.dc_users.create({
        data: {
          email,
          phone: uniquePhone(),
          password: hashedPassword,
          f_name: trunc(u.username || 'User', 255) || 'User',
          l_name: '',
          us_id_fk: toBool(u.is_active) ? 1 : 2,
          ut_id_fk: 4, // All as patient first
          is_availible: true,
          reg_date: toDate(u.date_joined),
          source_uuid: u.id, // 🔑 Store the UUID
        }
      });
      created++;
      if (created % 500 === 0) console.log(`   📊 ${created}/${users.length} users created`);
    } catch(e) {
      errors++;
      if (errors <= 3) console.error(`   ❌ Error: ${e.message.substring(0, 100)}`);
    }
  }
  
  const total = await prisma.dc_users.count();
  console.log(`\n✅ COMPLETED:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors:  ${errors}`);
  console.log(`   Total users in DB: ${total}`);
  console.log(`   All passwords: ${DEFAULT_PASSWORD}`);
  
  await prisma.$disconnect();
}

run().catch(e => console.error('💥 FATAL:', e)).finally(() => prisma.$disconnect());
