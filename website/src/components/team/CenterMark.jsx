export default function CenterMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 454 483"
      fill="none"
      stroke="#111"
      strokeWidth="1.2"
      aria-hidden="true"
      className={`h-[20vw] w-[18.8vw] ${className}`}
    >
      <path d="M227 0V483" vectorEffect="non-scaling-stroke" />
      <path
        d="M0 6A227 227 0 0 0 454 6"
        transform="rotate(-2.5 227 6)"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 460A227 227 0 0 1 454 460"
        transform="rotate(2.5 227 460)"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
