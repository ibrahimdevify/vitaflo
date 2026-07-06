function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="flex min-h-[calc(100vh-100px)] flex-col items-center justify-center gap-5 bg-surface">
      <svg
        viewBox="0 0 300 60"
        className="h-16 w-72"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Faint baseline trace, always visible */}
        <path
          d="M0,30 H60 L72,8 L84,52 L96,30 H160 L172,14 L182,44 L192,30 H300"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bright pulse traveling along the same trace */}
        <path
          d="M0,30 H60 L72,8 L84,52 L96,30 H160 L172,14 L182,44 L192,30 H300"
          fill="none"
          stroke="var(--color-brand-600)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          strokeDasharray="0.18 1"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="1"
            to="0"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      <p className="text-sm text-fg-muted animate-pulse">{message}</p>
    </div>
  );
}

export default PageLoader;
