import { useId, useState } from "react";
import BodyText from "./BodyText.jsx";

function ToggleIcon({ open }) {
  return (
    <span className="grid h-[clamp(32px,1.8vw,46px)] w-[clamp(32px,1.8vw,46px)] shrink-0 place-items-center rounded-full border-[1.5px] border-[#2c4d77] text-[#2c4d77] transition-colors duration-300 group-hover:bg-[#2c4d77] group-hover:text-white">
      <svg
        viewBox="0 0 24 24"
        className="h-[74%] w-[74%]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path
          d="M12 5v14"
          style={{
            transformOrigin: "12px 12px",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            opacity: open ? 0 : 1,
            transition: "transform .3s ease, opacity .3s ease",
          }}
        />
      </svg>
    </span>
  );
}

export default function Accordion({
  items,
  defaultOpen = null,
  className = "",
}) {
  const [openIndex, setOpenIndex] = useState(defaultOpen);
  const uid = useId();

  return (
    <div className={className}>
      {items.map((item, i) => {
        const open = openIndex === i;
        const labeled = Boolean(item.label);
        const btnId = `${uid}-btn-${i}`;
        const panelId = `${uid}-panel-${i}`;

        return (
          <div
            key={item.question}
            className={`border-b border-black/20 ${
              labeled
                ? "pb-5 pt-6 lg:pb-[1.25vw] lg:pt-[1.98vw]"
                : "pb-6 pt-7 lg:pb-[1.83vw] lg:pt-[2.5vw]"
            }`}
          >
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                className="group block w-full text-left"
              >
                {labeled && (
                  <span className="block text-[clamp(13px,0.93vw,24px)] font-normal leading-[1.6] text-[#4a6fa0]">
                    {item.label}
                  </span>
                )}
                <span
                  className={`flex items-center justify-between gap-6 ${
                    labeled ? "mt-1 lg:mt-[0.66vw]" : ""
                  }`}
                >
                  <span className="block text-[clamp(15px,1.06vw,27px)] font-normal leading-[1.4] text-[#0f0f0f]">
                    {item.question}
                  </span>
                  <ToggleIcon open={open} />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${
                open
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <BodyText className="pt-3 lg:max-w-[31.5vw] lg:pt-[0.64vw]">
                  {item.answer}
                </BodyText>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
