/**
 * Step 9: Spirometry Migration (Database 2 → MySQL)
 * 
 * CORRECT MAPPING CHAIN:
 *   spirometry.observation_id → observation.id
 *   observation.user_id → vitalport_user.id
 *   vitalport_user.user_id (UUID) → dc_users.source_uuid
 *   dc_users.source_uuid → dc_users.user_id
 */

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
  if (!fs.existsSync(filepath)) { console.log('  File not found: ' + filename); return []; }
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
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Step 9: Spirometry Migration            ║');
  console.log('║  DB2 (vitalport) → Render MySQL          ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // Load CSVs
  console.log('📂 Loading CSV files...');
  const vpUsers = parseCSV('vitalport_user.csv');
  const observations = parseCSV('vitalport_observation.csv');
  const spiroData = parseCSV('vitalport_spirometry.csv');
  console.log('   vitalport_user: ' + vpUsers.length + ' rows');
  console.log('   observations: ' + observations.length + ' rows');
  console.log('   spirometry: ' + spiroData.length + ' rows\n');

  // STEP 1: Build vitalport_user.id → UUID map
  console.log('🔧 Step 1: Map vitalport_user.id → UUID');
  const vpIdToUuid = {};
  for (const vu of vpUsers) {
    if (vu.id && vu.user_id) vpIdToUuid[vu.id] = vu.user_id;
  }
  console.log('   Mapped: ' + Object.keys(vpIdToUuid).length + ' users\n');

  // STEP 2: Get all dc_users with source_uuid
  console.log('🔧 Step 2: Load dc_users.source_uuid mapping');
  const allDcUsers = await prisma.dc_users.findMany({
    where: { source_uuid: { not: null } },
    select: { user_id: true, source_uuid: true }
  });
  const uuidToDcUserId = {};
  for (const u of allDcUsers) {
    uuidToDcUserId[u.source_uuid] = u.user_id;
  }
  console.log('   Loaded: ' + allDcUsers.length + ' users\n');

  // STEP 3: Check missing UUIDs and create users
  console.log('🔧 Step 3: Find and create missing users');
  const missingUuids = new Set();
  let matchedCount = 0;
  for (const vu of vpUsers) {
    if (!vu.user_id) continue;
    if (uuidToDcUserId[vu.user_id]) matchedCount++;
    else missingUuids.add(vu.user_id);
  }
  console.log('   Matched: ' + matchedCount);
  console.log('   Missing: ' + missingUuids.size);

  if (missingUuids.size > 0) {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    let created = 0;
    for (const uuid of missingUuids) {
      const email = 'vp_' + uuid.substring(0, 8) + '@vitalflo.com';
      try {
        const existing = await prisma.dc_users.findUnique({ where: { source_uuid: uuid } }).catch(() => null);
        if (existing) { uuidToDcUserId[uuid] = existing.user_id; continue; }
        const newUser = await prisma.dc_users.create({
          data: {
            email, phone: uniquePhone(), password: hashedPassword,
            f_name: 'SpiroUser', l_name: uuid.substring(0, 8),
            us_id_fk: 1, ut_id_fk: 4, is_availible: true,
            reg_date: new Date(), source_uuid: uuid,
          }
        });
        uuidToDcUserId[uuid] = newUser.user_id;
        created++;
      } catch(e) { console.error('   Error: ' + e.message.substring(0, 80)); }
    }
    console.log('   Created: ' + created + ' new users\n');
  }

  // STEP 4: Build FINAL lookup: vitalport_user.id → dc_users.user_id
  console.log('🔧 Step 4: Build final lookup map');
  const vpIdToDcUserId = {};
  for (const vu of vpUsers) {
    if (!vu.id || !vu.user_id) continue;
    const dcUserId = uuidToDcUserId[vu.user_id];
    if (dcUserId) vpIdToDcUserId[vu.id] = dcUserId;
  }
  console.log('   Final map: ' + Object.keys(vpIdToDcUserId).length + ' entries\n');

  // STEP 5: Migrate Observations
  console.log('📋 Step 5: Migrating Observations (' + observations.length + ' rows)...');
  let obsCreated = 0, obsSkipped = 0, obsNoUser = 0;
  
  for (const o of observations) {
    if (!o.id || !o.user_id) { obsSkipped++; continue; }
    const dcUserId = vpIdToDcUserId[o.user_id];
    if (!dcUserId) { obsNoUser++; continue; }
    try {
      await prisma.portal_observation.create({
        data: {
          user_id: dcUserId,
          dbdate: toDate(o.dbdate),
          fev1_grade: toInt(o.fev1_grade),
          fvc_grade: toInt(o.fvc_grade),
          is_post_bronchodilator: toBool(o.is_post_bronchodilator),
          height: toFloat(o.height),
        }
      });
      obsCreated++;
      if (obsCreated % 5000 === 0) console.log('   ' + obsCreated + ' observations');
    } catch(e) { obsSkipped++; }
  }
  console.log('   Created: ' + obsCreated + ' | Skipped: ' + obsSkipped + ' | NoUser: ' + obsNoUser + '\n');

  // STEP 6: Migrate Spirometry
  console.log('📋 Step 6: Migrating Spirometry (' + spiroData.length + ' rows)...');
  const allObs = await prisma.portal_observation.findMany({ select: { id: true, user_id: true } });
  console.log('   DB observations: ' + allObs.length);
  
  let spiroCreated = 0, spiroSkipped = 0, spiroNoObs = 0;
  
  for (const s of spiroData) {
    if (!s.id || !s.observation_id) { spiroSkipped++; continue; }
    const dcUserId = vpIdToDcUserId[s.observation_id];
    if (!dcUserId) { spiroNoObs++; continue; }
    const obs = allObs.find(o => o.user_id === dcUserId);
    if (!obs) { spiroNoObs++; continue; }
    try {
      await prisma.portal_spirometry.create({
        data: {
          observation_id: obs.id,
          dbdate: toDate(s.dbdate),
          fvc: toFloat(s.fvc), fev1: toFloat(s.fev1), pefr: toFloat(s.pefr),
          fef2575: toFloat(s.fef2575), fev6: toFloat(s.fev6),
          fev1_perc: toFloat(s['fev1Perc'] || s.fev1Perc),
          btps: toFloat(s.btps),
          temp_celsius: toFloat(s['tempCelsius'] || s.tempCelsius),
          quality_message: toFloat(s['qualityMessage'] || s.qualityMessage),
          symptom: s.symptom || null,
        }
      });
      spiroCreated++;
      if (spiroCreated % 10000 === 0) console.log('   ' + spiroCreated + ' spirometry');
    } catch(e) { spiroSkipped++; }
  }
  console.log('   Created: ' + spiroCreated + ' | Skipped: ' + spiroSkipped + ' | NoObs: ' + spiroNoObs + '\n');

  // FINAL REPORT
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🎉 MIGRATION COMPLETE                   ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  New users:    ' + String(missingUuids.size).padStart(6) + '                       ║');
  console.log('║  Observations: ' + String(obsCreated).padStart(6) + '                       ║');
  console.log('║  Spirometry:   ' + String(spiroCreated).padStart(6) + '                       ║');
  console.log('║  Duration:     ' + String(duration + 's').padStart(6) + '                       ║');
  console.log('║  Total users:  ' + String(await prisma.dc_users.count()).padStart(6) + '                       ║');
  console.log('║  Total obs:    ' + String(await prisma.portal_observation.count()).padStart(6) + '                       ║');
  console.log('║  Total spiro:  ' + String(await prisma.portal_spirometry.count()).padStart(6) + '                       ║');
  console.log('╚══════════════════════════════════════════╝');
}

run().catch(e => console.error('💥 FATAL:', e)).finally(() => prisma.$disconnect());
