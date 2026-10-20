// Content of the VitalFloPRACTICE page (vitalflohealth.com/vitalflopractice).
// **double asterisks** = bold (rendered by components/practice/Rich.jsx).

export const PRACTICE_HERO = {
  eyebrow: "VitalFloPRACTICE for in-office care",
  headline: "Finally, spirometry that is easy to use.",
  text: "Give your providers the tools they need to do fast, accurate, in-office spirometry. From Primary Care to Allergy & ENT to Pulmonology, **VitalFloPRACTICE** is one platform \u2013 for every workflow.",
  cta: { label: "Let's Talk \u2192", href: "/demo" },
};

export const CARE_SETTINGS = ["Primary care", "Allergy & ENT", "Pulmonology"];

export const PRACTICE_SOLUTION = {
  heading: "The smartest solution for respiratory care",
  text: "**VitalFloPRACTICE** gives providers access to full spirometry, with integrated coaching, feedback and automated ATS-compliant grading. The result?",
  sub: "Spirometry that your physicians (and their teams) will love and actually use.",
  cta: { label: "Let's Talk \u2192", href: "/demo" },
};

// image = file name (no extension) in src/assets/practice/
export const PRACTICE_FEATURES = [
  {
    eyebrow: "Reliability",
    title: "Quality data you can trust",
    text: "With automated training, coaching and ATS/ERS-standard grading, you can see your spirometry test quality \u2013 immediately.",
    image: "reliability",
  },
  {
    eyebrow: "Easy to use",
    title: "Intuitive at every step",
    text: "We have removed roadblocks by simplifying spirometry at every step. Screen-by-screen guides and instructions help every care provider get good testing done fast.",
    image: "easy-to-use",
  },
  {
    eyebrow: "Clinical efficiency",
    title: "Faster testing, more testing",
    text: "Spirometry workflows that are quick and easy means you can always fit testing into even the busiest schedules. **VitalFloPRACTICE** helps all care settings become spirometry testing sites.",
    image: "clinical-efficiency",
  },
];

export const PRACTICE_TESTIMONIALS_INTRO = {
  heading: "\u201cI love my spirometer\u201d",
  text: "When is the last time your clinical team said that?",
  cta: { label: "Get Started \u2192", href: "/demo" },
};

// photo = file name (no extension) in src/assets/practice/ - a 1080x750
// testimonial card (quote, name and photo are part of the picture).
// quote / name / role are used as the picture's alt text, and as the card
// itself if the picture is missing.
export const PRACTICE_TESTIMONIALS = [
  {
    name: "Wendy Gilraine, FNP, RRT",
    role: "Pulmonology",
    quote:
      "I love VitalFlo. I absolutely love it. Previously, to start someone on treatment we had to wait to get diagnostic testing back. With VitalFlo we are able to start therapy right away. We're using it really frequently. I'm very happy.",
    photo: "gilraine",
  },
  {
    name: "Leandra Tonweber, PA-C",
    role: "Allergy & Asthma Provider",
    quote:
      "Having access to a patient's spirometry is very helpful when evaluating their asthma control. The VitalFlo patient portal is user friendly and allows me to see their results right away.",
    photo: "leandra",
  },
  {
    name: "Dr. Patricia Karnes-Amzibel",
    role: "Primary Care Provider",
    quote:
      "I have been having good success with VitalFlo. It is easy to use, fast and gives me information quickly. I have been pleased with the results, the ease of use and the ability to take it to home visits.",
    photo: "karnes-amzibel",
  },
  {
    name: "Dr. Kimberly Chapman",
    role: "Primary Care Provider",
    quote:
      "It is very easy to use and provides an update on how the patient is doing with the current regimen of treatment. It is not expensive, and it fits in a drawer in the office.",
    photo: "chapman",
  },
];

const photos = import.meta.glob("../assets/practice/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

// url of src/assets/practice/<name>.(png|jpg|jpeg|webp), or null if missing
export const practicePhoto = (name) =>
  Object.entries(photos).find(
    ([path]) =>
      path
        .split("/")
        .pop()
        .replace(/\.[^.]+$/, "") === name,
  )?.[1] ?? null;
