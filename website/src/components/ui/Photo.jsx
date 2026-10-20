export default function Photo({ src, alt = "", className = "" }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`block w-full rounded-[clamp(16px,1.3vw,32px)] object-cover ${className}`}
    />
  );
}
