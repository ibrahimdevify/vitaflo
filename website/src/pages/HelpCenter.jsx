import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HelpHero from "../components/help/HelpHero.jsx";
import AccountDeletionSection from "../components/help/AccountDeletionSection.jsx";
import Container from "../components/ui/Container.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Tag from "../components/ui/Tag.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Accordion from "../components/ui/Accordion.jsx";
import Footer from "../components/Footer.jsx";
import { HELP_EMAILS, HELP_TOPICS } from "../data/helpCenter.js";

const CARDS = [
  {
    title: "Privacy Policy",
    text: "See what we collect, how we use it and the choices and rights you have.",
    cta: "Read the policy",
    to: "/privacy",
  },
  {
    title: "Contact us",
    text: "Have a question that is not answered here? Send our team a message.",
    cta: "Get in touch",
    to: "/contact",
  },
];

// /help-center  (the account deletion form lives at /help-center#account-deletion)
export default function HelpCenter() {
  const { hash, key } = useLocation();

  // Scroll to a #section link (e.g. /help-center#account-deletion), also when
  // coming from the card above or from an old /account-deletion link.
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(t);
  }, [hash, key]);

  return (
    <>
      <HelpHero eyebrow="VitalFlo Healthcare" title="Help Center">
        Answers about your account, your data and your privacy. Can&apos;t find
        what you need? Our team is happy to help.
      </HelpHero>

      {/* Account deletion request (info + form) - first section on the page */}
      <AccountDeletionSection />

      <section className="bg-[#faf8f4] py-12 lg:py-[5vw]">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 lg:gap-[1.6vw]">
            {CARDS.map((c, i) => (
              <Reveal key={c.to} delay={i * 0.08}>
                <Link
                  to={c.to}
                  className="group flex h-full flex-col rounded-[24px] border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg lg:rounded-[1.6vw] lg:p-[2vw]"
                >
                  <h2 className="m-0 text-[clamp(20px,1.5vw,36px)] font-normal leading-tight tracking-[-0.02em] text-[#0f0f0f]">
                    {c.title}
                  </h2>
                  <p className="m-0 mt-3 flex-1 text-[clamp(14px,1vw,22px)] leading-[1.6] text-[#4a4a4a] lg:mt-[0.9vw]">
                    {c.text}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[clamp(14px,1vw,22px)] text-[#2c4d77] lg:mt-[1.8vw]">
                    {c.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#faf8f4] pb-16 lg:pb-[7.8vw]">
        <Container>
          <Reveal className="flex flex-col items-center text-center">
            <Tag>HELP TOPICS</Tag>
            <SectionHeading className="mt-4 lg:mt-[1vw]">
              Common questions
            </SectionHeading>
          </Reveal>

          <div className="mx-auto mt-10 max-w-[820px] lg:mt-[4vw] lg:max-w-[52vw]">
            <Reveal>
              <Accordion items={HELP_TOPICS} defaultOpen={0} />
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-[#faf8f4] py-14 lg:py-[6vw]">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-[820px] rounded-[24px] bg-[#2c4d77] p-8 text-center text-white lg:max-w-[52vw] lg:rounded-[1.6vw] lg:p-[3vw]">
              <h3 className="m-0 text-[clamp(22px,1.8vw,46px)] font-normal leading-tight tracking-[-0.02em]">
                Still need help?
              </h3>
              <p className="m-0 mt-3 text-[clamp(14px,1vw,22px)] leading-[1.7] text-white/85 lg:mt-[1vw]">
                Email us and we will get back to you.
                <br />
                Support:{" "}
                <a
                  href={`mailto:${HELP_EMAILS.support}`}
                  className="underline hover:text-lime-vc"
                >
                  {HELP_EMAILS.support}
                </a>
                <br />
                Privacy requests:{" "}
                <a
                  href={`mailto:${HELP_EMAILS.privacy}`}
                  className="underline hover:text-lime-vc"
                >
                  {HELP_EMAILS.privacy}
                </a>
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <Footer />
    </>
  );
}
