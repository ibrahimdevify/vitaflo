import { useId } from "react";

const TONES = {
  dark: "border-black/25 text-[#0f0f0f] placeholder:text-[#9a9a9a] focus-within:border-[#2c4d77]",
  light:
    "border-white/30 text-white placeholder:text-white/70 focus-within:border-lime-vc",
};

export default function UnderlineInput({
  label,
  as: Field = "input",
  tone = "dark",
  className = "",
  ...rest
}) {
  const id = useId();
  return (
    <div className={`border-b transition-colors ${TONES[tone]} ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Field
        id={id}
        placeholder={`${label}${rest.required ? "*" : ""}`}
        className="block w-full resize-none bg-transparent py-4 text-[clamp(16px,1.2vw,30px)] outline-none placeholder:text-inherit lg:py-[1.4vw]"
        {...rest}
      />
    </div>
  );
}
