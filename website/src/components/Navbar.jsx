import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Logo from "./Logo.jsx";
import { SITE, SOLUTIONS, CARE_SETTINGS } from "../data/site.js";
import RollText from "./ui/RollText.jsx";

const LINKS_BEFORE = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
];
const LINKS_AFTER = [
  { label: "Career", to: "/career" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

// The two dropdowns (same menus as vitalflohealth.com).
const MENUS = [
  { label: "Solutions", heading: "How We Help", items: SOLUTIONS },
  { label: "Care Settings", heading: "Who We Serve", items: CARE_SETTINGS },
];

const desktopClass = ({ isActive }) =>
  "pb-1 transition-colors " +
  (isActive
    ? "border-b border-lime-vc text-lime-vc"
    : "text-white/90 hover:text-lime-vc");

const mobileClass = ({ isActive }) =>
  isActive ? "text-lime-vc" : "text-white/90";

function DesktopLink({ l }) {
  return (
    <NavLink to={l.to} end={l.to === "/"} className={desktopClass}>
      {l.label}
    </NavLink>
  );
}

// Desktop dropdown: opens on hover, click/tap, or keyboard focus.
function Dropdown({ label, heading, items }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const active = items.some((i) => i.to === pathname);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 pb-1 transition-colors ${
          active
            ? "border-b border-lime-vc text-lime-vc"
            : "text-white/90 hover:text-lime-vc"
        }`}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={`h-[1.1em] w-[1.1em] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-40 -translate-x-1/2 pt-3">
          <ul className="m-0 min-w-[clamp(200px,15vw,340px)] list-none rounded-2xl bg-white p-2 text-[#1f2d3d] shadow-xl">
            <li className="px-4 pb-1 pt-3 text-[clamp(14px,0.95vw,22px)] font-medium text-[#2c4d77]">
              {heading}
            </li>
            {items.map((i) => (
              <li key={i.label}>
                <NavLink
                  to={i.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block whitespace-nowrap rounded-xl px-4 py-2.5 transition-colors hover:bg-[#2c4d77]/10 ${
                      isActive ? "font-medium text-[#3a95f0]" : ""
                    }`
                  }
                >
                  {i.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30">
      <div className="relative flex items-center justify-between px-6 py-6 lg:px-[6%] lg:pb-0 lg:pt-[1.45vw] xl:px-[12%]">
        <Logo />

        <nav
          aria-label="Main"
          className="hidden items-center gap-[1vw] text-[clamp(13px,0.8vw,22px)] lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2"
        >
          {LINKS_BEFORE.map((l) => (
            <DesktopLink key={l.to} l={l} />
          ))}
          {MENUS.map((m) => (
            <Dropdown key={m.label} {...m} />
          ))}
          {LINKS_AFTER.map((l) => (
            <DesktopLink key={l.to} l={l} />
          ))}
        </nav>

        <a
          href={SITE.portalUrl}
          className="group/roll hidden h-[clamp(44px,3.22vw,90px)] items-center rounded-full bg-white/20 px-[1.47vw] text-[clamp(15px,0.95vw,26px)] backdrop-blur transition hover:bg-white/30 lg:flex"
        >
          <RollText>Join Now</RollText>
        </a>

        <button
          className="rounded-full bg-white/20 p-3 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="mx-6 max-h-[80vh] overflow-y-auto rounded-3xl bg-[#2c4a6c]/95 p-6 backdrop-blur lg:hidden">
          <nav className="flex flex-col gap-4 text-lg">
            {LINKS_BEFORE.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={mobileClass}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}

            {MENUS.map((m) => (
              <div key={m.label} className="flex flex-col gap-4">
                <p className="m-0 mt-1 text-sm uppercase tracking-wide text-white/60">
                  {m.label}
                </p>
                {m.items.map((i) => (
                  <NavLink
                    key={i.label}
                    to={i.to}
                    className={({ isActive }) =>
                      `pl-4 ${mobileClass({ isActive })}`
                    }
                    onClick={() => setOpen(false)}
                  >
                    {i.label}
                  </NavLink>
                ))}
              </div>
            ))}

            {LINKS_AFTER.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={mobileClass}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            <a
              href={SITE.portalUrl}
              className="group/roll mt-2 rounded-full bg-lime-vc px-6 py-3 text-center font-medium text-ink-vc"
            >
              <RollText>Join Now</RollText>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
