// convert_gli.js
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'gli2012_raw_coefficients.csv');
const JSON_PATH = path.join(__dirname, 'src', 'helpers', 'gli2012-coefficients.json');

const csv = fs.readFileSync(CSV_PATH, 'utf8');
const lines = csv.split('\n').filter((l) => l.trim().length > 0);

// Drop header
const dataLines = lines.slice(1);

// Build a map: { FEV1: { male: [ {agebound, ...coeffs}, ... ], female: [...] }, ... }
const out = {};

for (const line of dataLines) {
  // Simple CSV parse — values are quoted only when they contain letters
  const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());

  const gender = parts[0];         // "1" or "2"
  const f = parts[1];              // "FEV1", "FVC", ...
  const a0 = parseFloat(parts[2]);
  const a1 = parseFloat(parts[3]);
  const a2 = parseFloat(parts[4]);
  const a3 = parseFloat(parts[5]);
  const a4 = parseFloat(parts[6]);
  const a5 = parseFloat(parts[7]);
  const a6 = parseFloat(parts[8]);
  const p0 = parseFloat(parts[9]);
  const p1 = parseFloat(parts[10]);
  const p2 = parseFloat(parts[11]);
  const p3 = parseFloat(parts[12]);
  const p4 = parseFloat(parts[13]);
  const p5 = parseFloat(parts[14]);
  const q0 = parseFloat(parts[15]);
  const q1 = parseFloat(parts[16]);
  const agebound = parseFloat(parts[17]);
  const l0 = parseFloat(parts[18]);
  const l1 = parseFloat(parts[19]);
  const m0 = parseFloat(parts[20]);
  const m1 = parseFloat(parts[21]);
  const s0 = parseFloat(parts[22]);
  const s1 = parseFloat(parts[23]);

  // Only keep the four functions your app needs
  if (!['FEV1', 'FVC', 'FEV1FVC', 'FEF2575'].includes(f)) continue;

  if (!out[f]) out[f] = { male: [], female: [] };

  const sexKey = gender === '1' ? 'male' : 'female';

  out[f][sexKey].push({
    age: agebound,
    a0, a1, a2, a3, a4, a5, a6,
    p0, p1, p2, p3, p4, p5,
    q0, q1,
    l0, l1,
    m0, m1,
    s0, s1,
  });
}

// Sort each array by age
for (const f of Object.keys(out)) {
  out[f].male.sort((a, b) => a.age - b.age);
  out[f].female.sort((a, b) => a.age - b.age);
}

fs.writeFileSync(JSON_PATH, JSON.stringify(out));
const sizeKb = (fs.statSync(JSON_PATH).size / 1024).toFixed(1);
console.log(`Wrote ${JSON_PATH} (${sizeKb} KB)`);