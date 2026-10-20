export default function BigWord({ children, className = "" }) {
  return (
    <svg
      viewBox="0 0 1000 160"
      role="img"
      aria-label={children}
      className={`block w-full select-none ${className}`}
      fill="currentColor"
    >
      <text
        x="0"
        y="156"
        textLength="1000"
        lengthAdjust="spacing"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="210"
        fontWeight="400"
      >
        {children}
      </text>
    </svg>
  );
}
