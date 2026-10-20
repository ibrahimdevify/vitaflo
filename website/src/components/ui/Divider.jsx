const VARIANTS = {
  dark: "bg-gradient-to-r from-white/10 via-white/40 to-white/10", // gehre background par
  light: "bg-black/15", // halke background par
};

export default function Divider({ on = "dark", className = "" }) {
  return (
    <div
      role="separator"
      className={`h-px w-full ${VARIANTS[on]} ${className}`}
    />
  );
}
