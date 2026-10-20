const PATHS = {
  prev: "M19 12H5M12 19l-7-7 7-7",
  next: "M5 12h14M12 5l7 7-7 7",
};

export default function ArrowButton({
  direction = "next",
  onClick,
  label,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? (direction === "next" ? "Next" : "Previous")}
      className={`grid h-[clamp(44px,2.6vw,66px)] w-[clamp(44px,2.6vw,66px)] place-items-center rounded-full border-[1.5px] border-[#2c4d77] text-[#2c4d77] transition-colors duration-300 hover:bg-[#2c4d77] hover:text-white ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[42%] w-[42%]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={PATHS[direction]} />
      </svg>
    </button>
  );
}
