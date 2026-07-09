const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const MIGRATION_DIR = path.join(__dirname, 'migration');
const DEFAULT_PASSWORD = 'Welcome2026!';
let phoneCounter = Date.now();
function uniquePhone() { phoneCounter++; return 'vp-' + phoneCounter; }

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

function toFloat(v) { if (!v || v === 'None' || v === 'NULL' || v === 'null' || v === '') return null; const n = parseFloat(v); return isNaN(n) ? null : n; }
function toInt(v) { if (!v || v === 'None' || v === 'NULL' || v === 'null' || v === '') return null; const n = parseInt(v); return isNaN(n) ? null : n; }
function toBool(v) { return String(v).toLowerCase() === 'true' || v === '1'; }
function toDate(v) { if (!v) return new Date(); const d = new Date(v); return isNaN(d.getTime()) ? new Date() : d; }

async function run() {
  const startTime = Date.now();
  console.log('=== Spirometry Migration (FAST) ===\n');

  const vpUsers = parseCSV('vitalport_user.csv');
  const observations = parseCSV('vitalport_observation.csv');
  const spiroData = parseCSV('vitalport_spirometry.csv');
  console.log('Loaded: ' + vpUsers.length + ' users, ' + observations.length + ' obs, ' + spiroData.length + ' spiro\n');

  const vpIdToUuid = {};
  for (const vu of vpUsers) { if (vu.id && vu.user_id) vpIdToUuid[vu.id] = vu.user_id; }
  console.log('Step 1: Mapped ' + Object.keys(vpIdToUuid).length + ' users');

  const allDcUsers = await prisma.dc_users.findMany({ where: { source_uuid: { not: null } }, select: { user_id: true, source_uuid: true } });
  const uuidToDcUserId = {};
  for (const u of allDcUsers) uuidToDcUserId[u.source_uuid] = u.user_id;
  console.log('Step 2: Loaded ' + allDcUsers.length + ' dc_users');

  const missingUuids = new Set();
  for (const vu of vpUsers) { if (vu.user_id && !uuidToDcUserId[vu.user_id]) missingUuids.add(vu.user_id); }
  console.log('Step 3: Missing users: ' + missingUuids.size);
  
  if (missingUuids.size > 0) {
    const hp = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    let c = 0;
    for (const uuid of missingUuids) {
      try {
        const u = await prisma.dc_users.create({
          data: { email: 'vp_' + uuid.substring(0,8) + '@vitalflo.com', phone: uniquePhone(), password: hp, f_name: 'SpiroUser', l_name: uuid.substring(0,8), us_id_fk: 1, ut_id_fk: 4, is_availible: true, reg_date: new Date(), source_uuid: uuid }
        });
        uuidToDcUserId[uuid] = u.user_id; c++;
      } catch(e) {}
    }
    console.log('Step 3: Created ' + c + ' missing users');
  }

  const vpIdToDcUserId = {};
  for (const vu of vpUsers) { if (vu.id && vu.user_id && uuidToDcUserId[vu.user_id]) vpIdToDcUserId[vu.id] = uuidToDcUserId[vu.user_id]; }
  console.log('Step 4: Final map: ' + Object.keys(vpIdToDcUserId).length);

  console.log('\nStep 5: Migrating observations...');
  const obsData = [];
  for (const o of observations) {
    if (!o.id || !o.user_id) continue;
    const dcUserId = vpIdToDcUserId[o.user_id];
    if (!dcUserId) continue;
    obsData.push({ user_id: dcUserId, dbdate: toDate(o.dbdate), fev1_grade: toInt(o.fev1_grade), fvc_grade: toInt(o.fvc_grade), is_post_bronchodilator: toBool(o.is_post_bronchodilator), height: toFloat(o.height) });
  }
  for (let i = 0; i < obsData.length; i += 1000) {
    await prisma.portal_observation.createMany({ data: obsData.slice(i, i + 1000), skipDuplicates: true });
    if (i % 5000 === 0) console.log('   ' + Math.min(i + 1000, obsData.length) + '/' + obsData.length);
  }
  console.log('   Created: ' + obsData.length + ' observations');

  const dbObs = await prisma.portal_observation.findMany({ select: { id: true, user_id: true } });
  const userToObsId = {};
  for (const o of dbObs) userToObsId[o.user_id] = o.id;
  console.log('\nStep 6: Migrating spirometry...');
  
  const spiroBatch = [];
  for (const s of spiroData) {
    if (!s.observation_id) continue;
    const dcUserId = vpIdToDcUserId[s.observation_id];
    if (!dcUserId) continue;
    const obsId = userToObsId[dcUserId];
    if (!obsId) continue;
    spiroBatch.push({ observation_id: obsId, dbdate: toDate(s.dbdate), fvc: toFloat(s.fvc), fev1: toFloat(s.fev1), pefr: toFloat(s.pefr), fef2575: toFloat(s.fef2575), fev6: toFloat(s.fev6), fev1_perc: toFloat(s['fev1Perc'] || s.fev1Perc), btps: toFloat(s.btps), temp_celsius: toFloat(s['tempCelsius'] || s.tempCelsius), quality_message: toFloat(s['qualityMessage'] || s.qualityMessage) });
  }
  for (let i = 0; i < spiroBatch.length; i += 1000) {
    await prisma.portal_spirometry.createMany({ data: spiroBatch.slice(i, i + 1000), skipDuplicates: true });
    if (i % 10000 === 0) console.log('   ' + Math.min(i + 1000, spiroBatch.length) + '/' + spiroBatch.length);
  }
  console.log('   Created: ' + spiroBatch.length + ' spirometry');

  console.log('\n=== DONE in ' + ((Date.now() - startTime) / 1000).toFixed(1) + 's ===');
  console.log('Observations: ' + await prisma.portal_observation.count());
  console.log('Spirometry: ' + await prisma.portal_spirometry.count());
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
