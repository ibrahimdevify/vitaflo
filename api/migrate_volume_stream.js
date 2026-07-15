const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const prisma = new PrismaClient();
const MIGRATION_DIR = path.join(__dirname, 'migration');

function toFloat(v) { if (!v || v === 'None' || v === 'NULL' || v === 'null' || v === '') return null; const n = parseFloat(v); return isNaN(n) ? null : n; }

async function run() {
  const year = process.argv[2] || '2023';
  console.log('=== Volume ' + year + ' (Stream) ===\n');
  
  const filepath = path.join(MIGRATION_DIR, 'vitalport_volume_' + year + '.csv');
  console.log('File: ' + (fs.statSync(filepath).size / 1024 / 1024).toFixed(1) + ' MB');

  // Build maps
  console.log('Loading maps...');
  const spiroRaw = fs.readFileSync(path.join(MIGRATION_DIR, 'vitalport_spirometry.csv'), 'utf8').split('\n');
  const spiroToObs = {};
  for (let i = 1; i < spiroRaw.length; i++) {
    const v = spiroRaw[i].split(',');
    if (v[0] && v[1]) spiroToObs[v[0].replace(/"/g, '')] = v[1].replace(/"/g, '');
  }
  
  const userRaw = fs.readFileSync(path.join(MIGRATION_DIR, 'vitalport_user.csv'), 'utf8').split('\n');
  const vpIdToUuid = {};
  for (let i = 1; i < userRaw.length; i++) {
    const v = userRaw[i].split(',');
    if (v[0] && v[1]) vpIdToUuid[v[0].replace(/"/g, '')] = v[1].replace(/"/g, '');
  }
  
  const allDcUsers = await prisma.dc_users.findMany({ where: { source_uuid: { not: null } }, select: { user_id: true, source_uuid: true } });
  const uuidToDcUserId = {};
  for (const u of allDcUsers) uuidToDcUserId[u.source_uuid] = u.user_id;
  
  const allObs = await prisma.portal_observation.findMany({ select: { id: true, user_id: true } });
  const dcUserIdToObsId = {};
  for (const o of allObs) dcUserIdToObsId[o.user_id] = o.id;
  
  const allPortalSpiro = await prisma.portal_spirometry.findMany({ select: { id: true, observation_id: true } });
  const obsIdToSpiroId = {};
  for (const s of allPortalSpiro) obsIdToSpiroId[s.observation_id] = s.id;
  console.log('Maps ready\n');

  // Stream file
  const rl = readline.createInterface({ input: fs.createReadStream(filepath) });
  
  let created = 0, noMatch = 0, lineNum = 0, isHeader = true;
  const batch = [];
  
  for await (const line of rl) {
    if (isHeader) { isHeader = false; continue; }
    lineNum++;
    
    const vals = line.split(',');
    const spiroId = vals[3]?.replace(/"/g, '');
    if (!spiroId) { noMatch++; continue; }
    
    const oldObsId = spiroToObs[spiroId];
    if (!oldObsId) { noMatch++; continue; }
    const uuid = vpIdToUuid[oldObsId];
    if (!uuid) { noMatch++; continue; }
    const dcUserId = uuidToDcUserId[uuid];
    if (!dcUserId) { noMatch++; continue; }
    const portalObsId = dcUserIdToObsId[dcUserId];
    if (!portalObsId) { noMatch++; continue; }
    const portalSpiroId = obsIdToSpiroId[portalObsId];
    if (!portalSpiroId) { noMatch++; continue; }
    
    batch.push({ spirometry_id: portalSpiroId, volume: toFloat(vals[1]) || 0, time: toFloat(vals[2]) || 0 });
    
    if (batch.length >= 50) {
      await prisma.portal_volume.createMany({ data: batch, skipDuplicates: true });
      created += batch.length;
      batch.length = 0;
      if (created % 10000 === 0) console.log('   ' + created);
    }
  }
  
  if (batch.length > 0) {
    await prisma.portal_volume.createMany({ data: batch, skipDuplicates: true });
    created += batch.length;
  }
  
  console.log('\nCreated: ' + created + ', NoMatch: ' + noMatch);
  console.log('DB: ' + await prisma.portal_volume.count());
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
