const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const MIGRATION_DIR = path.join(__dirname, 'migration');

function parseCSV(f) {
  const fp = path.join(MIGRATION_DIR, f);
  if (!fs.existsSync(fp)) return [];
  const c = fs.readFileSync(fp, 'utf8'), rows = [], len = c.length;
  let row = [], field = '', inQ = false;
  for (let i = 0; i < len; i++) {
    const ch = c[i];
    if (inQ) { if (ch === '"') { inQ = false; continue; } field += ch; continue; }
    if (ch === '"') { inQ = true; continue; }
    if (ch === ',') { row.push(field.trim()); field = ''; continue; }
    if (ch === '\r') continue;
    if (ch === '\n') { row.push(field.trim()); field = ''; rows.push(row); row = []; continue; }
    field += ch;
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }
  if (rows.length < 2) return [];
  const hdrs = rows[0].map(h => h.replace(/"/g, ''));
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    if (rows[r].length === 1 && rows[r][0] === '') continue;
    const o = {}; hdrs.forEach((h, i) => o[h] = rows[r][i] || ''); out.push(o);
  }
  return out;
}

function toFloat(v) { if (!v || v === 'None' || v === 'NULL' || v === 'null' || v === '') return null; const n = parseFloat(v); return isNaN(n) ? null : n; }
function toInt(v) { if (!v || v === 'None' || v === 'NULL' || v === 'null' || v === '') return null; const n = parseInt(v); return isNaN(n) ? null : n; }
function toBool(v) { return String(v).toLowerCase() === 'true' || v === '1'; }
function toDate(v) { if (!v) return new Date(); const d = new Date(v); return isNaN(d.getTime()) ? new Date() : d; }

async function run() {
  const startTime = Date.now();
  console.log('=== Spirometry Complete Migration ===\n');
  
  const vpUsers = parseCSV('vitalport_user.csv');
  const observations = parseCSV('vitalport_observation.csv');
  const spiroData = parseCSV('vitalport_spirometry.csv');
  console.log('CSV: ' + vpUsers.length + ' users, ' + observations.length + ' obs, ' + spiroData.length + ' spiro\n');

  // Maps
  const vpIdToUuid = {};
  for (const vu of vpUsers) { if (vu.id && vu.user_id) vpIdToUuid[vu.id] = vu.user_id; }
  
  const allDcUsers = await prisma.dc_users.findMany({ where: { source_uuid: { not: null } }, select: { user_id: true, source_uuid: true } });
  const uuidToDcUserId = {};
  for (const u of allDcUsers) uuidToDcUserId[u.source_uuid] = u.user_id;
  
  const vpIdToDcUserId = {};
  for (const vu of vpUsers) { if (vu.id && vu.user_id && uuidToDcUserId[vu.user_id]) vpIdToDcUserId[vu.id] = uuidToDcUserId[vu.user_id]; }
  console.log('Users mapped: ' + Object.keys(vpIdToDcUserId).length + '\n');

  // Step 1: Observations
  console.log('Step 1: Migrating Observations...');
  let obsCreated = 0;
  for (const o of observations) {
    if (!o.id || !o.user_id) continue;
    const dcUserId = vpIdToDcUserId[o.user_id];
    if (!dcUserId) continue;
    try {
      await prisma.portal_observation.create({
        data: { user_id: dcUserId, dbdate: toDate(o.dbdate), fev1_grade: toInt(o.fev1_grade), fvc_grade: toInt(o.fvc_grade), is_post_bronchodilator: toBool(o.is_post_bronchodilator), height: toFloat(o.height) }
      });
      obsCreated++;
      if (obsCreated % 5000 === 0) console.log('   Obs: ' + obsCreated);
    } catch(e) {}
  }
  console.log('   Observations created: ' + obsCreated + '\n');

  // Step 2: Get observation IDs
  const dbObs = await prisma.portal_observation.findMany({ select: { id: true, user_id: true } });
  const userToObsId = {};
  for (const o of dbObs) userToObsId[o.user_id] = o.id;
  console.log('Step 2: Migrating Spirometry...');
  
  let spiroCreated = 0;
  for (const s of spiroData) {
    if (!s.observation_id) continue;
    const dcUserId = vpIdToDcUserId[s.observation_id];
    if (!dcUserId) continue;
    const obsId = userToObsId[dcUserId];
    if (!obsId) continue;
    try {
      await prisma.portal_spirometry.create({
        data: { observation_id: obsId, dbdate: toDate(s.dbdate), fvc: toFloat(s.fvc), fev1: toFloat(s.fev1), pefr: toFloat(s.pefr), fef2575: toFloat(s.fef2575), fev6: toFloat(s.fev6), fev1_perc: toFloat(s['fev1Perc'] || s.fev1Perc), btps: toFloat(s.btps), temp_celsius: toFloat(s['tempCelsius'] || s.tempCelsius), quality_message: toFloat(s['qualityMessage'] || s.qualityMessage) }
      });
      spiroCreated++;
      if (spiroCreated % 2000 === 0) console.log('   Spiro: ' + spiroCreated);
    } catch(e) {}
  }
  console.log('   Spirometry created: ' + spiroCreated + '\n');

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('=== DONE in ' + duration + 's ===');
  console.log('Observations: ' + await prisma.portal_observation.count());
  console.log('Spirometry: ' + await prisma.portal_spirometry.count());
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
