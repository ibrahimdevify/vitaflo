import { useState } from "react";

// Shows the image, or (while the file is missing) a dashed placeholder.
// Delete the placeholder branch before launch.
export default function ProductImage({
  src,
  alt,
  label,
  round = false,
  className = "",
}) {
  const [failed, setFailed] = useState(false);
  const shape = round ? "rounded-full" : "rounded-[clamp(16px,1.3vw,32px)]";

  if (!src || failed) {
    return (
      <div
        className={`flex aspect-square w-full items-center justify-center border-2 border-dashed border-[#2c4d77]/40 bg-[#2c4d77]/5 p-6 text-center text-[clamp(11px,0.8vw,16px)] text-[#2c4d77] ${shape} ${className}`}
      >
        {label ? `Image not found: ${label}` : "Image not found"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`block aspect-square w-full object-cover ${shape} ${className}`}
    />
  );
}
