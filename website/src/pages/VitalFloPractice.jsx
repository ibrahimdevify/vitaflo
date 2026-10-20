import PracticeHero from "../components/practice/PracticeHero.jsx";
import PracticeSolution from "../components/practice/PracticeSolution.jsx";
import PracticeFeatures from "../components/practice/PracticeFeatures.jsx";
import PracticeTestimonials from "../components/practice/PracticeTestimonials.jsx";
import ClosingBanner from "../components/ClosingBanner.jsx";
import Contact from "../components/Contact.jsx";
import Footer from "../components/Footer.jsx";

export default function VitalFloPractice() {
  return (
    <>
      <PracticeHero />
      <PracticeSolution />
      <PracticeFeatures />
      <PracticeTestimonials />
      <ClosingBanner />
      <Contact />
      <Footer />
    </>
  );
}
