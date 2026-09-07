
const {
  renderDocument,
  resultsTable,
  zScoreScaleBar,
  gaugeCard,
  gaugePlaceholder,
  chartCanvas,
  fmtDate,
} = require('./layout');

const SERIES_COLORS = ['#0F766E', '#0284C7', '#1D4ED8', '#7C3AED', '#DB2777', '#0891B2', '#16A34A', '#B45309'];

/** Builds a Chart.js line-chart init script for a set of {testLabel, points} series. */
function multiSeriesLineChart(canvasId, series, { xKey, yKey, xLabel, yLabel, showDatasetAsScatter = false }) {
  const datasets = series.map((s, i) => ({
    label: s.testLabel,
    data: s.points.map((p) => ({ x: p[xKey], y: p[yKey] })),
    borderColor: SERIES_COLORS[i % SERIES_COLORS.length],
    backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length],
    borderWidth: 1.5,
    pointRadius: 0,
    fill: false,
    tension: 0.15,
  }));

  return `
    window.__registerChart();
    new Chart(document.getElementById('${canvasId}').getContext('2d'), {
      type: ${showDatasetAsScatter ? "'scatter'" : "'line'"},
      data: { datasets: ${JSON.stringify(datasets)} },
      options: {
        responsive: false,
        animation: { onComplete: window.__chartDone, duration: 200 },
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 } } } },
        scales: {
          x: { type: 'linear', title: { display: true, text: '${xLabel}' } },
          y: { title: { display: true, text: '${yLabel}' } },
        },
      },
    });`;
}

function buildSpirometryHtml(data, meta = {}) {
  if (!data || data.testsCount === 0) {
    return renderDocument({
      title: `Spirometry — ${fmtDate(data ? data.date : null)}`,
      meta,
      bodyHtml: '<div class="card"><p class="empty-state">No spirometry tests recorded for this date.</p></div>',
    });
  }

  const chartInitScripts = [];

  chartInitScripts.push(
    multiSeriesLineChart('flowVolumeChart', data.flowVolumeSeries, {
      xKey: 'volume',
      yKey: 'flow',
      xLabel: 'Volume (L)',
      yLabel: 'Flow (L/s)',
    })
  );
  chartInitScripts.push(
    multiSeriesLineChart('volumeTimeChart', data.volumeTimeSeries, {
      xKey: 'time',
      yKey: 'volume',
      xLabel: 'Time (s)',
      yLabel: 'Volume (L)',
    })
  );

  // Session Grades / Lung Age / Survey aren't returned by getSpirometryTab today — no
  // supporting fields exist on the observation/spirometry models yet. Render them only
  // if the caller passes precomputed values via `meta`, otherwise show a clear placeholder
  // rather than fabricating a score.
  const gaugesHtml = `
    <div class="gauge-row">
      ${meta.sessionGrades
        ? Object.entries(meta.sessionGrades)
            .map(([k, v]) => gaugeCard({ title: `Session Grade — ${k}`, valueLabel: v, ringPercent: 100 }))
            .join('')
        : gaugePlaceholder('Session Grades')}
      ${meta.lungAge
        ? gaugeCard({ title: 'Lung Age', valueLabel: meta.lungAge, ringPercent: Math.min(100, Number(meta.lungAge)) })
        : gaugePlaceholder('Lung Age')}
      ${meta.survey ? gaugeCard({ title: 'Survey', valueLabel: meta.survey, ringPercent: 100 }) : gaugePlaceholder('Survey')}
    </div>`;

  const bodyHtml = `
    <div class="patient-strip">
      <div><span class="label">Date</span><span class="value">${fmtDate(data.date)}</span></div>
      <div><span class="label">Tests Recorded</span><span class="value">${data.testsCount}</span></div>
    </div>

    <div class="grid">
      <div class="col">
        ${resultsTable(data.bestResults, { title: 'Spirometry Results (Best of Session)' })}
        <div class="card">
          <h3 class="card-title">Flow / Volume</h3>
          ${chartCanvas('flowVolumeChart', 220)}
        </div>
        <div class="card">
          <h3 class="card-title">Volume / Time</h3>
          ${chartCanvas('volumeTimeChart', 220)}
        </div>
      </div>
      <div class="col">
        ${gaugesHtml}
        ${zScoreScaleBar(data.bestResults)}
      </div>
    </div>`;

  return renderDocument({ title: `Spirometry — ${fmtDate(data.date)}`, meta, bodyHtml, chartInitScripts });
}

module.exports = { buildSpirometryHtml, multiSeriesLineChart, SERIES_COLORS };