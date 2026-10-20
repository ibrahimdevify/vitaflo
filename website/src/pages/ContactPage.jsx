import PageHero from "../components/PageHero.jsx";
import Container from "../components/ui/Container.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Faq from "../components/Faq.jsx";
import Contact from "../components/Contact.jsx";
import Footer from "../components/Footer.jsx";

// /contact  ->  hero with centered intro, FAQ, then the info + form section.
export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact" tagline="Join VitalFlo Healthcare">
        <Container className="relative z-10 pb-12 pt-8 lg:pb-[3.5vw] lg:pt-[3.8vw]">
          <Reveal>
            <p className="m-0 mx-auto text-center text-[clamp(17px,1.2vw,30px)] leading-[1.5] text-white lg:max-w-[36.5vw]">
              Whether you have questions about our services, need help booking
              an appointment, or want to speak with a healthcare professional,
              our team is ready to assist you. Reach out anytime we&apos;d love
              to hear from you.
            </p>
          </Reveal>
        </Container>
      </PageHero>

      {/* Faq has no top padding of its own (it normally follows another section) */}
      <div className="bg-[#faf8f4] pt-16 lg:pt-[7.8vw]">
        <Faq />
      </div>

      <Contact />
      <Footer />
    </>
  );
}
