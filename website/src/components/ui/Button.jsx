const VARIANTS = {
  lime: "bg-lime-vc text-ink-vc shadow-lg hover:brightness-105",
  glass: "bg-white/20 text-white backdrop-blur hover:bg-white/30",
  soft: "bg-white/15 text-white backdrop-blur",
};

const SIZES = {
  md: "px-6 py-[13px]",
  lg: "px-6 py-[19px]",
};

export default function Button({
  href = "#",
  variant = "lime",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  return (
    <a
      href={href}
      className={`inline-block whitespace-nowrap rounded-full text-xl transition ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
