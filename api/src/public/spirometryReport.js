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
      preBest: pre?.fev1_fvc, preLln: pre?.lln_fev1_fvc, preZ: pre?.zscore_fev1_fvc, prePred: null,
      postBest: post?.fev1_fvc, postZ: post?.zscore_fev1_fvc, postPred: null,
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
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
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
  canvas { max-width: 100%; }

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
      <canvas id="fvChart" width="420" height="300"></canvas>
    </div>
    <div class="chartBox">
      <canvas id="vtChart" width="420" height="300"></canvas>
    </div>
  </div>

  <div class="comments">
    <div class="commentBox"><strong>Technician Comments:</strong></div>
    <div class="commentBox"><strong>Additional Comments:</strong></div>
  </div>
  <div class="sigline">Clinician Signature &nbsp;&nbsp;&nbsp;&nbsp; Date</div>
  <hr class="bottomrule" />

<script>
  const preFlows = ${JSON.stringify(preFlows || [])};
  const postFlows = ${JSON.stringify(postFlows || [])};
  const preVolumes = ${JSON.stringify(preVolumes || [])};
  const postVolumes = ${JSON.stringify(postVolumes || [])};

  new Chart(document.getElementById('fvChart'), {
    type: 'line',
    data: {
      datasets: [
        { label: 'pre', data: preFlows.map(p => ({x: p.volume, y: p.flow})),
          borderColor: '#1a4fbf', backgroundColor: 'transparent', pointRadius: 0, borderWidth: 1.5 },
        { label: 'post', data: postFlows.map(p => ({x: p.volume, y: p.flow})),
          borderColor: '#c0392b', backgroundColor: 'transparent', pointRadius: 0, borderWidth: 1.5 },
      ],
    },
    options: {
      responsive: false, animation: false,
      scales: {
        x: { type:'linear', title:{display:true,text:'Volume (L)'}, min:-1, max:6, ticks:{stepSize:1} },
        y: { title:{display:true,text:'Flow (L/s)'}, min:-6, max:8, ticks:{stepSize:2} },
      },
      plugins: { legend: { position: 'bottom', align:'end', labels:{boxWidth:14, font:{size:10}} } },
    },
  });

  new Chart(document.getElementById('vtChart'), {
    type: 'line',
    data: {
      datasets: [
        { label: 'pre', data: preVolumes.map(p => ({x: p.time, y: p.volume})),
          borderColor: '#1a4fbf', backgroundColor: 'transparent', pointRadius: 0, borderWidth: 1.5 },
        { label: 'post', data: postVolumes.map(p => ({x: p.time, y: p.volume})),
          borderColor: '#c0392b', backgroundColor: 'transparent', pointRadius: 0, borderWidth: 1.5 },
      ],
    },
    options: {
      responsive: false, animation: false,
      scales: {
        x: { type:'linear', title:{display:true,text:'Time (s)'}, min:0, max:6, ticks:{stepSize:1} },
        y: { title:{display:true,text:'Volume (L)'}, min:0, max:8, ticks:{stepSize:1} },
      },
      plugins: { legend: { position: 'bottom', align:'end', labels:{boxWidth:14, font:{size:10}} } },
    },
  });
</script>
</body>
</html>`;
}

module.exports = { buildSpirometryReportHtml };