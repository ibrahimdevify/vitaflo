export default function CheckList({ items, className = "" }) {
  return (
    <ul className={`flex flex-col gap-[clamp(10px,1.1vw,26px)] ${className}`}>
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-[clamp(10px,0.95vw,24px)] text-[clamp(15px,0.83vw,22px)] leading-[1.6] text-white/90"
        >
          <span
            aria-hidden="true"
            className="h-[clamp(8px,0.58vw,14px)] w-[clamp(8px,0.58vw,14px)] shrink-0 rounded-full bg-lime-vc"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
