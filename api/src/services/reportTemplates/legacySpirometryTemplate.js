'use strict';

const fs = require('fs');
const path = require('path');

// Use the same logo assets as the existing reportService. No route/service changes.
function getBrandLogoUri() {
  const filenames = ['vitalflo-logo.svg', 'vitalflo-logo.png', 'vitalflo-logo.jpg', 'vitalflo-logo.jpeg'];
  const mimes = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
  for (const filename of filenames) {
    const file = path.join(__dirname, '..', 'assets', filename);
    if (!fs.existsSync(file)) continue;
    const mime = mimes[path.extname(file).toLowerCase()];
    return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
  }
  return null;
}

const BLUE = '#0b9cf2';
const NAVY = '#066eaa';
const TEAL = '#00bdb4';
const ORANGE = '#fa842e';
const PALE = '#f6c4a7';

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}
function displayNumber(value) {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return 'N/A';
  return Number(value).toFixed(2).replace(/\.00$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}
function displayDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h24 = date.getUTCHours();
  const h12 = h24 % 12 || 12;
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${String(h12).padStart(2, '0')}:${mm}:${ss} ${h24 >= 12 ? 'PM' : 'AM'}`;
}

const DISPLAY_VARIABLES = [
  ['FEV1', 'FEV₁ (L)'], ['FVC', 'FVC (L)'], ['FEV1/FVC', 'FEV₁/FVC'],
  ['FEF2575', 'FEF₂₅–₇₅ (L/s)'], ['FEV6', 'FEV₆ (L)'], ['PEFR', 'PEFR (L/s)'],
  ['FET', 'FET (s)'],
];
function resultsTable(rows = [], refText = 'GLI 2012 Other Lookup Table') {
  const map = new Map(rows.map(r => [String(r.variable).replace(/[^a-z0-9/]/gi, '').toUpperCase(), r]));
  const body = DISPLAY_VARIABLES.map(([key, label]) => {
    const row = map.get(key.replace(/[^a-z0-9/]/gi, '').toUpperCase()) || {};
    const values = [row.observed, row.lln, row.zScore, row.predicted, row.percentPredicted];
    return `<tr><td>${label}</td>${values.map(v => `<td>${displayNumber(v)}</td>`).join('')}</tr>`;
  }).join('');
  return `<table class="results"><colgroup><col style="width:22%"><col style="width:17%"><col style="width:10%"><col style="width:14%"><col style="width:17%"><col style="width:20%"></colgroup>
    <thead><tr><th>Variable</th><th>Observed</th><th>LLN</th><th>z-score</th><th>Predicted</th><th>% Predicted</th></tr></thead>
    <tbody>${body}</tbody><tfoot><tr><td colspan="6">Reference Values: ${esc(refText)}</td></tr></tfoot></table>`;
}

function plotSvg({kind, points = [], predicted1 = null, predicted2 = null}) {
  const flow = kind === 'flow';
  const W = 420, H = 330, left = 48, right = 12, top = 15, bottom = 39;
  const pw = W - left - right, ph = H - top - bottom;
  const coords = points.map(p => ({x: Number(flow ? p.volume : p.time), y: Number(flow ? p.flow : p.volume)}))
    .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  // Fixed axes follow the supplied design; expand them only when actual data
  // exceed the bounds so the graph is never cropped.
  const xmax = Math.max(6, ...coords.map(p => p.x));
  const ymin = flow ? Math.min(-6, ...coords.map(p => p.y)) : 0;
  const ymax = flow ? Math.max(8, ...coords.map(p => p.y)) : Math.max(6, ...coords.map(p => p.y));
  const sx = x => left + (x / xmax) * pw;
  const sy = y => top + ((ymax - y) / (ymax - ymin)) * ph;
  const path = coords.length ? `M ${coords.map(p => `${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' L ')}` : '';
  let lines = '';
  for (let i = 0; i <= 6; i++) {
    const xx = left + i * pw / 6;
    const val = (xmax * i / 6);
    lines += `<line x1="${xx}" y1="${top}" x2="${xx}" y2="${top + ph}" stroke="#dedfe4" stroke-width=".7"/>`;
    lines += `<text x="${xx}" y="${H - 19}" class="tick" text-anchor="middle">${Number.isInteger(val) ? val : val.toFixed(1)}</text>`;
  }
  const rows = flow ? 7 : 6;
  for (let i = 0; i <= rows; i++) {
    const val = ymin + i * (ymax - ymin) / rows;
    const yy = sy(val);
    lines += `<line x1="${left}" y1="${yy}" x2="${left+pw}" y2="${yy}" stroke="#dedfe4" stroke-width=".7"/>`;
    lines += `<text x="${left-9}" y="${yy+4}" class="tick" text-anchor="end">${Number.isInteger(val) ? val : val.toFixed(1)}</text>`;
  }
  const xAxis = `<line x1="${left}" y1="${sy(0)}" x2="${left+pw}" y2="${sy(0)}" stroke="#676b70" stroke-width="1.1"/>`;
  const yAxis = `<line x1="${sx(0)}" y1="${top}" x2="${sx(0)}" y2="${top + ph}" stroke="#676b70" stroke-width="1.1"/>`;
  let markers = '';
  if (!flow) {
    // Predicted FEV1 occurs at 1 second, predicted FVC at the same 1-second
    // x-position as in the legacy PDF. Display only genuine calculated data.
    const mk = (v, color) => Number.isFinite(Number(v)) && v !== null
      ? `<circle cx="${sx(1)}" cy="${sy(Number(v))}" r="4.5" fill="white" stroke="${color}" stroke-width="1.7"/>` : '';
    markers = mk(predicted1, PALE) + mk(predicted2, ORANGE);
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${flow ? 'Flow volume' : 'Volume time'} graph">
    <style>.tick{font:12px Arial,sans-serif;fill:#858890}.axislabel{font:14px Arial,sans-serif;fill:#777b84}</style>
    ${lines}${xAxis}${yAxis}
    ${path ? `<path d="${path}" fill="none" stroke="${flow ? NAVY : TEAL}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` : ''}
    ${markers}
    <text x="${left+pw/2}" y="${H-2}" class="axislabel" text-anchor="middle">${flow ? 'Volume (L)' : 'Time (s)'}</text>
    <text transform="translate(13 ${top+ph/2}) rotate(-90)" class="axislabel" text-anchor="middle">${flow ? 'Flow (L/s)' : 'Volume (L)'}</text>
  </svg>`;
}
function curvePanel(test, kind) {
  const flow = kind === 'flow';
  const rows = test.results || [];
  const byName = key => rows.find(r => r.variable === key)?.predicted ?? null;
  const legend = flow
    ? `<span class="key"><i style="background:#ff9958"></i>Predicted PEFR</span><span class="key"><i style="background:${NAVY}"></i>Test Data</span>`
    : `<span class="key"><i style="background:${PALE}"></i>Predicted FEV1</span><span class="key"><i style="background:${ORANGE}"></i>Predicted FVC</span><span class="key"><i style="background:${TEAL}"></i>Test Data</span>`;
  return `<div class="plot"><div class="plot-title">${flow ? 'Flow-Volume Chart' : 'Volume-Time Chart'}</div><div class="legend">${legend}</div>
    ${plotSvg({kind, points: flow ? test.flowPoints : test.volumePoints,
      predicted1: byName('FEV1'), predicted2: byName('FVC')})}</div>`;
}
function renderLegacySpirometryHtml(data = {}) {
  const observations = data.observations || [];
  const sections = observations.flatMap(obs => (obs.tests || []).map(test => ({obs, test})));
  const report = sections.length
    ? sections.map(({obs, test}) => `<section class="trial">
        <div class="trial-date"><strong>Date:</strong>&nbsp; ${esc(displayDate(test.date || obs.date))}</div>
        ${resultsTable(test.results, data.referenceText || 'GLI 2012 Other Lookup Table')}
        <div class="charts">${curvePanel(test, 'flow')}${curvePanel(test, 'volume')}</div>
      </section>`).join('')
    : '<p class="empty">No spirometry tests recorded in this date range.</p>';
  const logoUri = getBrandLogoUri();
  const brand = `<header class="brand-header">${logoUri ? `<img class="brand-logo" src="${logoUri}" alt="VitalFlo logo">` : `<span class="brand-fallback">VF</span>`}<div class="brand-text"><div class="brand-subtitle">Spirometry Report</div></div></header>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Spirometry Report</title>
  <style>
    @page { size: A4 portrait; margin: 9mm 9mm 11mm; }
    * { box-sizing: border-box; }
    body { margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; color:#4d5862; background:#f9f9fd; font-size:11px; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
    main { width:100%; }
    .brand-header { display:flex; align-items:center; gap:10px; border-bottom:1px solid #d5dbe0; padding:3px 0 9px; margin:0 0 12px; break-inside:avoid; page-break-inside:avoid; }
    .brand-logo { display:block; max-height:36px; max-width:115px; width:auto; height:auto; object-fit:contain; }
    .brand-fallback { width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border-radius:7px; background:#0b9cf2; color:#fff; font-size:15px; font-weight:700; }
    .brand-text { display:flex; flex-direction:column; gap:2px; }
    .brand-name { font-size:19px; color:#0877aa; font-weight:700; letter-spacing:.1px; }
    .brand-subtitle { font-size:10px; color:#64717d; } 
    h1 { font-size:13px; margin:0 0 3px; font-weight:700; }
    .trial { break-inside:avoid; page-break-inside:avoid; margin:0 0 13px; }
    .trial-date { font-size:12px; margin-bottom:3px; }
    .trial-date strong { font-weight:700; }
    table.results { width:100%; border-collapse:collapse; table-layout:fixed; font-size:10px; line-height:1.25; }
    .results th { background:${BLUE}; color:white; font-weight:700; text-align:left; border:1px solid #c1c8cb; padding:6px 5px; }
    .results td { background:#f0f1f3; border:1px solid #c7cbd0; padding:5px 5px; }
    .results tfoot td { padding:6px; font-size:10px; }
    .charts { display:flex; flex-direction:row; gap:12px; margin-top:10px; align-items:flex-start; }
    .plot { width:calc(50% - 6px); min-width:0; text-align:center; }
    .plot-title { font-size:11px; font-weight:700; margin-bottom:6px; }
    .plot svg { display:block; width:100%; height:auto; }
    .legend { height:14px; display:flex; align-items:center; justify-content:center; flex-wrap:nowrap; gap:6px; white-space:nowrap; font-size:7.6px; color:#666e78; }
    .key { display:inline-flex; align-items:center; gap:3px; }
    .key i { display:inline-block; width:11px; height:7px; }
    .empty { font-size:14px; padding:24px 0; }
  </style></head><body><main>${brand}<h1>Spirometry</h1>${report}</main></body></html>`;
}
module.exports = { renderLegacySpirometryHtml };