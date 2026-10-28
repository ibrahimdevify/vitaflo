import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Container from "./ui/Container.jsx";
import BigWord from "./ui/BigWord.jsx";
import UnderlineInput from "./ui/UnderlineInput.jsx";
import RollText from "./ui/RollText.jsx";
import { SITE } from "../data/site.js";
import { submitForm } from "./contact/ContactForm.jsx";

const PAGE_LINKS = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Career", to: "/career" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const INFO_LINKS = [
  ...PAGE_LINKS,
  { label: "Help Center", to: "/help-center" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy" },
];

const LABEL = "text-[clamp(14px,0.95vw,24px)] text-white/75";
const TEXT = "text-[clamp(15px,1.05vw,26px)] text-white";
const LINK = `${TEXT} transition-colors hover:text-lime-vc`;
const LIST =
  "m-0 mt-4 flex list-none flex-col gap-3 p-0 lg:mt-[1.2vw] lg:gap-[1.15vw]";

function Newsletter() {
  const [status, setStatus] = useState("idle");

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.target);
    const email = formData.get("email");

    try {
      await submitForm("newsletter", { email });
      setStatus("success");
      e.target.reset();
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div>
      <p className={LABEL}>Join Our Mail List</p>
      {status === "success" ? (
        <p role="status" className={`${TEXT} mt-4 lg:mt-[1.2vw]`}>
          Thanks, you&apos;re on the list.
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-2 flex items-end gap-4 lg:mt-[0.4vw] lg:gap-[1.2vw]"
        >
          <div className="relative w-full max-w-[14vw] min-w-[170px] pb-2">
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="Your Email*"
              className="peer w-full bg-transparent border-b border-white/30 pb-2 text-[clamp(15px,1.05vw,26px)] text-white placeholder-white/50 focus:border-white focus:outline-none transition-colors"
              style={{
                WebkitTextFillColor: "#ffffff",
                WebkitBoxShadow: "0 0 0px 1000px transparent inset",
                transition: "background-color 5000s ease-in-out 0s",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="group/roll flex items-center gap-2 pb-4 text-[clamp(15px,1.05vw,26px)] transition-colors hover:text-lime-vc lg:pb-[1.4vw] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RollText>{status === "loading" ? "Wait..." : "Submit"}</RollText>
            <ArrowRight
              className="h-[1.1em] w-[1.1em]"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="text-red-400 text-sm mt-2">
          Something went wrong. Try again.
        </p>
      )}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="footer-bg text-white">
      <Container className="pt-12 lg:pt-[4.2vw]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[30fr_15fr_15fr_20fr] lg:gap-0">
          <div className="col-span-2 lg:col-span-1">
            <Newsletter />
          </div>

          <nav aria-label="Information">
            <p className={LABEL}>Information</p>
            <ul className={LIST}>
              {INFO_LINKS.map((l) => (
                <li key={l.to || l.label}>
                  <Link to={l.to} className={LINK}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className={LABEL}>Social Media</p>
            <ul className={LIST}>
              {SITE.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className={LINK}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <p className={LABEL}>Contacts</p>
            <address
              className={`${TEXT} mt-4 not-italic leading-[1.5] lg:mt-[1.2vw]`}
            >
              {SITE.address}
            </address>
            <a
              href={`mailto:${SITE.email}`}
              className={`${LINK} mt-4 inline-block lg:mt-[1.2vw]`}
            >
              {SITE.email}
            </a>
            {/* <a
              href={`mailto:${SITE.email2}`}
              className={`${LINK} mt-4 inline-block lg:mt-[1.2vw]`}
            >
              {SITE.email2}
            </a> */}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/20 pt-5 text-[clamp(13px,0.85vw,22px)] text-white/75 sm:flex-row sm:items-center sm:justify-between lg:mt-[5.5vw] lg:pt-[1.3vw]">
          <p className="m-0">
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>

          {/* Yahan link add kar diya gaya hai */}
          <p className="m-0 hidden sm:block">
            Designed By{" "}
            <a
              href="https://www.devifysolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              Devify Solutions
            </a>{" "}
            with ❤️
          </p>
        </div>

        <BigWord className="mt-6 pb-6 text-[#faf8f4] lg:mt-[2.6vw] lg:pb-[2.2vw]">
          VITALFLO
        </BigWord>
      </Container>
    </footer>
  );
}
