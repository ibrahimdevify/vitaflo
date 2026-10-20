import LegalPage from "../components/legal/LegalPage.jsx";
import Footer from "../components/Footer.jsx";
import terms from "../data/terms.txt?raw";

export default function Terms() {
  return (
    <>
      <LegalPage
        company="VitalFlo, Inc."
        title="Terms of Use"
        updated="Last Updated: May 3rd, 2021"
        text={terms}
      />
      <Footer />
    </>
  );
}
