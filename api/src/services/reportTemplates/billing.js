const { renderDocument, chartCanvas, fmtDate, rangeLabel } = require('./layout');

function dailyReadingsChart(canvasId, dailyReadings) {
  return `
    window.__registerChart();
    new Chart(document.getElementById('${canvasId}').getContext('2d'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(dailyReadings.map((d) => d.date))},
        datasets: [{
          label: 'Readings',
          data: ${JSON.stringify(dailyReadings.map((d) => d.readings))},
          backgroundColor: '#2563EB',
        }],
      },
      options: {
        responsive: false,
        animation: { onComplete: window.__chartDone, duration: 200 },
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { maxRotation: 45, minRotation: 45, font: { size: 8 } } } },
      },
    });`;
}

function buildBillingHtml(data, meta = {}) {
  if (!data || data.dailyReadings.length === 0) {
    return renderDocument({
      title: `Billing — ${rangeLabel(data?.startDate, data?.endDate, meta.isAllTime)}`,
      meta,
      bodyHtml: '<div class="card"><p class="empty-state">No readings recorded in this date range.</p></div>',
    });
  }

  const rowsHtml = data.dailyReadings
    .map((d) => `<tr><td>${fmtDate(d.date)}</td><td>${d.readings}</td></tr>`)
    .join('');

  const bodyHtml = `
    <div class="patient-strip">
      <div><span class="label">From</span><span class="value">${fmtDate(data.startDate)}</span></div>
      <div><span class="label">To</span><span class="value">${fmtDate(data.endDate)}</span></div>
      <div><span class="label">Days With Readings</span><span class="value">${data.totalDaysWithReadings}</span></div>
    </div>

    <div class="card">
      <h3 class="card-title">Daily Readings</h3>
      ${chartCanvas('dailyReadingsChart', 220)}
    </div>

    <div class="card">
      <h3 class="card-title">Readings Log</h3>
      <table class="results-table">
        <thead><tr><th>Date</th><th>Readings</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p class="fine-print">Billing-cycle thresholds (e.g. "16 of 30 days") aren't stored in the schema yet — this report shows raw daily counts only; apply the threshold downstream or add a config table for it.</p>
    </div>`;

  return renderDocument({
    title: `Billing — ${rangeLabel(data.startDate, data.endDate, meta.isAllTime)}`,
    meta,
    bodyHtml,
    chartInitScripts: [dailyReadingsChart('dailyReadingsChart', data.dailyReadings)],
  });
}

module.exports = { buildBillingHtml };