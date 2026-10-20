import PageHero from "../components/PageHero.jsx";
import Container from "../components/ui/Container.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import DemoForm from "../components/demo/DemoForm.jsx";
import DemoVisual from "../components/demo/DemoVisual.jsx";
import Footer from "../components/Footer.jsx";

// /demo  ->  hero, then the booking form (left) and a round photo (right).
export default function Demo() {
  return (
    <>
      <PageHero title="Demo" tagline="See VitalFlo in action">
        <Container className="relative z-10 pb-12 pt-8 lg:pb-[3.5vw] lg:pt-[3.8vw]">
          <Reveal>
            <p className="m-0 mx-auto text-center text-[clamp(17px,1.2vw,30px)] leading-[1.5] text-white lg:max-w-[36.5vw]">
              Tell us a little about yourself and we will get back to you as
              soon as possible!
            </p>
          </Reveal>
        </Container>
      </PageHero>

      <section className="overflow-x-clip bg-[#faf8f4] py-16 lg:pb-[7.8vw] lg:pt-[7.8vw]">
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-[40vw_1fr] lg:gap-[3vw]">
            <Reveal y={50}>
              <DemoForm />
            </Reveal>
            <Reveal delay={0.1}>
              <DemoVisual />
            </Reveal>
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
}
