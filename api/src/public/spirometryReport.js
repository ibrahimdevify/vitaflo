'use strict';

/**
 * Patient-level, print-ready spirometry report.
 * No CDN Chart.js dependency: vector SVG plots are rendered server-side.
 * Only actual saved flow/volume points are plotted. Unsupported or missing
 * GLI predictions are printed as N/A rather than fabricated.
 */

const MISSING = 'N/A';
const n = (v) => v === '' || v === null || v === undefined ? null : (Number.isFinite(Number(v)) ? Number(v) : null);
const fmt = (v, digits=2) => n(v) == null ? MISSING : n(v).toFixed(digits);
const pct = (v) => n(v) == null ? MISSING : `${fmt(v)}%`;
const esc = (s) => String(s ?? MISSING).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = (s) => {
  if (!s) return MISSING;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d.toISOString().replace('T',' ').slice(0,19) + ' UTC' : MISSING;
};

/** Normalize chart data according to the portal_flow and portal_volume schema. */
function toFlowVolumePoints(rows = []) {
  if (!Array.isArray(rows)) return [];
  return rows.map((r,i) => ({ x: n(r?.volume), y: n(r?.value ?? r?.flow), t: n(r?.time), i }))
    .filter(p => p.x !== null && p.y !== null)
    .sort((a,b) => (a.t ?? a.i) - (b.t ?? b.i))
    .slice(0, 10000);
}
function toVolumeTimePoints(volumes = [], flows = []) {
  const candidates = Array.isArray(volumes) && volumes.length ? volumes : flows;
  if (!Array.isArray(candidates)) return [];
  return candidates.map(r => ({ x: n(r?.time), y: n(r?.volume) }))
    .filter(p => p.x !== null && p.y !== null).sort((a,b) => a.x-b.x).slice(0, 10000);
}
function svgChart(title, preRows, postRows, xLabel, yLabel, options = {}) {
  const W=780, H=255, left=58, right=16, top=30, bottom=46;
  const width=W-left-right, height=H-top-bottom;
  const a=Array.isArray(preRows)?preRows:[], b=Array.isArray(postRows)?postRows:[];
  const all=[...a,...b];
  const frame=(content) => `<div class="plot"><div class="plot-title">${esc(title)}</div>${content}</div>`;
  if (!all.length) return frame('<div class="no-chart">No recorded curve points available</div>');
  const xs=all.map(p=>p.x), ys=all.map(p=>p.y);
  const xmin=options.zeroX ? Math.min(0,...xs) : Math.min(...xs);
  const xmax=Math.max(...xs);
  const ymin=options.zeroY ? Math.min(0,...ys) : Math.min(...ys);
  const ymax=Math.max(...ys);
  const padX=(xmax-xmin||1)*0.05, padY=(ymax-ymin||1)*0.08;
  const loX=xmin-(options.zeroX?0:padX), hiX=xmax+padX;
  const loY=ymin-(options.zeroY?0:padY), hiY=ymax+padY;
  const tx=x=>left+((x-loX)/(hiX-loX))*width;
  const ty=y=>top+height-((y-loY)/(hiY-loY))*height;
  const label=x=>Number(x.toFixed(2)).toString();
  const grid=[];
  for(let i=0;i<=4;i++){
    const gx=left+(width*i/4), gy=top+(height*i/4);
    grid.push(`<line x1="${gx.toFixed(1)}" y1="${top}" x2="${gx.toFixed(1)}" y2="${top+height}" stroke="#e8ebf2"/>`);
    grid.push(`<line x1="${left}" y1="${gy.toFixed(1)}" x2="${left+width}" y2="${gy.toFixed(1)}" stroke="#e8ebf2"/>`);
    grid.push(`<text x="${gx.toFixed(1)}" y="${H-28}" fill="#556179" text-anchor="middle" font-size="12">${label(loX+(hiX-loX)*i/4)}</text>`);
    grid.push(`<text x="${left-9}" y="${(gy+4).toFixed(1)}" fill="#556179" text-anchor="end" font-size="12">${label(hiY-(hiY-loY)*i/4)}</text>`);
  }
  const path=points=>{
    if (!points.length) return '';
    const stride=Math.max(1,Math.ceil(points.length/900));
    let samples=points.filter((_,i)=>i%stride===0);
    if(samples[samples.length-1]!==points[points.length-1])samples.push(points[points.length-1]);
    return samples.map((p,i)=>`${i?'L':'M'}${tx(p.x).toFixed(1)},${ty(p.y).toFixed(1)}`).join(' ');
  };
  const curves=[a.length?`<path d="${path(a)}" stroke="#2357b8" stroke-width="3" fill="none" stroke-linejoin="round"/>`:'',
    b.length?`<path d="${path(b)}" stroke="#d36d33" stroke-width="3" fill="none" stroke-linejoin="round"/>`:''].join('');
  return frame(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)}">
    <rect width="${W}" height="${H}" fill="#fff"/>
    ${grid.join('')}
    ${curves}
    <text x="${W/2}" y="${H-4}" fill="#24314e" text-anchor="middle" font-size="13">${esc(xLabel)}</text>
    <text transform="translate(15,${H/2}) rotate(-90)" fill="#24314e" text-anchor="middle" font-size="13">${esc(yLabel)}</text>
    <circle cx="${W-265}" cy="17" r="5" fill="#2357b8"/><text x="${W-251}" y="21" font-size="12">Pre (${a.length} pts)</text>
    <circle cx="${W-132}" cy="17" r="5" fill="#d36d33"/><text x="${W-118}" y="21" font-size="12">Post (${b.length} pts)</text>
    </svg>`);
}

const METRICS=[
  {label:'FEV1', unit:'L', key:'fev1', pred:'fev1'},
  {label:'FVC', unit:'L', key:'fvc', pred:'fvc'},
  {label:'FEV1/FVC', unit:'ratio', key:'fev1_fvc', pred:'fev1_fvc'},
  {label:'FEF25–75', unit:'L/s', key:'fef2575', pred:'fef2575'},
  {label:'FEV6', unit:'L', key:'fev6', pred:'fev6'},
  {label:'PEFR', unit:'L/s', key:'pefr', pred:'pefr'},
  {label:'FET', unit:'s', key:'fet', pred:'fet'},
];
function metricFields(sp,row){
  return {
    observed:sp?.[row.key],predicted:sp?.[`pred_${row.pred}`],
    lln:sp?.[`lln_${row.pred}`],z:sp?.[`zscore_${row.pred}`],
    percent:sp?.[`pred_percent_${row.pred}`],
  };
}
function measurementTable(phase, data) {
  const rows=METRICS.map(m=>{
    const v=metricFields(data,m);
    return `<tr><th scope="row">${esc(m.label)} <small>(${esc(m.unit)})</small></th><td>${fmt(v.observed)}</td><td>${fmt(v.predicted)}</td><td>${fmt(v.lln)}</td><td>${fmt(v.z)}</td><td>${pct(v.percent)}</td></tr>`;
  }).join('');
  return `<section class="measure"><h3>${esc(phase)} bronchodilator measurements</h3>
  <table><thead><tr><th>Variable</th><th>Observed</th><th>Predicted</th><th>LLN</th><th>Z-score</th><th>% Pred.</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}
function changeTable(pre,post){
  if (!post || !pre) return '<p class="muted">Bronchodilator comparison unavailable: paired pre/post measurements not recorded.</p>';
  return `<table><thead><tr><th>Variable</th><th>Pre</th><th>Post</th><th>Δ Absolute</th><th>Δ % baseline</th><th>Δ % predicted</th></tr></thead><tbody>${METRICS.map(m=>{
    const a=n(pre[m.key]),b=n(post[m.key]);
    const delta=a==null||b==null?null:b-a;
    const aPred=n(pre[`pred_${m.pred}`]);
    const pp=delta!=null && aPred>0 ? delta/aPred*100 : null;
    const scaled=m.unit==='L'?1000:1;
    const unit=m.unit==='L'?'mL':m.unit==='ratio'?'ratio':m.unit;
    return `<tr><th scope="row">${esc(m.label)}</th><td>${fmt(a)}</td><td>${fmt(b)}</td><td>${delta==null?MISSING:`${delta>=0?'+':''}${fmt(delta*scaled, m.unit==='L'?0:2)} ${esc(unit)}`}</td><td>${a==null||a===0||b==null?MISSING:pct((b-a)/a*100)}</td><td>${pp==null?MISSING:pct(pp)}</td></tr>`;
  }).join('')}</tbody></table>`;
}
function buildSpirometryReportHtml(data, meta={}){
  const patient=data.patient||{}, pre=data.pre??null, post=data.post??null;
  const preFV=toFlowVolumePoints(data.preFlows),postFV=toFlowVolumePoints(data.postFlows);
  const preVT=toVolumeTimePoints(data.preVolumes,data.preFlows),postVT=toVolumeTimePoints(data.postVolumes,data.postFlows);
  const logo=meta.logoDataUri&&String(meta.logoDataUri).startsWith('data:image/')?`<img class="logo" src="${esc(meta.logoDataUri)}" alt="VitalFlo"/>`:'<span class="logoFallback">V</span>';
  const info=[['Patient',patient.name],['Patient ID',patient.id],['Date of test',patient.testDate],['Date of birth',patient.dob],['Age at test',patient.age],['Sex',patient.sex],['Height',patient.height],['Weight',patient.weight],['BMI',patient.bmi],['Ethnicity',patient.ethnicity],['Smoking',patient.smoking],['Referring clinician',patient.referredBy]].map(([k,v])=>`<div class="item"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');
  const preLabel=pre?`Pre: ${esc(fmtDate(pre.dbdate))} · Test ${esc(pre.id)}`:'Pre observation not available';
  const postLabel=post?`Post: ${esc(fmtDate(post.dbdate))} · Test ${esc(post.id)}`:'No paired post-bronchodilator observation';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <style>
  @page {size:A4; margin:12mm;} *{box-sizing:border-box}
  body{font:11px/1.42 Arial,sans-serif;color:#172440;margin:0} header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #22396b;padding-bottom:12px;margin-bottom:12px}
  .brand{display:flex;align-items:center;gap:8px;font-size:22px;font-weight:700;color:#22396b}.logo{max-height:34px;max-width:175px}.logoFallback{width:30px;height:30px;background:#233e7c;color:white;border-radius:9px;display:flex;align-items:center;justify-content:center}
  h1{font-size:18px;margin:0;color:#22396b}h2{font-size:14px;margin:12px 0 8px;color:#22396b}h3{font-size:12px;margin:12px 0 6px;color:#22396b}
  .sub{font-size:9.5px;color:#53617b}.info{display:grid;grid-template-columns:repeat(3,1fr);gap:6px 12px;margin-bottom:10px;padding:12px;background:#f3f6fc;border-radius:10px}
  .item{display:flex;flex-direction:column;gap:2px}.item span{font-size:9px;color:#64738b}.item strong{font-size:11px;font-weight:600;word-break:break-word}
  table{width:100%;border-collapse:collapse;table-layout:fixed}td,th{border-bottom:1px solid #dbe1ec;padding:5px 7px;text-align:right;white-space:nowrap}td:first-child,th:first-child{text-align:left;width:27%}thead th{background:#eaf0fa;color:#30456d;font-size:10px}tbody th{font-weight:600}tbody tr:nth-child(even){background:#fafbfe}small{color:#6d7890;font-size:9px}
  section.measure{break-inside:avoid;page-break-inside:avoid}.muted{color:#687b95}.summary{margin:8px 0;padding:8px;border-left:3px solid #315fc0;background:#f2f6ff}
  .plot{margin-top:10px;padding:8px 10px;border:1px solid #dfe6f1;border-radius:10px;break-inside:avoid;page-break-inside:avoid}.plot-title{font-size:12px;font-weight:600;margin-bottom:5px;color:#22396b}.plot svg{display:block;width:100%;height:auto}.no-chart{text-align:center;color:#7b879a;background:#f4f7fb;border-radius:5px;padding:30px}
  .foot{margin-top:10px;color:#65738a;font-size:9px}.status{margin:4px 0 8px;color:#56637c}
  </style></head><body>
  <header><div class="brand">${logo}<span>VitalFlo</span></div><div><h1>Spirometry &amp; Bronchodilator Report</h1><div class="sub">Recorded measurements · GLI reference values where available</div></div></header>
  <div class="info">${info}</div>
  <div class="status">${preLabel}<br/>${postLabel}</div>
  ${measurementTable('Pre',pre)}
  ${measurementTable('Post',post)}
  <section class="measure"><h3>Bronchodilator responsiveness</h3>${changeTable(pre,post)}</section>
  <h2>Recorded curves: pre vs post</h2>
  ${svgChart('Flow–volume curve',preFV,postFV,'Volume (L)','Flow (L/s)',{zeroX:true,zeroY:false})}
  ${svgChart('Volume–time curve',preVT,postVT,'Time (s)','Volume (L)',{zeroX:true,zeroY:true})}
  <div class="foot">Reported session values use the shared web/mobile best-per-field calculation. Curves depict a representative recorded maneuver for each phase, not a synthetic combined maneuver. Missing measurements and reference predictions remain N/A. Bronchodilator change is descriptive, not an automatic clinical interpretation.</div>
  </body></html>`;
}
module.exports={buildSpirometryReportHtml,toFlowVolumePoints,toVolumeTimePoints,svgChart};
