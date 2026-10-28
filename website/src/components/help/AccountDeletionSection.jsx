import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";
import Tag from "../ui/Tag.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import { submitDeletion } from "../../lib/submitDeletion.js";
import { HELP_EMAILS } from "../../data/helpCenter.js";

const FIELD =
  "w-full border-b border-gray-300 bg-transparent py-2 text-[clamp(15px,1.05vw,22px)] text-gray-900 placeholder-gray-300 transition-colors focus:border-gray-800 focus:outline-none";
const LABEL = "mb-2 block text-sm text-gray-500";

const BEFORE = [
  "Use the email address and mobile number linked to your VitalFlo account, so we can find it.",
  "We will email you to verify your identity before we process the request. This protects your information.",
  "Deleting your account cannot be undone.",
];

function Dot() {
  return (
    <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2c4d77]" />
  );
}

// Account deletion request (info + form). Lives inside the Help Center page
// at /help-center#account-deletion
export default function AccountDeletionSection() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [sentTo, setSentTo] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const details = String(data.get("details") || "").trim();

    // Only Gmail addresses are accepted (name@gmail.com).
    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      setEmailError("Please enter a valid Gmail address (name@gmail.com).");
      form.elements.namedItem("email")?.focus();
      return;
    }
    setEmailError("");

    // Mobile number is required: allow + ( ) - and spaces, but it must have
    // between 7 and 15 digits.
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      setPhoneError("Please enter a valid mobile number (7 to 15 digits).");
      form.elements.namedItem("phone")?.focus();
      return;
    }
    setPhoneError("");

    setStatus("loading");
    try {
      // Goes to the dedicated deletion Apps Script (DeletionCode.gs)
      await submitDeletion({
        name,
        email,
        phone,
        details,
        confirmed: "yes", // the checkbox is `required`, so it is always ticked here
        website: String(data.get("website") || ""), // honeypot
      });
      setSentTo(email);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="account-deletion"
      className="scroll-mt-20 bg-[#faf9f7] py-14 text-[#2b2b2b] lg:scroll-mt-[4vw] lg:py-[6vw]"
    >
      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <Tag>ACCOUNT DELETION</Tag>
          <SectionHeading className="mt-4 lg:mt-[1vw]">
            Delete your account
          </SectionHeading>
          <p className="m-0 mt-4 max-w-[640px] text-[clamp(14px,1.02vw,22px)] leading-[1.7] text-[#4a4a4a] lg:mt-[1.2vw] lg:max-w-[40vw]">
            Request deletion of your VitalFlo account and the personal
            information we hold about you.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-12 lg:mt-[4vw] lg:grid-cols-[1fr_1.05fr] lg:gap-[5vw]">
          {/* ── What to know ─────────────────────────────── */}
          <Reveal>
            <div>
              <h3 className="m-0 text-[clamp(20px,1.7vw,40px)] font-medium text-[#2c4d77]">
                Before you submit
              </h3>
              <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0 lg:mt-[1.1vw] lg:gap-[0.9vw]">
                {BEFORE.map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 text-[clamp(14px,1.02vw,22px)] leading-[1.7]"
                  >
                    <Dot />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <h3 className="m-0 mt-10 text-[clamp(20px,1.7vw,40px)] font-medium text-[#2c4d77] lg:mt-[3vw]">
                What we delete
              </h3>
              <p className="m-0 mt-3 text-[clamp(14px,1.02vw,22px)] leading-[1.75] lg:mt-[0.9vw]">
                Your account and the personal information we hold about you,
                such as your contact details and the health and device data you
                shared through the app. We take reasonable steps to remove it
                from the active part of our services.
              </p>

              <h3 className="m-0 mt-10 text-[clamp(20px,1.7vw,40px)] font-medium text-[#2c4d77] lg:mt-[3vw]">
                What we may keep
              </h3>
              <p className="m-0 mt-3 text-[clamp(14px,1.02vw,22px)] leading-[1.75] lg:mt-[0.9vw]">
                Information that the law requires us to retain. Data that was
                already shared with your healthcare provider stays in their
                records, and we cannot remove it from there. Please contact your
                provider directly about that data.
              </p>

              <p className="m-0 mt-10 text-[clamp(14px,1.02vw,22px)] leading-[1.75] lg:mt-[3vw]">
                Prefer email? Write to{" "}
                <a
                  href={`mailto:${HELP_EMAILS.privacy}`}
                  className="text-[#2c4d77] underline hover:text-black"
                >
                  {HELP_EMAILS.privacy}
                </a>
                . You can also read our{" "}
                <Link
                  to="/privacy"
                  className="text-[#2c4d77] underline hover:text-black"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </Reveal>

          {/* ── Request form ─────────────────────────────── */}
          <Reveal delay={0.1}>
            <div className="rounded-[24px] bg-white p-6 shadow-sm md:p-8 lg:rounded-[1.8vw] lg:p-[2.6vw]">
              {status === "success" ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="py-6 text-center"
                >
                  <h3 className="m-0 text-[clamp(22px,1.8vw,46px)] font-normal leading-tight tracking-[-0.02em] text-[#0f0f0f]">
                    Request submitted
                  </h3>
                  <p className="m-0 mt-4 text-[clamp(14px,1.02vw,22px)] leading-[1.7] text-[#4a4a4a]">
                    Your request has been submitted and your account will be
                    deleted in{" "}
                    <strong className="font-medium text-[#2c4d77]">
                      30 days
                    </strong>
                    .
                  </p>
                  <p className="m-0 mt-3 text-[clamp(13px,0.95vw,20px)] leading-[1.7] text-[#6a6a6a]">
                    We will also email{" "}
                    <strong className="font-medium text-[#2c4d77]">
                      {sentTo}
                    </strong>{" "}
                    to verify your identity.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col gap-7">
                  <h3 className="m-0 text-[clamp(20px,1.7vw,40px)] font-medium text-[#2c4d77]">
                    Request deletion
                  </h3>

                  <div>
                    <label htmlFor="del-name" className={LABEL}>
                      Full name*
                    </label>
                    <input
                      id="del-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your full name"
                      className={FIELD}
                    />
                  </div>

                  <div>
                    <label htmlFor="del-email" className={LABEL}>
                      Account email*
                    </label>
                    <input
                      id="del-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="yourname@gmail.com"
                      aria-invalid={Boolean(emailError)}
                      aria-describedby={
                        emailError ? "del-email-error" : undefined
                      }
                      onChange={() => emailError && setEmailError("")}
                      className={`${FIELD} ${emailError ? "!border-red-500" : ""}`}
                    />
                    {emailError && (
                      <p
                        id="del-email-error"
                        role="alert"
                        className="m-0 mt-2 text-sm text-red-600"
                      >
                        {emailError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="del-phone" className={LABEL}>
                      Mobile number*
                    </label>
                    <input
                      id="del-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      required
                      autoComplete="tel"
                      placeholder="The mobile number linked to your account"
                      aria-invalid={Boolean(phoneError)}
                      aria-describedby={
                        phoneError ? "del-phone-error" : undefined
                      }
                      onChange={() => phoneError && setPhoneError("")}
                      className={`${FIELD} ${phoneError ? "!border-red-500" : ""}`}
                    />
                    {phoneError && (
                      <p
                        id="del-phone-error"
                        role="alert"
                        className="m-0 mt-2 text-sm text-red-600"
                      >
                        {phoneError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="del-details" className={LABEL}>
                      Anything else we should know? (optional)
                    </label>
                    <textarea
                      id="del-details"
                      name="details"
                      rows="2"
                      placeholder="Add any details that help us find your account"
                      className={`${FIELD} resize-none`}
                    />
                  </div>

                  {/* Honeypot field */}
                  <input
                    type="text"
                    name="website"
                    className="hidden"
                    tabIndex="-1"
                    autoComplete="off"
                  />

                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-[1.6] text-gray-800">
                    <input
                      type="checkbox"
                      name="confirm"
                      required
                      className="mt-1 h-4 w-4 shrink-0 accent-[#2c4d77]"
                    />
                    <span>
                      I understand that deleting my account and data cannot be
                      undone, and I agree to the{" "}
                      <Link
                        to="/privacy"
                        className="underline hover:text-black"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="mt-1 w-full rounded-full bg-[#3B5A7D] px-6 py-4 font-medium text-white transition-colors hover:bg-[#2d4765] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "loading" ? "Sending..." : "Request deletion"}
                  </button>

                  {status === "error" && (
                    <div
                      role="alert"
                      className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700"
                    >
                      Something went wrong. Please try again, or email{" "}
                      <a
                        href={`mailto:${HELP_EMAILS.privacy}`}
                        className="underline"
                      >
                        {HELP_EMAILS.privacy}
                      </a>
                      .
                    </div>
                  )}
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
