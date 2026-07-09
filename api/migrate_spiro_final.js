const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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
function toDate(v) { if (!v) return new Date(); const d = new Date(v); return isNaN(d.getTime()) ? new Date() : d; }

async function run() {
  console.log('=== Spirometry Final ===\n');
  
  const vpUsers = parseCSV('vitalport_user.csv');
  const spiroData = parseCSV('vitalport_spirometry.csv');
  
  const vpIdToUuid = {};
  for (const vu of vpUsers) { if (vu.id && vu.user_id) vpIdToUuid[vu.id] = vu.user_id; }
  
  let prisma = new PrismaClient();
  const allDcUsers = await prisma.dc_users.findMany({ where: { source_uuid: { not: null } }, select: { user_id: true, source_uuid: true } });
  const uuidToDcUserId = {};
  for (const u of allDcUsers) uuidToDcUserId[u.source_uuid] = u.user_id;
  
  const vpIdToDcUserId = {};
  for (const vu of vpUsers) { if (vu.id && vu.user_id && uuidToDcUserId[vu.user_id]) vpIdToDcUserId[vu.id] = uuidToDcUserId[vu.user_id]; }
  
  const dbObs = await prisma.portal_observation.findMany({ select: { id: true, user_id: true } });
  const userToObsId = {};
  for (const o of dbObs) userToObsId[o.user_id] = o.id;
  await prisma.$disconnect();
  
  console.log('Ready. Obs: ' + dbObs.length + ', Spiro CSV: ' + spiroData.length + '\n');
  
  let created = 0, skipped = 0, errors = 0;
  
  for (let i = 0; i < spiroData.length; i++) {
    const s = spiroData[i];
    if (!s.observation_id) { skipped++; continue; }
    const dcUserId = vpIdToDcUserId[s.observation_id];
    if (!dcUserId) { skipped++; continue; }
    const obsId = userToObsId[dcUserId];
    if (!obsId) { skipped++; continue; }
    
    // Retry up to 3 times with new connection
    let success = false;
    for (let retry = 0; retry < 3; retry++) {
      try {
        const p = new PrismaClient();
        await p.portal_spirometry.create({
          data: {
            observation_id: obsId,
            dbdate: toDate(s.dbdate),
            fvc: toFloat(s.fvc), fev1: toFloat(s.fev1), pefr: toFloat(s.pefr),
            fef2575: toFloat(s.fef2575), fev6: toFloat(s.fev6),
            fev1_perc: toFloat(s['fev1Perc'] || s.fev1Perc),
            btps: toFloat(s.btps),
            temp_celsius: toFloat(s['tempCelsius'] || s.tempCelsius),
            quality_message: toFloat(s['qualityMessage'] || s.qualityMessage),
          }
        });
        await p.$disconnect();
        created++;
        success = true;
        break;
      } catch(e) {
        if (retry < 2) await new Promise(r => setTimeout(r, 1000));
      }
    }
    if (!success) { errors++; skipped++; }
    
    if (created % 1000 === 0) console.log('   ' + i + '/' + spiroData.length + ' (created: ' + created + ', skipped: ' + skipped + ')');
  }
  
  const p = new PrismaClient();
  console.log('\n=== DONE ===');
  console.log('Created: ' + created);
  console.log('Skipped: ' + skipped);
  console.log('Errors: ' + errors);
  console.log('Total DB: ' + await p.portal_spirometry.count());
  await p.$disconnect();
}

run().catch(e => console.error(e));
