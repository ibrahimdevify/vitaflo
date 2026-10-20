// Copy for the VitalFloHOME page (from vitalflohealth.com/vitalflohome).
//
// Images are picked up from anywhere inside src/ by file name, so it does not
// matter which folder you put them in. If some are in a folder whose name
// contains "vitalflohome", only that folder is searched. Name them like this
// (any of the words below in the file name works, any of png/jpg/webp/svg):
//   hero            -> hero.png
//   easy / phone    -> easy-to-use.png
//   data / reliable -> reliable-data.png
//   outcome / better-> better-outcomes.png
const files = import.meta.glob("../**/*.{png,jpg,jpeg,webp,svg,avif}", {
  eager: true,
  import: "default",
});
const entries = Object.entries(files)
  .map(([path, url]) => ({ path: path.toLowerCase(), url }))
  .filter((e) => !/rapid|trial|hospital|acos|provider/.test(e.path)); // other pages have their own images
const own = entries.filter((e) => e.path.includes("vitalflohome"));
const pool = own.length ? own : entries;
const find = (...keys) =>
  pool.find((e) => keys.some((k) => e.path.split("/").pop().includes(k)))?.url;

export const IMAGES = {
  hero: find("hero"),
  easy: find("easy", "phone"),
  data: find("reliable", "data", "chart", "monitor"),
  outcomes: find("outcome", "better"),
};

export const HOME_HERO = {
  eyebrow: "VitalFloHOME for remote monitoring",
  title: "Manage your respiratory patients at home",
  text: "Pulse oximetry alone is not enough to proactively manage COPD and asthma patients at home. VitalFloHOME combines remote spirometry with symptom and medication tracking for a complete remote respiratory solution.",
  image: IMAGES.hero,
  imageAlt: "Patient using a handheld spirometer with the VitalFlo app on a phone",
};

export const HOME_INTRO = {
  title: "The most comprehensive solution for remote respiratory monitoring",
  paragraphs: [
    "VitalFloHOME makes home-based spirometry easy and intuitive for patients, while giving providers reliable, comprehensive data.",
    "With spirometry, patient symptoms, medication adherence and more, provider teams can proactively manage COPD, asthma and lung transplant patients more reliably and effectively.",
  ],
  cta: "Let's Talk",
};

export const HOME_FEATURES = [
  {
    eyebrow: "Easy to use",
    title: "Intuitive coaching and feedback",
    text: "Screen-by-screen guides give patients multi-language support on using their devices correctly and consistently. Customizable automated alerts deliver care team instructions exactly when patients need them.",
    image: IMAGES.easy,
    imageName: "easy-to-use.png",
    imageAlt: "VitalFlo patient app on a phone",
  },
  {
    eyebrow: "Comprehensive management",
    title: "Reliable, actionable data",
    text: "Customizable workflows and reporting make proactive respiratory management easy for your provider team, with the data and tools they need to work proactively with their patients.",
    image: IMAGES.data,
    imageName: "reliable-data.png",
    imageAlt: "Provider dashboard showing a lung function trend chart",
  },
  {
    eyebrow: "Better outcomes",
    title: "Proactive, preventative care",
    text: "Get the spirometry, symptom and adherence data your team needs to deliver preventative interventions. Automated, customizable alerts and reporting make cross-functional care coordination easier, keeping COPD, asthma and transplant patients healthy at home.",
    image: IMAGES.outcomes,
    imageName: "better-outcomes.png",
    imageAlt: "Hospital building illustration",
  },
];
