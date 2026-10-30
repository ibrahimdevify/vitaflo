/**
 * Builds the HTML that gets rendered to PDF for the
 * "ATS Bronchodilator Responsiveness Report", matching the VitalFlo layout.
 *
 * @param {Object} data
 * @param {Object} data.patient  { name, id, referredBy, testDate, sex, reason,
 *                                 dob, spo2, age, height, weight, ethnicity,
 *                                 smoking, bmi }
 * @param {Object} data.pre      spirometry row (is_post_bronchodilator=false)
 * @param {Object} data.post     spirometry row (is_post_bronchodilator=true)
 * @param {Array}  data.preFlows   [{volume, flow}]
 * @param {Array}  data.postFlows  [{volume, flow}]
 * @param {Array}  data.preVolumes  [{time, volume}]
 * @param {Array}  data.postVolumes [{time, volume}]
 * @param {Object} [meta]
 * @param {string} [meta.logoDataUri]  `data:<mime>;base64,...` URI for the VitalFlo
 *                                     logo. Get this from services/reportService.js's
 *                                     `getLogoDataUri()` so both PDF systems share the
 *                                     same cached file lookup. Falls back to the
 *                                     original "VP" badge + text if omitted.
 * @returns {string} full HTML document
 */

const LLN_Z = -1.645; // standard GLI lower-limit-of-normal cutoff
const SCALE_MIN = -5;
const SCALE_MAX = 3;
const SCALE_RANGE = SCALE_MAX - SCALE_MIN;

function toPct(z) {
  const clamped = Math.max(SCALE_MIN, Math.min(SCALE_MAX, z));
  return ((clamped - SCALE_MIN) / SCALE_RANGE) * 100;
}

/**
 * Backend-embedded SVG with the original report's 420x300 chart footprint,
 * #1a4fbf pre and #c0392b post curves, linear axes and bottom legend.
 * Real portal_flow data uses `value` for flow, not `flow`. Do NOT invent post
 * data or curves. All rendering is offline and deterministic in Puppeteer.
 */
function drawReportCurve(preRows, postRows, kind, preFallback = [], postFallback = []) {
  const numeric = (v) => (v === null || v === undefined || v === '') ? null : Number(v);
  function points(rows, fallback) {
    const source = Array.isArray(rows) && rows.length ? rows : fallback;
    if (!Array.isArray(source)) return [];
    return source.map((r, i) => {
      const x = numeric(kind === 'flow-volume' ? r?.volume : r?.time);
      const y = numeric(kind === 'flow-volume' ? (r?.value ?? r?.flow) : r?.volume);
      return {x, y, t: numeric(r?.time), i};
    }).filter(p => p.x !== null && p.y !== null && Number.isFinite(p.x) && Number.isFinite(p.y))
      .sort((a, b) => kind === 'flow-volume' ? ((a.t ?? a.i) - (b.t ?? b.i)) : (a.x - b.x))
      .slice(0, 12000);
  }
  const pre = points(preRows, preFallback), post = points(postRows, postFallback);
  const all = pre.concat(post);
  const W = 420, H = 300, left = 46, right = 12, top = 12, bottom = 54;
  const pw = W - left - right, ph = H - top - bottom;
  const original = kind === 'flow-volume'
    ? {minX: -1, maxX: 6, minY: -6, maxY: 8, stepX: 1, stepY: 2}
    : {minX: 0, maxX: 6, minY: 0, maxY: 8, stepX: 1, stepY: 1};
  // Keep original axis ranges, extend only if measurements fall outside.
  const minX = all.length ? Math.min(original.minX, ...all.map(p => p.x)) : original.minX;
  const maxX = all.length ? Math.max(original.maxX, ...all.map(p => p.x)) : original.maxX;
  const minY = all.length ? Math.min(original.minY, ...all.map(p => p.y)) : original.minY;
  const maxY = all.length ? Math.max(original.maxY, ...all.map(p => p.y)) : original.maxY;
  const loX = Math.floor(minX / original.stepX) * original.stepX;
  const hiX = Math.ceil(maxX / original.stepX) * original.stepX;
  const loY = Math.floor(minY / original.stepY) * original.stepY;
  const hiY = Math.ceil(maxY / original.stepY) * original.stepY;
  const sx = x => left + (x - loX) / Math.max(1, hiX - loX) * pw;
  const sy = y => top + ph - (y - loY) / Math.max(1, hiY - loY) * ph;
  const lines = [];
  for (let i = 0; i <= 6; i++) {
    const x = left + i / 6 * pw, y = top + i / 6 * ph;
    lines.push(`<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${top}" y2="${top+ph}" stroke="#e6e6e6"/>`);
    lines.push(`<line x1="${left}" x2="${left+pw}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e6e6e6"/>`);
    const xt = (loX+(hiX-loX)*i/6).toFixed(1).replace(/\.0$/, '');
    const yt = (hiY-(hiY-loY)*i/6).toFixed(1).replace(/\.0$/, '');
    lines.push(`<text x="${x.toFixed(1)}" y="${top+ph+15}" font-size="9" fill="#666" text-anchor="middle">${xt}</text>`);
    lines.push(`<text x="${left-8}" y="${(y+3).toFixed(1)}" font-size="9" fill="#666" text-anchor="end">${yt}</text>`);
  }
  function pathFor(arr, color) {
    if (!arr.length) return '';
    // Bound SVG size for long spirometry records without altering raw data.
    const stride = Math.max(1, Math.ceil(arr.length / 1100));
    const data = arr.filter((_,i) => i % stride === 0);
    if (data[data.length-1] !== arr[arr.length-1]) data.push(arr[arr.length-1]);
    const d = data.map((p,i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(' ');
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  const plot = !all.length
    ? `<text x="${W/2}" y="${H/2}" fill="#777" text-anchor="middle" font-size="11">No recorded curve points available</text>`
    : pathFor(pre,'#1a4fbf') + pathFor(post,'#c0392b');
  const xTitle = kind === 'flow-volume' ? 'Volume (L)' : 'Time (s)';
  const yTitle = kind === 'flow-volume' ? 'Flow (L/s)' : 'Volume (L)';
  return `<svg width="420" height="300" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${xTitle} versus ${yTitle}">
    <rect width="420" height="300" fill="#fff"/>
    ${lines.join('')}
    ${plot}
    <text x="${W/2}" y="${H-31}" font-size="10" fill="#555" text-anchor="middle">${xTitle}</text>
    <text transform="translate(12,${H/2}) rotate(-90)" font-size="10" fill="#555" text-anchor="middle">${yTitle}</text>
    <line x1="250" x2="268" y1="285" y2="285" stroke="#1a4fbf" stroke-width="2"/>
    <text x="272" y="288" font-size="10" fill="#555">pre</text>
    <line x1="315" x2="333" y1="285" y2="285" stroke="#c0392b" stroke-width="2"/>
    <text x="337" y="288" font-size="10" fill="#555">post</text>
  </svg>`;
}

function buildSpirometryReportHtml(data, meta = {}) {
  const { patient, pre, post, preFlows, postFlows, preVolumes, postVolumes } = data;

  const fmt = (v, digits = 2) =>
    v === null || v === undefined || Number.isNaN(v) ? 'N/A' : Number(v).toFixed(digits);

  const pct = (v) => (v === null || v === undefined ? 'N/A' : `${Math.round(v)}%`);

  const changeMl = (a, b) =>
    a === null || b === null || a === undefined || b === undefined ? 'N/A' : `${Math.round((b - a) * 1000)} mL`;

  const pctChange = (a, b) => {
    if (!a || !b) return 'N/A';
    const c = ((b - a) / a) * 100;
    return `${c >= 0 ? '+' : ''}${c.toFixed(0)}%`;
  };

  // --- Results table (9 columns: Best/LLN/z/%Pred pre, Best/z/%Pred post, Change, %Chng) ---
  const metricRows = [
    {
      label: 'FVC (L)',
      preBest: pre?.fvc, preLln: pre?.lln_fvc, preZ: pre?.zscore_fvc, prePred: pre?.pred_percent_fvc,
      postBest: post?.fvc, postZ: post?.zscore_fvc, postPred: post?.pred_percent_fvc,
      showChange: true,
    },
    {
      label: 'FEV1 (L)',
      preBest: pre?.fev1, preLln: pre?.lln_fev1, preZ: pre?.zscore_fev1, prePred: pre?.pred_percent_fev1,
      postBest: post?.fev1, postZ: post?.zscore_fev1, postPred: post?.pred_percent_fev1,
      showChange: true,
    },
    {
      label: 'FEV1/FVC',
      preBest: pre?.fev1_fvc, preLln: pre?.lln_fev1_fvc, preZ: pre?.zscore_fev1_fvc, prePred: pre?.pred_percent_fev1_fvc,
      postBest: post?.fev1_fvc, postZ: post?.zscore_fev1_fvc, postPred: post?.pred_percent_fev1_fvc,
      showChange: false,
    },
    {
      label: 'FEF25-75 (L/s)',
      preBest: pre?.fef2575, preLln: pre?.lln_fef2575, preZ: pre?.zscore_fef2575, prePred: pre?.pred_percent_fef2575,
      postBest: post?.fef2575, postZ: post?.zscore_fef2575, postPred: post?.pred_percent_fef2575,
      showChange: false,
    },
    {
      label: 'FEV6 (L)',
      preBest: pre?.fev6, preLln: null, preZ: null, prePred: null,
      postBest: post?.fev6, postZ: null, postPred: null,
      showChange: false,
    },
    {
      label: 'PEFR (L/s)',
      preBest: pre?.pefr, preLln: null, preZ: null, prePred: null,
      postBest: post?.pefr, postZ: null, postPred: null,
      showChange: false,
    },
    {
      label: 'FET (s)',
      preBest: pre?.fet, preLln: null, preZ: null, prePred: null,
      postBest: post?.fet, postZ: null, postPred: null,
      showChange: false,
    },
  ];

  const metricRowsHtml = metricRows
    .map(
      (r) => `
      <tr>
        <td class="label">${r.label}</td>
        <td>${fmt(r.preBest)}</td>
        <td>${r.preLln !== null ? fmt(r.preLln) : '&nbsp;'}</td>
        <td>${r.preZ !== null ? fmt(r.preZ) : '&nbsp;'}</td>
        <td>${r.prePred !== null && r.prePred !== undefined ? pct(r.prePred) : '&nbsp;'}</td>
        <td>${fmt(r.postBest)}</td>
        <td>${r.postZ !== null ? fmt(r.postZ) : '&nbsp;'}</td>
        <td>${r.postPred !== null && r.postPred !== undefined ? pct(r.postPred) : '&nbsp;'}</td>
        <td>${r.showChange ? changeMl(r.preBest, r.postBest) : '&nbsp;'}</td>
        <td>${r.showChange ? pctChange(r.preBest, r.postBest) : '&nbsp;'}</td>
      </tr>`
    )
    .join('');

  // --- z-score bar panels ---
  function zPanel(title, rows) {
    const lln = toPct(LLN_Z);
    const zero = toPct(0);

    const rowsHtml = rows
      .map((r) => {
        if (r.z === null || r.z === undefined) {
          return `
          <div class="zrow">
            <div class="zlabel">${r.label}</div>
            <div class="ztrack" style="background: linear-gradient(to right, #eeb47e 0%, #eeb47e ${lln}%, #d9ead3 ${lln}%, #d9ead3 100%);">
              <div class="zline" style="left:${lln}%"></div>
              <div class="zline" style="left:${zero}%"></div>
            </div>
          </div>`;
        }
        const starPct = toPct(r.z);
        return `
        <div class="zrow">
          <div class="zlabel">${r.label}</div>
          <div class="ztrack" style="background: linear-gradient(to right, #eeb47e 0%, #eeb47e ${lln}%, #d9ead3 ${lln}%, #d9ead3 100%);">
            <div class="zline" style="left:${lln}%"></div>
            <div class="zline" style="left:${zero}%"></div>
            <div class="zstar" style="left:${starPct}%">&#9733;</div>
          </div>
        </div>`;
      })
      .join('');

    return `
      <div class="zpanel">
        <div class="zheader">
          <span class="ztitle">${title}</span>
          <span class="zmarklabel" style="left:${lln}%">LLN</span>
          <span class="zmarklabel" style="left:${zero}%">predicted</span>
        </div>
        ${rowsHtml}
        <div class="zscale">
          ${Array.from({ length: SCALE_RANGE + 1 }, (_, i) => SCALE_MIN + i)
            .map((n) => `<span>${n}</span>`)
            .join('')}
        </div>
      </div>`;
  }

  const preZRows = [
    { label: 'FEV1', z: pre?.zscore_fev1 },
    { label: 'FVC', z: pre?.zscore_fvc },
    { label: 'FEV1/FVC', z: pre?.zscore_fev1_fvc },
  ];
  const postZRows = [
    { label: 'FEV1', z: post?.zscore_fev1 },
    { label: 'FVC', z: post?.zscore_fvc },
    { label: 'FEV1/FVC', z: post?.zscore_fev1_fvc },
  ];

  const brandHtml = meta.logoDataUri
    ? `<img class="brand-logo" src="${meta.logoDataUri}" alt="VitalFlo" />`
    : `<div class="badge">VP</div><div class="name">VitalFlo</div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<!-- Both charts are generated as inline SVG, avoiding external CDN dependencies. -->
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #222; margin: 26px; }

  .header { display:flex; align-items:center; justify-content:space-between; padding-bottom: 6px; }
  .brand { display:flex; align-items:center; gap:8px; }
  .brand .badge { width:30px; height:30px; border-radius:50%; background:#3d8b3d; color:#fff; font-weight:bold;
                   font-size:13px; display:flex; align-items:center; justify-content:center; }
  .brand .name { font-style: italic; font-weight: bold; font-size: 21px; color: #2f6f2f; font-family: Georgia, serif; }
  .brand .brand-logo { height: 34px; display:block; }
  .header h1 { font-size: 15px; margin: 0; font-weight:bold; }
  .headrule { border: none; border-top: 2px solid #444; margin: 4px 0 10px; }

  table.infoTable { border-collapse: collapse; width: 100%; }
  .infoTable td { padding: 3px 6px; font-size: 11px; vertical-align:top; }
  .infoTable td.k { color:#333; width: 110px; }
  .infoTable td.v { font-weight: bold; width: 33%; }

  .redrule { border: none; border-top: 2px solid #a33; margin: 10px 0 6px; }
  h3.section { font-size:12.5px; margin: 0 0 6px; letter-spacing:0.5px; }

  table.results { border-collapse: collapse; width: 100%; font-size: 10.5px; }
  table.results th, table.results td { border: 1px solid #cfd8c3; padding: 4px 6px; text-align:center; }
  table.results thead tr:first-child th { background:#eef3e5; }
  table.results thead tr:last-child th { background:#f5f8f0; font-weight:normal; }
  table.results td.label { text-align:left; font-weight:bold; background:#f7faf3; }
  table.results tbody tr:nth-child(odd) td:not(.label) { background:#fbfdf9; }
  .refrow td { text-align:left; font-size:9.5px; color:#444; background:#fff; }

  .zpanels { display:flex; gap: 26px; margin-top: 14px; }
  .zpanel { flex:1; }
  .zheader { position:relative; height:14px; margin-bottom:4px; }
  .ztitle { font-size: 11px; font-weight:bold; }
  .zmarklabel { position:absolute; top:0; transform: translateX(-50%); font-size:9px; color:#333; white-space:nowrap; }
  .zrow { display:flex; align-items:center; margin: 3px 0; }
  .zlabel { width: 62px; font-size: 10px; }
  .ztrack { position:relative; flex:1; height:15px; border:1px solid #b7b7b7; }
  .zline { position:absolute; top:-2px; bottom:-2px; width:2px; background:#111; }
  .zstar { position:absolute; top:-4px; transform: translateX(-50%); color:#7a1f1f; font-size:15px; line-height:1; }
  .zscale { display:flex; justify-content:space-between; font-size:9px; color:#666; margin-top:2px; padding: 0 1px; }

  .charts { display:flex; gap: 22px; margin-top: 18px; }
  .chartBox { flex:1; text-align:center; }
  canvas, .chartBox svg { max-width: 100%; height: auto; }

  .comments { display:flex; gap: 20px; margin-top: 20px; }
  .commentBox { flex:1; border:1px solid #999; height: 90px; padding:6px; font-size:10px; }
  .sigline { margin-top: 22px; border-top: 1px solid #333; width: 55%; margin-left:auto; text-align:center; font-size:9px; padding-top:2px; }
  .bottomrule { border: none; border-top: 2px solid #a33; margin: 18px 0 8px; }
</style>
</head>
<body>

  <div class="header">
    <div class="brand">
      ${brandHtml}
    </div>
    <h1>ATS Bronchodilator Responsiveness Report</h1>
  </div>
  <hr class="headrule" />

  <table class="infoTable">
    <tr>
      <td class="k">Name:</td><td class="v">${patient.name ?? 'N/A'}</td>
      <td class="k">Referred by:</td><td class="v">${patient.referredBy ?? 'N/A'}</td>
    </tr>
    <tr>
      <td class="k">ID:</td><td class="v">${patient.id ?? 'N/A'}</td>
      <td class="k">Date of test:</td><td class="v">${patient.testDate ?? 'N/A'}</td>
    </tr>
    <tr>
      <td class="k">Sex:</td><td class="v">${patient.sex ?? 'N/A'}</td>
      <td class="k">Reason:</td><td class="v">${patient.reason ?? 'N/A'}</td>
    </tr>
    <tr>
      <td class="k">Birth date:</td><td class="v">${patient.dob ?? 'N/A'}</td>
      <td class="k">SpO2 at rest:</td><td class="v">${patient.spo2 ?? 'N/A'}</td>
    </tr>
    <tr>
      <td class="k">Age:</td><td class="v">${patient.age ?? 'N/A'}</td>
      <td class="k">Height:</td><td class="v">${patient.height ?? 'N/A'}</td>
    </tr>
    <tr>
      <td class="k">Ethnicity:</td><td class="v">${patient.ethnicity ?? 'N/A'}</td>
      <td class="k">Weight:</td><td class="v">${patient.weight ?? 'N/A'}</td>
    </tr>
    <tr>
      <td class="k">Smoking:</td><td class="v">${patient.smoking ?? 'N/A'}</td>
      <td class="k">BMI:</td><td class="v">${patient.bmi ?? 'N/A'}</td>
    </tr>
  </table>

  <hr class="redrule" />
  <h3 class="section">SPIROMETRY</h3>

  <table class="results">
    <thead>
      <tr>
        <th rowspan="2">&nbsp;</th>
        <th colspan="4">Pre</th>
        <th colspan="3">Post</th>
        <th rowspan="2">Change</th>
        <th rowspan="2">%Chng</th>
      </tr>
      <tr>
        <th>Best</th><th>LLN</th><th>z-score</th><th>%Pred</th>
        <th>Best</th><th>z-score</th><th>%Pred</th>
      </tr>
    </thead>
    <tbody>
      ${metricRowsHtml}
      <tr class="refrow">
        <td colspan="10">Reference values: GLI 2012 &nbsp;&nbsp; Test Quality: Pre: FEV1 - ${pre?.fev1_acceptability ?? 'N/A'}, FVC - ${pre?.fvc_acceptability ?? 'N/A'}; Post: FEV1 - ${post?.fev1_acceptability ?? 'N/A'}, FVC - ${post?.fvc_acceptability ?? 'N/A'}</td>
      </tr>
    </tbody>
  </table>

  <div class="zpanels">
    ${zPanel('Pre-Bronchodilator', preZRows)}
    ${zPanel('Post-Bronchodilator', postZRows)}
  </div>

  <div class="charts">
    <div class="chartBox">
      ${drawReportCurve(preFlows, postFlows, 'flow-volume')}
    </div>
    <div class="chartBox">
      ${drawReportCurve(preVolumes, postVolumes, 'volume-time', preFlows, postFlows)}
    </div>
  </div>

  <div class="comments">
    <div class="commentBox"><strong>Technician Comments:</strong></div>
    <div class="commentBox"><strong>Additional Comments:</strong></div>
  </div>
  <div class="sigline">Clinician Signature &nbsp;&nbsp;&nbsp;&nbsp; Date</div>
  <hr class="bottomrule" />

</body>
</html>`;
}

module.exports = { buildSpirometryReportHtml };