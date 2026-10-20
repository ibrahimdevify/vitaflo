// Simple line illustrations for the service cards (used when a card has no
// photo). Drawn in white on the card's blue gradient, so they work on every
// screen size and need no image files.
const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const ART = {
  // Spirometry flow-volume loop
  practice: (
    <>
      <path d="M70 330V96M70 330H370" {...S} opacity=".45" />
      <path
        d="M70 330C78 170 140 100 198 108C256 116 296 230 370 330"
        {...S}
        strokeWidth="3.2"
      />
      <path d="M70 330C150 360 250 360 370 330" {...S} opacity=".35" />
      <circle cx="198" cy="108" r="7" fill="currentColor" />
      {[150, 210, 270].map((y) => (
        <path key={y} d={`M70 ${y}H370`} {...S} opacity=".12" />
      ))}
    </>
  ),
  // House + pulse line (remote / at home)
  home: (
    <>
      <path d="M126 222L216 142L306 222V318H126Z" {...S} strokeWidth="3" />
      <path d="M190 318V262H242V318" {...S} opacity=".5" />
      <path
        d="M66 276H168L190 226L222 322L246 262H366"
        {...S}
        strokeWidth="3.2"
      />
    </>
  ),
  // Concentric rings + pulse (small practice / DPC)
  dpc: (
    <>
      {[56, 100, 144].map((r, i) => (
        <circle
          key={r}
          cx="216"
          cy="214"
          r={r}
          {...S}
          opacity={0.55 - i * 0.15}
        />
      ))}
      <path
        d="M140 214H188L204 178L228 252L244 214H292"
        {...S}
        strokeWidth="3.2"
      />
    </>
  ),
  // Data points (clinical research)
  trials: (
    <>
      {Array.from({ length: 30 }, (_, i) => {
        const x = 96 + (i % 6) * 48;
        const y = 110 + Math.floor(i / 6) * 48;
        const hi = [3, 8, 14, 19, 26].includes(i);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={hi ? 9 : 5}
            fill="currentColor"
            opacity={hi ? 0.9 : 0.35}
          />
        );
      })}
      <path d="M240 110L192 158L240 206L336 254" {...S} opacity=".6" />
    </>
  ),
  // Buildings (hospitals / health systems)
  systems: (
    <>
      <path d="M70 330H370" {...S} opacity=".5" />
      <path d="M96 330V190H178V330" {...S} />
      <path d="M178 330V110H274V330" {...S} strokeWidth="3" />
      <path d="M274 330V218H346V330" {...S} />
      {[140, 170, 200, 230, 260].map((y) => (
        <path key={y} d={`M204 ${y}H248`} {...S} opacity=".45" />
      ))}
      <path d="M226 148V176M212 162H240" {...S} strokeWidth="3.2" />
    </>
  ),
  // Rising bars + trend (value-based outcomes)
  value: (
    <>
      <path d="M70 330H370" {...S} opacity=".5" />
      {[
        [96, 250],
        [160, 210],
        [224, 170],
        [288, 130],
      ].map(([x, y]) => (
        <rect
          key={x}
          x={x}
          y={y}
          width="44"
          height={330 - y}
          rx="8"
          fill="currentColor"
          opacity=".25"
        />
      ))}
      <path d="M92 232L182 188L246 150L346 96" {...S} strokeWidth="3.2" />
      <path d="M312 92H348V128" {...S} strokeWidth="3.2" />
    </>
  ),
  // People (group practices)
  group: (
    <>
      {[
        [136, 200, 0.5],
        [296, 200, 0.5],
        [216, 168, 1],
      ].map(([x, y, o]) => (
        <g key={x} opacity={o}>
          <circle cx={x} cy={y} r="30" {...S} strokeWidth="3" />
          <path
            d={`M${x - 52} ${y + 112}C${x - 52} ${y + 54} ${x + 52} ${y + 54} ${x + 52} ${y + 112}`}
            {...S}
            strokeWidth="3"
          />
        </g>
      ))}
    </>
  ),
  // Trend chart with alert (decision support)
  insights: (
    <>
      <path d="M70 330V96M70 330H370" {...S} opacity=".45" />
      {[150, 210, 270].map((y) => (
        <path key={y} d={`M70 ${y}H370`} {...S} opacity=".12" />
      ))}
      <path
        d="M84 280L140 240L196 262L252 170L308 196L360 116"
        {...S}
        strokeWidth="3.2"
      />
      <circle cx="252" cy="170" r="16" {...S} opacity=".5" />
      <circle cx="252" cy="170" r="7" fill="currentColor" />
    </>
  ),
};

export default function ServiceArt({ name }) {
  const art = ART[name];
  if (!art) return null;
  return (
    <svg
      viewBox="0 0 432 575"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full text-white/90"
    >
      {art}
    </svg>
  );
}
