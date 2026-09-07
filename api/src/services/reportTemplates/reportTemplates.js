const { renderDocument, resultsTable, chartCanvas, fmtDate } = require('./reportTemplates/layout');

function percentPredictedTrendChart(canvasId, rows) {
  const points = rows
    .map((r) => {
      const fev1 = r.results.find((x) => x.variable === 'FEV1');
      return fev1 && typeof fev1.percentPredicted === 'number'
        ? { date: r.date, value: fev1.percentPredicted }
        : null;
    })
    .filter(Boolean);

  if (!points.length) return null;

  return `
    window.__registerChart();
    new Chart(document.getElementById('${canvasId}').getContext('2d'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(points.map((p) => (p.date ? new Date(p.date).toISOString().slice(0, 10) : '')))},
        datasets: [{
          label: 'FEV1 % Predicted',
          data: ${JSON.stringify(points.map((p) => p.value))},
          borderColor: '#2563EB',
          backgroundColor: '#2563EB',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.2,
          fill: false,
        }],
      },
      options: {
        responsive: false,
        animation: { onComplete: window.__chartDone, duration: 200 },
        plugins: { legend: { display: false } },
        scales: { y: { title: { display: true, text: '% Predicted' } }, x: { ticks: { maxRotation: 45, minRotation: 45, font: { size: 8 } } } },
      },
    });`;
}

function buildReportsHtml(data, meta = {}) {
  if (!data || data.rows.length === 0) {
    return renderDocument({
      title: `Reports — ${fmtDate(data ? data.startDate : null)} to ${fmtDate(data ? data.endDate : null)}`,
      meta,
      bodyHtml: '<div class="card"><p class="empty-state">No observations recorded in this date range.</p></div>',
    });
  }

  const chartInitScripts = [];
  const trendScript = percentPredictedTrendChart('fev1TrendChart', data.rows);
  if (trendScript) chartInitScripts.push(trendScript);

  const perDateTables = data.rows
    .map((r) => resultsTable(r.results, { title: fmtDate(r.date) }))
    .join('');

  const bodyHtml = `
    <div class="patient-strip">
      <div><span class="label">From</span><span class="value">${fmtDate(data.startDate)}</span></div>
      <div><span class="label">To</span><span class="value">${fmtDate(data.endDate)}</span></div>
      <div><span class="label">Sessions</span><span class="value">${data.rows.length}</span></div>
    </div>

    ${trendScript ? `<div class="card"><h3 class="card-title">FEV1 % Predicted Over Time</h3>${chartCanvas('fev1TrendChart', 220)}</div>` : ''}

    ${perDateTables}`;

  return renderDocument({
    title: `Reports — ${fmtDate(data.startDate)} to ${fmtDate(data.endDate)}`,
    meta,
    bodyHtml,
    chartInitScripts,
  });
}

module.exports = { buildReportsHtml };