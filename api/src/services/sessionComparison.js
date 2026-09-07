const { renderDocument, resultsTable, chartCanvas, fmtDate, fmt } = require('../reportTemplates/layout');
const { multiSeriesLineChart } = require('../reportTemplates/spirometry');

function sessionColumn(session, index) {
  const flowCanvas = `flowVolumeChart${index}`;
  const volCanvas = `volumeTimeChart${index}`;
  return {
    html: `
      <div class="col">
        <div class="patient-strip" style="flex-wrap:wrap;">
          <div><span class="label">Session ${index}</span><span class="value">${fmtDate(session.date)}</span></div>
          <div><span class="label">Bronchodilator</span>
            <span class="badge ${session.isPostBronchodilator ? 'badge-green' : 'badge-gray'}">
              ${session.isPostBronchodilator ? 'Post' : 'Pre'}
            </span>
          </div>
        </div>
        ${resultsTable(session.results, { title: `Session ${index} Results` })}
        <div class="card"><h3 class="card-title">Flow / Volume</h3>${chartCanvas(flowCanvas, 200)}</div>
        <div class="card"><h3 class="card-title">Volume / Time</h3>${chartCanvas(volCanvas, 200)}</div>
      </div>`,
    chartInitScripts: [
      multiSeriesLineChart(flowCanvas, session.flowVolumeSeries, {
        xKey: 'volume', yKey: 'flow', xLabel: 'Volume (L)', yLabel: 'Flow (L/s)',
      }),
      multiSeriesLineChart(volCanvas, session.volumeTimeSeries, {
        xKey: 'time', yKey: 'volume', xLabel: 'Time (s)', yLabel: 'Volume (L)',
      }),
    ],
  };
}

/** Looks up a variable's `observed` value out of a results-row array. */
function observedFor(results, variable) {
  const row = results.find((r) => r.variable === variable);
  return row ? row.observed : null;
}

function buildSessionComparisonHtml(data, meta = {}) {
  if (!data || !data.session1 || !data.session2) {
    return renderDocument({
      title: 'Session Comparison',
      meta,
      bodyHtml: '<div class="card"><p class="empty-state">Both sessions must exist for this patient to compare.</p></div>',
    });
  }

  const col1 = sessionColumn(data.session1, 1);
  const col2 = sessionColumn(data.session2, 2);

  const fev1a = observedFor(data.session1.results, 'FEV1');
  const fev1b = observedFor(data.session2.results, 'FEV1');
  const fev1DeltaPct =
    typeof fev1a === 'number' && typeof fev1b === 'number' && fev1a !== 0
      ? (((fev1b - fev1a) / fev1a) * 100).toFixed(1)
      : null;

  const summaryHtml = `
    <div class="patient-strip">
      <div><span class="label">Time Between Sessions</span><span class="value">${fmt(data.timeBetweenSessionsHours, 1)} hrs</span></div>
      <div><span class="label">FEV1 Change</span>
        <span class="value">${fev1DeltaPct !== null ? `${fev1DeltaPct > 0 ? '+' : ''}${fev1DeltaPct}%` : 'N/A'}</span>
      </div>
    </div>`;

  const bodyHtml = `
    ${summaryHtml}
    <div class="grid">
      ${col1.html}
      ${col2.html}
    </div>`;

  return renderDocument({
    title: 'Session Comparison',
    meta,
    bodyHtml,
    chartInitScripts: [...col1.chartInitScripts, ...col2.chartInitScripts],
  });
}

module.exports = { buildSessionComparisonHtml };