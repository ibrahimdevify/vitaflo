import LegalPage from "../components/legal/LegalPage.jsx";
import Footer from "../components/Footer.jsx";
import privacy from "../data/privacy.txt?raw";

export default function Privacy() {
  return (
    <>
      <LegalPage
        company="VitalFlo, Inc."
        title="Privacy Policy"
        updated="Last Modified: May 3rd, 2021"
        text={privacy}
      />
      <Footer />
    </>
  );
}
