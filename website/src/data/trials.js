import { IMAGES as HOME_IMAGES } from "./vitalflohome.js";

// Copy + links for the VitalFloTRIALS page (vitalflohealth.com/research-and-clinical-trials).
//
// IMAGES (anywhere inside src/, found by file name):
//   Photos / illustrations - the file name must contain "trial":
//     trials-hero.png       round hero photo (hands + laptop)
//     trials-endpoints.png  spirometer + box + phone illustration
//     trials-data.png       monitor with chart (if missing, the VitalFloHOME
//                           "reliable-data" image is reused - same picture)
//     trials-irb.png        clipboard illustration
//   Logos (white PNGs) - the file name must contain "logo-" plus:
//     logo-unc, logo-nsf, logo-columbia, logo-ut, logo-fau,
//     logo-duke, logo-cdc, logo-stanford
//     (UNC and Duke are optional - they are skipped if the file is missing)
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

// Shared with the Providers page (same illustrations).
export const TRIALS_IMAGES = {
  endpoints: byName("trial", "endpoint"),
  data: byName("trial", "data") ?? HOME_IMAGES.data,
};

export const TRIALS_HERO = {
  eyebrow: "VitalFloTRIALS for clinical research",
  title: "Trusted by the leaders in Respiratory Research",
  text: "VitalFlo offers the most flexible respiratory monitoring tools available to help you design studies with novel protocols.",
  image: byName("trial", "hero"),
  imageAlt: "Researchers working together at a laptop",
  imageLabel: "trials-hero.png",
};

export const TRIALS_INTRO = {
  title: "The most powerful tools for your respiratory protocol",
  paragraphs: [
    "Whether you monitor subjects in person or remotely, VitalFloTRIALS powers your clinical research with accurate, reliable devices and data.",
  ],
  cta: "Let's Talk",
};

export const TRIALS_FEATURES = [
  {
    eyebrow: "Capture every endpoint",
    title: "Comprehensive Respiratory Data",
    text: "Customizable tool options, including spirometry, surveys, medication adherence and air quality monitoring, let you capture all the data you need to power your study.",
    image: TRIALS_IMAGES.endpoints,
    imageName: "trials-endpoints.png",
    imageAlt: "Spirometer, sensor box and phone running the VitalFlo app",
  },
  {
    eyebrow: "Data management & analysis",
    title: "Accurate and Reliable Data",
    text: "VitalFloTRIALS gives you the tools you need, from powerful dashboards to raw data exports, so your scientific analysis captures everything you intended.",
    image: TRIALS_IMAGES.data,
    imageName: "trials-data.png",
    imageAlt: "Monitor showing a lung function chart",
  },
  {
    eyebrow: "Trusted partners",
    title: "IRB and Security Review Ready",
    text: "Our data management platform is secure and robust, with a streamlined process for working efficiently with your IRB and compliance teams.",
    image: byName("trial", "irb"),
    imageName: "trials-irb.png",
    imageAlt: "Clipboard with a compliance checklist",
  },
];

export const TRIALS_LOGOS_TITLE = "World-Renowned Researchers Work with VitalFlo";

export const TRIALS_LOGOS = [
  { name: "UNC School of Medicine", src: byName("logo-", "unc") },
  { name: "NSF America's Seed Fund", src: byName("logo-", "nsf") },
  { name: "Columbia University", src: byName("logo-", "columbia") },
  { name: "UT Austin Dell Medical School", src: byName("logo-", "ut") },
  { name: "Florida Atlantic University", src: byName("logo-", "fau") },
  { name: "Duke Clinical Research Institute", src: byName("logo-", "duke") },
  { name: "CDC", src: byName("logo-", "cdc") },
  { name: "Stanford Medicine", src: byName("logo-", "stanford") },
].filter((l) => l.src);

export const TRIALS_PUBLICATIONS_TITLE = "Select Research and Publications";

export const TRIALS_PUBLICATIONS = [
  {
    title: "Validation of an app-based portable spirometer in adolescents with asthma",
    href: "https://www.tandfonline.com/doi/abs/10.1080/02770903.2019.1702201?journalCode=ijas20",
  },
  {
    title:
      "Evaluating Asthma Exacerbation-induced Changes in Lung Function With a Home-based Spirometer",
    href: "https://clinicaltrials.gov/study/NCT03705325",
  },
  {
    title:
      "Study of Airway Inflammatory Responses to Experimental Rhinovirus Infection",
    href: "https://clinicaltrials.gov/study/NCT03508479",
  },
  {
    title:
      "A Trial Assessing the Safety and Feasibility of Respiratory Muscle Training and Exercise Training in Children and Adolescents With Persistent Asthma (DHBS2)",
    href: "https://clinicaltrials.gov/study/NCT03911206",
  },
  {
    title: "Durham Healthy Breathing in Healthy Homes Project (DHBHH)",
    href: "https://clinicaltrials.gov/study/NCT04119271",
  },
];
