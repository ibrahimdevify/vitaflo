import { HOSPITAL_IMAGES } from "./hospitals.js";

// Copy for the ACOs & MA Plans page (vitalflohealth.com/acos-ma-plans).
//
// IMAGES (anywhere inside src/, found by file name):
//   acos-hero.png   round hero photo (woman using a spirometer on a sofa)
// The three illustrations are the SAME pictures as on the Hospitals page, so
// they are reused from there (hospital-care / hospital-quality / hospital-roi).
// To use different ones here, add acos-care.png, acos-quality.png, acos-roi.png.
const files = import.meta.glob("../**/*.{png,jpg,jpeg,webp,svg,avif}", {
  eager: true,
  import: "default",
});
const entries = Object.entries(files).map(([path, url]) => ({
  name: path.split("/").pop().toLowerCase(),
  url,
}));
const byName = (...keys) =>
  entries.find((e) => keys.every((k) => e.name.includes(k)))?.url;

export const ACOS_HERO = {
  eyebrow: "Accountable Care Organizations & Medicare Advantage Plans",
  title: "Improve outcomes for your respiratory patients",
  text: "VitalFlo offers one comprehensive respiratory platform everywhere you need it. From primary care to home monitoring, we make it easy to proactively manage your COPD and asthma patients.",
  image: byName("acos", "hero"),
  imageAlt: "Woman using a handheld spirometer at home",
  imageLabel: "acos-hero.png",
};

export const ACOS_INTRO = {
  title: "A respiratory solution focused on your quality targets",
  paragraphs: [
    "Our VitalFloPRACTICE and VitalFloHOME solutions provide wrap-around offerings for your COPD and asthma patients, driving better outcomes in every care setting.",
    "With the data you need, including spirometry, patient symptoms, medication adherence and more, VitalFlo gives your providers the tools to proactively manage their respiratory patients more reliably and effectively.",
  ],
  cta: "Get your ROI Calculation",
};

export const ACOS_FEATURES = [
  {
    eyebrow: "Care coordination",
    title: "Respiratory care, where and when it's needed",
    text: "Whether you are optimizing spirometry use in primary care, enabling specialist remote reads, or monitoring patients at home, VitalFlo helps providers deliver care in every setting.",
    image: byName("acos", "care") ?? HOSPITAL_IMAGES.care,
    imageName: "hospital-care.png",
    imageAlt: "Doctor discussing lung health with a patient",
  },
  {
    eyebrow: "Drive more savings",
    title: "Improve COPD and asthma outcomes",
    text: "With proactive monitoring, VitalFlo helps track patient lung function, medication adherence and symptoms, reducing ED and hospital utilization and driving savings.",
    image: byName("acos", "quality") ?? HOSPITAL_IMAGES.quality,
    imageName: "hospital-quality.png",
    imageAlt: "Computer showing a growth chart",
  },
  {
    eyebrow: "Return on investment",
    title: "Partnered with you to drive a return",
    text: "With a focus on managing an impactful ROI, VitalFlo is your partner for bringing the value to value-based care.",
    image: byName("acos", "roi") ?? HOSPITAL_IMAGES.roi,
    imageName: "hospital-roi.png",
    imageAlt: "Healthcare worker shaking hands with a business partner",
  },
];

export const ACOS_CTA = {
  title: "Let's Talk ACOs & MA Plans",
  subtitle: "We are here to help bring the value to value-based care.",
  button: "Get your ROI Calculation",
};
