import { IMAGES as HOME_IMAGES } from "./vitalflohome.js";

// Copy for the Hospitals & Health Systems page
// (vitalflohealth.com/hospital-health-systems).
//
// IMAGES (anywhere inside src/, found by file name - the name must contain "hospital"):
//   hospital-hero.png     round hero photo. Optional: if missing, the
//                         VitalFloHOME hero photo (same picture) is used.
//   hospital-care.png     doctor + patient illustration
//   hospital-quality.png  computer with growth chart illustration
//   hospital-roi.png      handshake illustration
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

// Shared with the ACOs & MA Plans page (same three illustrations).
export const HOSPITAL_IMAGES = {
  care: byName("hospital", "care"),
  quality: byName("hospital", "quality"),
  roi: byName("hospital", "roi"),
};

export const HOSPITALS_HERO = {
  eyebrow: "Hospitals & Health Systems",
  title: "Improve outcomes for your respiratory patients",
  text: "VitalFlo offers one comprehensive respiratory platform everywhere you need it. With solutions for in-office care, hospital-at-home programs, and remote patient monitoring, we make it easy to proactively manage your COPD and asthma patients.",
  image: byName("hospital", "hero") ?? HOME_IMAGES.hero,
  imageAlt: "Patient using a handheld spirometer with the VitalFlo app on a phone",
  imageLabel: "hospital-hero.png",
};

export const HOSPITALS_INTRO = {
  title: "Proactive respiratory solutions for every setting",
  paragraphs: [
    "Our VitalFloPRACTICE and VitalFloHOME solutions provide wrap-around offerings for your respiratory patients and help drive better outcomes.",
    "With the data your team needs, including spirometry, patient symptoms, medication adherence and more, VitalFlo gives your providers the tools to proactively manage their respiratory patients more reliably and effectively.",
  ],
  cta: "Get your ROI Calculation",
};

export const HOSPITALS_FEATURES = [
  {
    eyebrow: "Care coordination",
    title: "Respiratory care, where and when it's needed",
    text: "Whether you are optimizing spirometry use in primary care, enabling specialist remote reads, or monitoring patients at home, VitalFlo helps providers deliver care in every setting.",
    image: HOSPITAL_IMAGES.care,
    imageName: "hospital-care.png",
    imageAlt: "Doctor discussing lung health with a patient",
  },
  {
    eyebrow: "Improve quality metrics",
    title: "Improve COPD and asthma outcomes",
    text: "With proactive monitoring, VitalFlo helps track patient lung function, medication adherence and symptoms, and even helps you achieve spirometry HEDIS measures.",
    image: HOSPITAL_IMAGES.quality,
    imageName: "hospital-quality.png",
    imageAlt: "Computer showing a growth chart",
  },
  {
    eyebrow: "Return on investment",
    title: "Partnered with you to drive a return",
    text: "With a focus on building an impactful ROI, VitalFlo is your partner in respiratory programs that drive improvements in revenue and clinical efficiency.",
    image: HOSPITAL_IMAGES.roi,
    imageName: "hospital-roi.png",
    imageAlt: "Healthcare worker shaking hands with a business partner",
  },
];

export const HOSPITALS_CTA = {
  title: "Let's Talk Hospital & Health Systems",
  subtitle: "We are here to help your providers breathe easy.",
  button: "Get your ROI Calculation",
};
