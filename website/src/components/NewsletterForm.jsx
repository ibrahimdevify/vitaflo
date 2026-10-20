import { useState } from "react";
import { ArrowRight } from "lucide-react";
import UnderlineInput from "./ui/UnderlineInput.jsx";
import RollText from "./ui/RollText.jsx";
import { submitForm, formsConfigured } from "../lib/submitForm.js";

// "Join Our Mail List" block of the footer.
// In Footer.jsx: delete the old `function Newsletter() {...}` and add
//   import Newsletter from "./NewsletterForm.jsx";
// The <Newsletter /> tag in the footer stays as it is.

const TEXT = "text-[clamp(15px,1.05vw,26px)] text-white";
const LABEL = "text-[clamp(14px,0.95vw,24px)] text-white/75";

export default function Newsletter() {
  const [status, setStatus] = useState("idle"); // idle | sending | done | too-many | error

  const onSubmit = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));

    if (!formsConfigured) {
      setStatus("done"); // not connected yet: same as the old front-end-only behaviour
      return;
    }

    setStatus("sending");
    try {
      await submitForm("newsletter", {
        email: f.email,
        website: f.website || "", // honeypot
      });
      setStatus("done");
    } catch (err) {
      setStatus(err.message === "too-many" ? "done" : "error");
    }
  };

  const sending = status === "sending";

  return (
    <div>
      <p className={LABEL}>Join Our Mail List</p>
      {status === "done" ? (
        <p role="status" className={`${TEXT} mt-4 lg:mt-[1.2vw]`}>
          Thanks, you&apos;re on the list.
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-2 flex items-end gap-4 lg:mt-[0.4vw] lg:gap-[1.2vw]"
        >
          <UnderlineInput
            label="Your Email"
            name="email"
            type="email"
            required
            tone="light"
            autoComplete="email"
            className="w-full max-w-[15.25vw] min-w-[180px]"
          />
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", opacity: 0 }}
          />
          <button
            type="submit"
            disabled={sending}
            className="group/roll flex items-center gap-2 pb-4 text-[clamp(15px,1.05vw,26px)] transition-colors hover:text-lime-vc disabled:cursor-wait disabled:opacity-70 lg:pb-[1.4vw]"
          >
            <RollText>{sending ? "Sending..." : "Submit"}</RollText>
            <ArrowRight
              className="h-[1.1em] w-[1.1em]"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </form>
      )}
      {status === "error" && (
        <p
          role="status"
          className="mt-3 text-[clamp(13px,0.9vw,22px)] text-[#ffb4ab]"
        >
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
