const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const MIGRATION_DIR = path.join(__dirname, 'migration');
const prisma = new PrismaClient();

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
function toDate(v) { if (!v) return new Date(); const d = new Date(v); return isNaN(d.getTime()) ? new Date() : d; }

async function run() {
  console.log('=== Spirometry Final ===');
  
  const vpUsers = parseCSV('vitalport_user.csv');
  const spiroData = parseCSV('vitalport_spirometry.csv');
  
  const vpIdToUuid = {};
  for (const vu of vpUsers) { if (vu.id && vu.user_id) vpIdToUuid[vu.id] = vu.user_id; }
  
  const allDcUsers = await prisma.dc_users.findMany({ where: { source_uuid: { not: null } }, select: { user_id: true, source_uuid: true } });
  const uuidToDcUserId = {};
  for (const u of allDcUsers) uuidToDcUserId[u.source_uuid] = u.user_id;
  
  const vpIdToDcUserId = {};
  for (const vu of vpUsers) { if (vu.id && vu.user_id && uuidToDcUserId[vu.user_id]) vpIdToDcUserId[vu.id] = uuidToDcUserId[vu.user_id]; }
  
  const dbObs = await prisma.portal_observation.findMany({ select: { id: true, user_id: true } });
  const userToObsId = {};
  for (const o of dbObs) userToObsId[o.user_id] = o.id;
  
  console.log('Ready. Obs: ' + dbObs.length + '\n');
  
  let created = 0, skipped = 0;
  
  for (let i = 0; i < spiroData.length; i++) {
    const s = spiroData[i];
    if (!s.observation_id) { skipped++; continue; }
    const dcUserId = vpIdToDcUserId[s.observation_id];
    if (!dcUserId) { skipped++; continue; }
    const obsId = userToObsId[dcUserId];
    if (!obsId) { skipped++; continue; }
    
    try {
      await prisma.portal_spirometry.create({
        data: {
          observation_id: obsId, dbdate: toDate(s.dbdate),
          fvc: toFloat(s.fvc), fev1: toFloat(s.fev1), pefr: toFloat(s.pefr),
          fef2575: toFloat(s.fef2575), fev6: toFloat(s.fev6),
          fev1_perc: toFloat(s['fev1Perc'] || s.fev1Perc),
          btps: toFloat(s.btps),
          temp_celsius: toFloat(s['tempCelsius'] || s.tempCelsius),
          quality_message: toFloat(s['qualityMessage'] || s.qualityMessage),
        }
      });
      created++;
    } catch(e) { skipped++; }
    
    if (created % 500 === 0) console.log('   ' + created + ' created');
  }
  
  console.log('\nDONE: created=' + created + ', skipped=' + skipped);
  console.log('Total DB: ' + await prisma.portal_spirometry.count());
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
