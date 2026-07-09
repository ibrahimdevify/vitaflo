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

function toBool(v) { return String(v).toLowerCase() === 'true'; }
function toDate(v) { if (!v) return new Date(); const d = new Date(v); return isNaN(d.getTime()) ? new Date() : d; }
function trunc(v, len) { if (!v) return null; return String(v).substring(0, len); }

async function run() {
  console.log('╔══════════════════════════════════╗');
  console.log('║  Step 1: Migrate Users (FIXED)   ║');
  console.log('╚══════════════════════════════════╝\n');
  
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const users = parseCSV('users.csv');
  
  console.log('Loaded ' + users.length + ' users from CSV\n');
  
  let created = 0, skipped = 0, errors = 0;
  let emailCounter = 0;
  
  for (const u of users) {
    if (!u.id) { skipped++; continue; }
    
    emailCounter++;
    // Use unique email based on counter - guaranteed unique
    const email = 'user' + emailCounter + '@vitalflo.com';
    
    try {
      await prisma.dc_users.create({
        data: {
          email: email,
          phone: uniquePhone(),
          password: hashedPassword,
          f_name: trunc(u.username || 'User', 255) || 'User',
          l_name: '',
          us_id_fk: toBool(u.is_active) ? 1 : 2,
          ut_id_fk: 4,
          is_availible: true,
          reg_date: toDate(u.date_joined),
          source_uuid: u.id,
        }
      });
      created++;
      if (created % 1000 === 0) console.log('   ' + created + '/' + users.length + ' users');
    } catch(e) {
      errors++;
      if (errors <= 3) console.error('   Error: ' + e.message.substring(0, 80));
    }
  }
  
  const total = await prisma.dc_users.count();
  console.log('\n========================================');
  console.log('  Created: ' + created);
  console.log('  Skipped: ' + skipped);
  console.log('  Errors:  ' + errors);
  console.log('  Total in DB: ' + total);
  console.log('  Password: ' + DEFAULT_PASSWORD);
  console.log('========================================');
  
  await prisma.$disconnect();
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
