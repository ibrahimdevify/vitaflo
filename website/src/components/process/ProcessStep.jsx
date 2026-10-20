import Photo from "../ui/Photo.jsx";
import BodyText from "../ui/BodyText.jsx";
import Divider from "../ui/Divider.jsx";
import CheckList from "../ui/CheckList.jsx";
import Reveal from "../ui/Reveal.jsx";

export default function ProcessStep({ step, reverse = false }) {
  const { title, description, items, image, alt } = step;

  return (
    <div
      className={`grid items-start gap-8 lg:justify-between lg:gap-[3.8vw] ${
        reverse
          ? "lg:grid-cols-[30.4vw_41.8vw]"
          : "lg:grid-cols-[41.8vw_30.4vw]"
      }`}
    >
      <Reveal className={reverse ? "lg:order-2" : ""}>
        <Photo src={image} alt={alt} className="aspect-[1013/700]" />
      </Reveal>

      <Reveal delay={0.1} className={reverse ? "lg:order-1" : ""}>
        <h3 className="text-[clamp(28px,3.55vw,90px)] font-normal leading-[1.1] tracking-[-0.025em] text-white">
          {title}
        </h3>
        <BodyText tone="light" className="mt-4 lg:mt-[1.9vw]">
          {description}
        </BodyText>
        <Divider className="my-6 lg:my-[2.3vw]" />
        <h4 className="text-[clamp(17px,1.15vw,28px)] font-normal text-white">
          What&apos;s Included
        </h4>
        <CheckList items={items} className="mt-4 lg:mt-[2.4vw]" />
      </Reveal>
    </div>
  );
}
