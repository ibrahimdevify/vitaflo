import Container from "./ui/Container.jsx";
import SectionHeading from "./ui/SectionHeading.jsx";
import DotLabel from "./ui/DotLabel.jsx";
import ContactForm from "./contact/ContactForm.jsx";
import { SITE } from "../data/site.js";

const ROW =
  "border-b border-black/20 py-5 text-[clamp(16px,1.1vw,28px)] leading-[1.5] text-[#0f0f0f] lg:py-[1.9vw]";

export default function Contact() {
  return (
    <section id="contact" className="bg-[#faf8f4]">
      <Container>
        <div className="grid lg:grid-cols-2">
          <div>
            <div className="border-b border-black/20 pb-8 pt-12 lg:pb-[4.7vw] lg:pr-[3.9vw] lg:pt-[4vw]">
              <SectionHeading>Contact</SectionHeading>
            </div>
            <div className="pb-10 pt-8 lg:pb-[5.75vw] lg:pr-[3.9vw] lg:pt-[3vw]">
              <DotLabel>Information</DotLabel>
              <ul className="m-0 mt-2 list-none p-0 lg:mt-[0.6vw]">
                <li className={ROW}>{SITE.address}</li>
                <li className={ROW}>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {SITE.email}
                  </a>
                </li>
                <li className={ROW}>
                  {SITE.socials.map((s, i) => (
                    <span key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-2 hover:underline"
                      >
                        {s.label}
                      </a>
                      {i < SITE.socials.length - 1 && ", "}
                    </span>
                  ))}
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-black/20 lg:border-l lg:border-t-0">
            <div className="border-b border-black/20 pb-8 pt-12 lg:pb-[4.7vw] lg:pl-[3.8vw] lg:pt-[4vw]">
              <SectionHeading>Get in Touch!</SectionHeading>
            </div>
            <div className="pb-12 pt-8 lg:pb-[5.75vw] lg:pl-[3.8vw] lg:pt-[3vw]">
              <DotLabel>Compose the future with us</DotLabel>
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
