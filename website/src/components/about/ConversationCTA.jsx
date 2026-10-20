import { Link } from "react-router-dom";
import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";

export default function ConversationCTA() {
  return (
    <section className="bg-[#faf8f4] pb-20 lg:pb-[9vw]">
      <Container>
        <Reveal className="text-center">
          <p className="m-0 text-[clamp(24px,2.4vw,62px)] leading-[1.2] tracking-[-0.02em] text-[#0f0f0f]">
            Let&apos;s Start a{" "}
            <Link
              to="/contact"
              className="underline decoration-1 underline-offset-[0.18em] transition-colors hover:text-[#2c4d77]"
            >
              Conversation.
            </Link>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
