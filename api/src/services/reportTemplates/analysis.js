const { renderDocument, chartCanvas, fmtDate, fmt, rangeLabel } = require('./layout');

function trendLineChart(canvasId, trendPoints, label, color) {
  return `
    window.__registerChart();
    new Chart(document.getElementById('${canvasId}').getContext('2d'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(trendPoints.map((p) => (p.date ? new Date(p.date).toISOString().slice(0, 10) : '')))},
        datasets: [{
          label: '${label}',
          data: ${JSON.stringify(trendPoints.map((p) => p.value))},
          borderColor: '${color}',
          backgroundColor: '${color}',
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
        scales: { x: { ticks: { maxRotation: 45, minRotation: 45, font: { size: 8 } } } },
      },
    });`;
}

function airQualityChart(canvasId, airQuality) {
  return `
    window.__registerChart();
    new Chart(document.getElementById('${canvasId}').getContext('2d'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(airQuality.map((a) => (a.date ? new Date(a.date).toISOString().slice(0, 10) : '')))},
        datasets: [
          { label: 'PM2.5', data: ${JSON.stringify(airQuality.map((a) => a.pm25))}, backgroundColor: '#F97316' },
          { label: 'PM10', data: ${JSON.stringify(airQuality.map((a) => a.pm10))}, backgroundColor: '#FACC15' },
        ],
      },
      options: {
        responsive: false,
        animation: { onComplete: window.__chartDone, duration: 200 },
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 } } } },
        scales: { x: { ticks: { maxRotation: 45, minRotation: 45, font: { size: 8 } } } },
      },
    });`;
}

function buildAnalysisHtml(data, meta = {}) {
  if (!data || (data.trend.length === 0 && data.indoorAirQuality.length === 0)) {
    return renderDocument({
      title: `Analysis — ${data ? data.variable : ''}`,
      meta,
      bodyHtml: '<div class="card"><p class="empty-state">No trend or indoor air quality data for this range.</p></div>',
    });
  }

  const chartInitScripts = [];
  if (data.trend.length) chartInitScripts.push(trendLineChart('trendChart', data.trend, data.variable, '#2563EB'));
  if (data.indoorAirQuality.length) chartInitScripts.push(airQualityChart('airQualityChart', data.indoorAirQuality));

  const bodyHtml = `
    <div class="patient-strip">
      <div><span class="label">Variable</span><span class="value">${data.variable}</span></div>
      <div><span class="label">Range</span><span class="value">${rangeLabel(data.trend[0]?.date, data.trend[data.trend.length - 1]?.date, meta.isAllTime)}</span></div>
      <div><span class="label">Most Recent</span><span class="value">${fmt(data.mostRecent)}</span></div>
      <div><span class="label">Data Points</span><span class="value">${data.trend.length}</span></div>
    </div>

    ${data.trend.length
      ? `<div class="card"><h3 class="card-title">${data.variable} Trend</h3>${chartCanvas('trendChart', 240)}</div>`
      : '<div class="card"><p class="empty-state">No trend data for this variable in the selected range.</p></div>'}

    ${data.indoorAirQuality.length
      ? `<div class="card"><h3 class="card-title">Indoor Air Quality</h3>${chartCanvas('airQualityChart', 240)}
         <p class="fine-print">Outdoor air quality is not shown — no backing table exists for it yet.</p></div>`
      : ''}`;

  return renderDocument({ title: `Analysis — ${data.variable}`, meta, bodyHtml, chartInitScripts });
}

module.exports = { buildAnalysisHtml };