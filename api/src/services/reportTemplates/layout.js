/**
 * Shared print layout + design system for all tab PDFs.
 *
 * Design language pulled from the VitalFlo web app (blue accent, white cards
 * on a light gray page, yellow/green highlighted %-predicted cells). Charts
 * are drawn with Chart.js loaded from a CDN inside the printed page itself —
 * Puppeteer renders real Chromium, so canvas + CSS gradients all rasterize
 * correctly into the PDF.
 */

const BRAND = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  ink: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  page: '#F3F4F6',
  green: '#DCFCE7',
  greenText: '#15803D',
  yellow: '#FEF9C3',
  yellowText: '#92400E',
  red: '#FEE2E2',
  redText: '#B91C1C',
};

/** Color-code a %-predicted cell using GLI-style thresholds. */
function percentPredictedClass(percentPredicted) {
  if (percentPredicted === null || percentPredicted === undefined) return '';
  if (percentPredicted < 65) return 'cell-red';
  if (percentPredicted < 80) return 'cell-yellow';
  return 'cell-green';
}

function fmt(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return typeof value === 'number' ? value.toFixed(digits) : String(value);
}

function fmtDate(value) {
  if (!value) return 'N/A';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Renders the "SPIROMETRY RESULTS"-style table used by spirometry / reports / session-comparison. */
function resultsTable(rows, { title = 'Spirometry Results' } = {}) {
  const body = rows
    .map((r) => {
      const pctClass = percentPredictedClass(r.percentPredicted);
      return `
        <tr>
          <td class="var-name">${r.variable}</td>
          <td>${fmt(r.observed)}</td>
          <td>${fmt(r.lln)}</td>
          <td>${fmt(r.zScore)}</td>
          <td>${fmt(r.predicted)}</td>
          <td class="${pctClass}">${r.percentPredicted === null || r.percentPredicted === undefined ? 'N/A' : fmt(r.percentPredicted, 2) + '%'}</td>
        </tr>`;
    })
    .join('');

  return `
    <div class="card">
      <h3 class="card-title">${title}</h3>
      <table class="results-table">
        <thead>
          <tr>
            <th>Variable</th><th>Observed</th><th>LLN</th><th>z-score</th><th>Predicted</th><th>GLI-2012 %</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

/** A single circular "gauge" card, e.g. Lung Age or a letter-grade card. Pure CSS conic-gradient ring. */
function gaugeCard({ title, valueLabel, ringPercent = 0, ringColor = BRAND.primary, footnote = '' }) {
  const pct = Math.max(0, Math.min(100, ringPercent));
  return `
    <div class="gauge-card">
      <div class="gauge-title">${title}</div>
      <div class="gauge-ring" style="background: conic-gradient(${ringColor} ${pct}%, #E5E7EB ${pct}% 100%);">
        <div class="gauge-ring-inner">${valueLabel}</div>
      </div>
      ${footnote ? `<div class="gauge-footnote">${footnote}</div>` : ''}
    </div>`;
}

/** A simple "no data available yet" placeholder gauge, used when a field isn't backed by the schema. */
function gaugePlaceholder(title, note = 'No data') {
  return `
    <div class="gauge-card">
      <div class="gauge-title">${title}</div>
      <div class="gauge-ring gauge-ring-muted"><div class="gauge-ring-inner muted">${note}</div></div>
    </div>`;
}

/**
 * Horizontal "Patient vs LLN" style scale: a red→yellow→green gradient track
 * from z=-5 to z=+3, with an LLN reference line at z=-1.645, a Normal line at
 * z=0, and a marker for the patient's actual z-score.
 */
function zScoreScaleBar(rows) {
  const domainMin = -5;
  const domainMax = 3;
  const toPct = (z) => ((z - domainMin) / (domainMax - domainMin)) * 100;
  const llnPct = toPct(-1.645);
  const normalPct = toPct(0);

  const bars = rows
    .filter((r) => typeof r.zScore === 'number')
    .map((r) => {
      const markerPct = Math.max(0, Math.min(100, toPct(r.zScore)));
      return `
        <div class="zbar-row">
          <div class="zbar-label">${r.variable}</div>
          <div class="zbar-track">
            <div class="zbar-refline" style="left:${llnPct}%;" title="LLN"></div>
            <div class="zbar-refline zbar-refline-normal" style="left:${normalPct}%;" title="Normal"></div>
            <div class="zbar-marker" style="left:${markerPct}%;"></div>
          </div>
          <div class="zbar-value">${fmt(r.zScore)}</div>
        </div>`;
    })
    .join('');

  if (!bars) return '';

  return `
    <div class="card">
      <h3 class="card-title">Patient vs. LLN</h3>
      <div class="zbar-axis-labels">
        <span>LLN</span><span>Normal</span>
      </div>
      ${bars}
      <div class="zbar-scale-ticks">
        ${[-5, -4, -3, -2, -1, 0, 1, 2, 3].map((v) => `<span>${v}</span>`).join('')}
      </div>
      <p class="fine-print">Uses the best result per variable across all trials in the session. Only GLI-2012 lookup tables provide LLN / z-score values.</p>
    </div>`;
}

/** Chart.js <canvas> block. `configJs` is a JS object-literal string assigned straight into `new Chart(ctx, ...)`. */
function chartCanvas(id, heightPx = 260) {
  return `<canvas id="${id}" height="${heightPx}"></canvas>`;
}

/**
 * Every chart script increments/decrements a pending counter; once it hits
 * zero we flip `window.__chartsReady`, which reportService.js polls for
 * before rasterizing the page to PDF.
 */
function chartBootstrap(chartInitScripts) {
  return `
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
    <script>
      window.__chartsPending = 0;
      window.__chartsReady = false;
      window.__registerChart = function () { window.__chartsPending += 1; };
      window.__chartDone = function () {
        window.__chartsPending -= 1;
        if (window.__chartsPending <= 0) window.__chartsReady = true;
      };
      document.addEventListener('DOMContentLoaded', function () {
        ${chartInitScripts.join('\n        ')}
        if (window.__chartsPending === 0) window.__chartsReady = true;
      });
    </script>`;
}

function renderDocument({ title, meta = {}, bodyHtml, chartInitScripts = [] }) {
  const generatedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Segoe UI', Arial, sans-serif;
    color: ${BRAND.ink};
    background: ${BRAND.page};
    font-size: 12px;
  }
  .page { padding: 4mm 2mm; }
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid ${BRAND.primary};
    padding-bottom: 10px;
    margin-bottom: 16px;
  }
  .report-header .brand { font-size: 20px; font-weight: 700; color: ${BRAND.primary}; }
  .report-header .brand img.brand-logo { height: 32px; display: block; }
  .report-header .subtitle { color: ${BRAND.muted}; font-size: 11px; margin-top: 2px; }
  .report-header .meta { text-align: right; font-size: 11px; color: ${BRAND.muted}; }
  .report-header .meta strong { color: ${BRAND.ink}; }
  .patient-strip {
    display: flex; gap: 32px; background: #fff; border: 1px solid ${BRAND.border};
    border-radius: 10px; padding: 10px 16px; margin-bottom: 16px;
  }
  .patient-strip div span.label { display:block; font-size:9px; letter-spacing:.04em; text-transform:uppercase; color:${BRAND.muted}; }
  .patient-strip div span.value { font-size:14px; font-weight:600; }
  .grid { display: flex; gap: 16px; }
  .grid > .col { flex: 1; min-width: 0; }
  .card {
    background: #fff; border: 1px solid ${BRAND.border}; border-radius: 10px;
    padding: 14px 16px; margin-bottom: 16px; page-break-inside: avoid;
  }
  .card-title { margin: 0 0 10px; font-size: 14px; font-weight: 700; }
  table.results-table { width: 100%; border-collapse: collapse; }
  table.results-table th {
    text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .03em;
    color: ${BRAND.muted}; padding: 6px 8px; border-bottom: 2px solid ${BRAND.border};
  }
  table.results-table td { padding: 7px 8px; border-bottom: 1px solid ${BRAND.border}; font-size: 12px; }
  table.results-table td.var-name { font-weight: 600; }
  table.results-table tr:nth-child(even) td { background: #FAFAFB; }
  .cell-green { background: ${BRAND.green} !important; color: ${BRAND.greenText}; font-weight: 700; }
  .cell-yellow { background: ${BRAND.yellow} !important; color: ${BRAND.yellowText}; font-weight: 700; }
  .cell-red { background: ${BRAND.red} !important; color: ${BRAND.redText}; font-weight: 700; }
  .gauge-row { display: flex; gap: 16px; margin-bottom: 16px; }
  .gauge-card {
    background: #fff; border: 1px solid ${BRAND.border}; border-radius: 10px;
    padding: 14px; flex: 1; text-align: center;
  }
  .gauge-title { font-weight: 700; font-size: 12px; margin-bottom: 8px; }
  .gauge-ring {
    width: 90px; height: 90px; border-radius: 50%; margin: 0 auto;
    display: flex; align-items: center; justify-content: center;
  }
  .gauge-ring-muted { background: #E5E7EB !important; }
  .gauge-ring-inner {
    width: 68px; height: 68px; border-radius: 50%; background: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 15px;
  }
  .gauge-ring-inner.muted { color: ${BRAND.muted}; font-size: 10px; font-weight: 500; }
  .gauge-footnote { font-size: 10px; color: ${BRAND.muted}; margin-top: 6px; }
  .zbar-axis-labels { display: flex; justify-content: space-between; padding: 0 78px 4px; font-size: 10px; color: ${BRAND.muted}; font-weight: 600; }
  .zbar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .zbar-label { width: 62px; font-weight: 700; font-size: 11px; }
  .zbar-track {
    position: relative; flex: 1; height: 14px; border-radius: 7px;
    background: linear-gradient(to right, #F87171, #FB923C, #FDE68A, #FDE68A, #BBF7D0, #4ADE80);
  }
  .zbar-refline { position: absolute; top: -3px; width: 2px; height: 20px; background: #EF4444; }
  .zbar-refline-normal { background: #111827; }
  .zbar-marker {
    position: absolute; top: -4px; width: 6px; height: 22px; background: #111827;
    border-radius: 2px; transform: translateX(-3px);
  }
  .zbar-value { width: 36px; text-align: right; font-size: 11px; color: ${BRAND.muted}; }
  .zbar-scale-ticks { display: flex; justify-content: space-between; padding: 0 78px; font-size: 9px; color: ${BRAND.muted}; }
  .fine-print { font-size: 9px; color: ${BRAND.muted}; margin: 10px 0 0; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; }
  .badge-blue { background: #DBEAFE; color: #1E40AF; }
  .badge-gray { background: #F3F4F6; color: ${BRAND.muted}; }
  .badge-green { background: ${BRAND.green}; color: ${BRAND.greenText}; }
  .empty-state { color: ${BRAND.muted}; font-style: italic; padding: 12px 0; }
  h4.section-label { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: ${BRAND.muted}; margin: 0 0 8px; }
  ul.plain-list { margin: 0; padding-left: 18px; }
  ul.plain-list li { margin-bottom: 4px; }
</style>
</head>
<body>
  <div class="page">
    <div class="report-header">
      <div>
        <div class="brand">
          ${meta.logoDataUri
            ? `<img class="brand-logo" src="${meta.logoDataUri}" alt="VitalFlo" />`
            : 'VitalFlo'}
        </div>
        <div class="subtitle">${title}</div>
      </div>
      <div class="meta">
        <div><strong>${meta.patientName || 'Unknown Patient'}</strong></div>
        <div>Clinician: ${meta.clinicianName || 'N/A'}</div>
        <div>Generated ${generatedAt}</div>
      </div>
    </div>
    ${bodyHtml}
  </div>
  ${chartBootstrap(chartInitScripts)}
</body>
</html>`;
}

module.exports = {
  BRAND,
  fmt,
  fmtDate,
  percentPredictedClass,
  resultsTable,
  gaugeCard,
  gaugePlaceholder,
  zScoreScaleBar,
  chartCanvas,
  renderDocument,
};