import { useId, useState } from "react";
import RollText from "../ui/RollText.jsx";

// Fields in the order shown on the page. `half` = shares a row with the next one.
const FIELDS = [
  {
    name: "firstName",
    label: "First Name",
    required: true,
    half: true,
    autoComplete: "given-name",
    placeholder: "First Name",
  },
  {
    name: "lastName",
    label: "Last Name",
    required: true,
    half: true,
    autoComplete: "family-name",
    placeholder: "Last Name",
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    required: true,
    autoComplete: "tel",
    placeholder: "(000) 000-0000",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    autoComplete: "email",
    placeholder: "your-name@company.com",
  },
  {
    name: "company",
    label: "Company",
    required: true,
    autoComplete: "organization",
  },
  { name: "title", label: "Title", autoComplete: "organization-title" },
];

const LABEL =
  "mb-2 block text-[clamp(14px,0.95vw,24px)] font-medium text-[#0f0f0f] lg:mb-[0.45vw]";
const INPUT =
  "w-full rounded-full border border-[#2c4d77]/25 bg-white px-[clamp(16px,1.4vw,36px)] text-[clamp(15px,1vw,26px)] text-[#0f0f0f] outline-none transition placeholder:text-[#9a9a9a] focus:border-[#2c4d77] focus:ring-2 focus:ring-[#2c4d77]/25";

export default function DemoForm() {
  const uid = useId();
  const [sent, setSent] = useState(false);

  // Front-end only for now - send `data` to HubSpot / your API / email here.
  const onSubmit = (e) => {
    e.preventDefault();
    // const data = Object.fromEntries(new FormData(e.currentTarget));
    setSent(true);
  };

  return (
    <div>
      <h2 className="m-0 text-[clamp(32px,3.58vw,92px)] font-normal leading-[1.2] tracking-[-0.03em] text-[#0f0f0f]">
        Book a <span className="text-[#2c4d77]">Demo</span>
      </h2>

      {sent ? (
        <div role="status" className="mt-6 lg:mt-[2.4vw]">
          <p className="m-0 text-[clamp(18px,1.5vw,38px)] leading-[1.3] text-[#0f0f0f]">
            Thank you! We&apos;ve received your request.
          </p>
          <p className="m-0 mt-2 text-[clamp(15px,1vw,26px)] leading-[1.7] text-[#0f0f0f]/75 lg:mt-[0.6vw]">
            Our team will get back to you as soon as possible.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-5 text-[clamp(15px,1vw,26px)] text-[#2c4d77] underline underline-offset-4 lg:mt-[1.4vw]"
          >
            Send another request
          </button>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:mt-[2.4vw] lg:gap-x-[1.4vw] lg:gap-y-[1.5vw]"
        >
          {FIELDS.map((f) => {
            const id = `${uid}-${f.name}`;
            return (
              <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
                <label htmlFor={id} className={LABEL}>
                  {f.label}
                  {f.required && (
                    <span aria-hidden="true" className="text-[#d9534f]">
                      *
                    </span>
                  )}
                </label>
                <input
                  id={id}
                  name={f.name}
                  type={f.type ?? "text"}
                  required={f.required}
                  autoComplete={f.autoComplete}
                  placeholder={f.placeholder}
                  className={`${INPUT} h-[clamp(46px,2.4vw,64px)]`}
                />
              </div>
            );
          })}

          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-message`} className={LABEL}>
              Message
            </label>
            <textarea
              id={`${uid}-message`}
              name="message"
              rows={4}
              className={`${INPUT} resize-y rounded-[clamp(20px,1.6vw,40px)] py-3 lg:py-[0.8vw]`}
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="group/roll inline-flex h-[clamp(48px,3.3vw,84px)] items-center rounded-full bg-lime-vc px-[clamp(28px,2.4vw,60px)] text-[clamp(16px,1.1vw,28px)] text-ink-vc transition hover:brightness-105"
            >
              <RollText>Submit</RollText>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
