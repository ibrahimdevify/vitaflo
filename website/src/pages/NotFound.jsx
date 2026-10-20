import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import GridBackdrop from "../components/ui/GridBackdrop.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import RollText from "../components/ui/RollText.jsx";

// Any URL that doesn't exist. Full-screen hero: 404, message, back button.
// The digits are SVG strokes (round ends, even thickness), so they look the
// same on every device and don't depend on a font.
export default function NotFound() {
  return (
    <section className="hero-bg relative flex min-h-screen flex-col overflow-clip">
      <GridBackdrop />
      <Navbar />

      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pb-16 pt-10 text-center lg:px-[12%] lg:pb-[6vw] lg:pt-[9.6vw]">
        <Reveal>
          <svg
            viewBox="0 0 614 284"
            role="img"
            aria-label="Error 404"
            fill="none"
            stroke="currentColor"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto block h-auto w-[62vw] max-w-[440px] text-white lg:w-[25.4vw] lg:max-w-none"
          >
            {/* 4 */}
            <path d="M12 12V111A30 30 0 0 0 42 141H143M143 12V272" />
            {/* 0 */}
            <rect x="240" y="12" width="134" height="260" rx="67" />
            {/* 4 */}
            <path d="M470 12V111A30 30 0 0 0 500 141H601M601 12V272" />
          </svg>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="m-0 mt-8 text-[clamp(32px,3.58vw,92px)] font-normal leading-[1.2] tracking-[-0.03em] text-white lg:mt-[4.3vw]">
            Oops! Page Not Found
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="m-0 mx-auto mt-4 text-[clamp(15px,0.83vw,22px)] leading-[2] text-white lg:mt-[1.9vw] lg:max-w-[37vw]">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved. Head back to the main site and we&apos;ll get you where you
            need to go.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <Link
            to="/"
            className="group/roll mt-8 inline-flex h-[clamp(52px,3.9vw,98px)] items-center whitespace-nowrap rounded-full bg-lime-vc px-[clamp(24px,1.43vw,40px)] text-[clamp(18px,1.3vw,32px)] text-ink-vc shadow-lg transition hover:brightness-105 lg:mt-[2.7vw]"
          >
            <RollText>Back to home page</RollText>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
