const COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#4b5563"];

/**
 * Minimal multi-series line chart with no external chart library dependency.
 * series: [{ label: string, points: [{ x: number, y: number }] }]
 */
export default function MiniLineChart({ series, xLabel, yLabel, height = 260 }) {
  const width = 640;
  const padding = 40;

  const allPoints = series.flatMap((s) => s.points);
  if (allPoints.length === 0) {
    return <p className="text-sm text-fg-muted">No data to display</p>;
  }

  const xValues = allPoints.map((p) => p.x);
  const yValues = allPoints.map((p) => p.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(0, ...yValues);
  const yMax = Math.max(...yValues);

  const scaleX = (x) => padding + ((x - xMin) / (xMax - xMin || 1)) * (width - padding * 2);
  const scaleY = (y) => height - padding - ((y - yMin) / (yMax - yMin || 1)) * (height - padding * 2);

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-border" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" className="text-border" />
        {series.map((s, i) => {
          const path = s.points
            .map((p, idx) => `${idx === 0 ? "M" : "L"} ${scaleX(p.x)} ${scaleY(p.y)}`)
            .join(" ");
          return <path key={s.label} d={path} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="1.5" />;
        })}
      </svg>
      <div className="flex flex-wrap gap-3">
        {series.map((s, i) => (
          <span key={s.label} className="flex items-center gap-1.5 text-xs text-fg-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            {s.label}
          </span>
        ))}
      </div>
      {(xLabel || yLabel) && <p className="text-xs text-fg-muted">{xLabel} vs {yLabel}</p>}
    </div>
  );
}