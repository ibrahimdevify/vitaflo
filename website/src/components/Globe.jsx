export default function Globe({ className = "" }) {
  return (
    <svg
      width="108"
      height="108"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="globeGrad" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#7fd0ee" />
          <stop offset=".55" stopColor="#2a7bb0" />
          <stop offset="1" stopColor="#123a66" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="38" fill="url(#globeGrad)" />
      <g stroke="#bfe9f7" strokeOpacity=".75" strokeWidth="1">
        <ellipse cx="60" cy="60" rx="38" ry="14" />
        <ellipse cx="60" cy="60" rx="14" ry="38" />
        <ellipse
          cx="60"
          cy="60"
          rx="56"
          ry="20"
          transform="rotate(-28 60 60)"
        />
        <ellipse cx="60" cy="60" rx="56" ry="20" transform="rotate(28 60 60)" />
      </g>
      <path
        d="M40 48c6-8 14-9 18-4s-2 9-8 10-12 2-10-6Zm26 14c5-3 11 0 10 6s-8 12-12 8-3-11 2-14Z"
        fill="#9fe08a"
        fillOpacity=".7"
      />
    </svg>
  );
}
