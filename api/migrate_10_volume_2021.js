const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const MIGRATION_DIR = path.join(__dirname, 'migration');

function parseCSV(filename) {
  const filepath = path.join(MIGRATION_DIR, filename);
  if (!fs.existsSync(filepath)) { console.log('File not found: ' + filename); return []; }
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

async function run() {
  console.log('=== Volume Migration 2021 ===\n');

  // Load CSVs needed for mapping
  console.log('Loading mapping files...');
  const volumeData = parseCSV('vitalport_volume_2021.csv');
  const spiroData = parseCSV('vitalport_spirometry.csv');
  const vpUsers = parseCSV('vitalport_user.csv');
  
  console.log('Volume rows: ' + volumeData.length);
  console.log('Spiro rows: ' + spiroData.length);
  console.log('VP Users: ' + vpUsers.length + '\n');

  // Step 1: Build old_spirometry_id → observation_id map
  console.log('Step 1: Building spirometry_id → observation_id map...');
  const spiroToObs = {};
  for (const s of spiroData) {
    if (s.id && s.observation_id) spiroToObs[s.id] = s.observation_id;
  }
  console.log('   Mapped: ' + Object.keys(spiroToObs).length + ' spirometry records\n');

  // Step 2: Build vitalport_user.id → UUID map
  console.log('Step 2: Building user ID → UUID map...');
  const vpIdToUuid = {};
  for (const vu of vpUsers) {
    if (vu.id && vu.user_id) vpIdToUuid[vu.id] = vu.user_id;
  }
  console.log('   Mapped: ' + Object.keys(vpIdToUuid).length + ' users\n');

  // Step 3: Get dc_users UUID → user_id map
  console.log('Step 3: Loading dc_users...');
  const allDcUsers = await prisma.dc_users.findMany({
    where: { source_uuid: { not: null } },
    select: { user_id: true, source_uuid: true }
  });
  const uuidToDcUserId = {};
  for (const u of allDcUsers) uuidToDcUserId[u.source_uuid] = u.user_id;
  console.log('   Loaded: ' + allDcUsers.length + ' users\n');

  // Step 4: Get portal_observation user_id → id map
  console.log('Step 4: Loading portal_observation...');
  const allObs = await prisma.portal_observation.findMany({
    select: { id: true, user_id: true }
  });
  const dcUserIdToObsId = {};
  for (const o of allObs) dcUserIdToObsId[o.user_id] = o.id;
  console.log('   Loaded: ' + allObs.length + ' observations\n');

  // Step 5: Get portal_spirometry observation_id → id map
  console.log('Step 5: Loading portal_spirometry...');
  const allPortalSpiro = await prisma.portal_spirometry.findMany({
    select: { id: true, observation_id: true }
  });
  const obsIdToSpiroId = {};
  for (const s of allPortalSpiro) obsIdToSpiroId[s.observation_id] = s.id;
  console.log('   Loaded: ' + allPortalSpiro.length + ' spirometry records\n');

  // Step 6: Migrate volume data
  console.log('Step 6: Migrating volume records...');
  let created = 0, skipped = 0, noMatch = 0;
  
  // Build batch
  const batch = [];
  
  for (const v of volumeData) {
    if (!v.spirometry_id) { skipped++; continue; }
    
    // Chain: old_spiro_id → observation_id → vp_user_id → UUID → dc_user_id → obs_id → portal_spiro_id
    const oldObsId = spiroToObs[v.spirometry_id];
    if (!oldObsId) { noMatch++; continue; }
    
    const uuid = vpIdToUuid[oldObsId];
    if (!uuid) { noMatch++; continue; }
    
    const dcUserId = uuidToDcUserId[uuid];
    if (!dcUserId) { noMatch++; continue; }
    
    const portalObsId = dcUserIdToObsId[dcUserId];
    if (!portalObsId) { noMatch++; continue; }
    
    const portalSpiroId = obsIdToSpiroId[portalObsId];
    if (!portalSpiroId) { noMatch++; continue; }
    
    batch.push({
      spirometry_id: portalSpiroId,
      volume: toFloat(v.volume) || 0,
      time: toFloat(v.time) || 0,
    });
    
    // Insert in batches of 100
    if (batch.length >= 100) {
      await prisma.portal_volume.createMany({ data: batch, skipDuplicates: true });
      created += batch.length;
      batch.length = 0;
      await new Promise(r => setTimeout(r, 50));
      if (created % 5000 === 0) console.log('   Volume: ' + created + '/' + volumeData.length);
    }
  }
  
  // Insert remaining
  if (batch.length > 0) {
    await prisma.portal_volume.createMany({ data: batch, skipDuplicates: true });
    created += batch.length;
  }
  
  console.log('\n=== DONE ===');
  console.log('Created: ' + created);
  console.log('Skipped: ' + skipped);
  console.log('No match: ' + noMatch);
  console.log('Total portal_volume: ' + await prisma.portal_volume.count());
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
