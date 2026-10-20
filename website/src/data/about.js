// Photos: put them in src/assets/about/ named "about-patient" and
// "about-records" (png / jpg / jpeg / webp). A missing photo shows plain blue.
const images = import.meta.glob("../assets/about/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const img = (name) =>
  Object.entries(images).find(
    ([path]) =>
      path
        .split("/")
        .pop()
        .replace(/\.[^.]+$/, "") === name,
  )?.[1] ?? null;

export const ABOUT_PHOTOS = {
  patient: {
    src: img("about-patient"),
    alt: "Nurse giving a child a vaccination in a bright clinic room",
  },
  records: {
    src: img("about-records"),
    alt: "Healthcare worker reviewing patient data on a computer monitor",
  },
};

// Facts from VitalFlo's own announcements (founding, seed round, product line).
export const ABOUT_STATS = {
  founded: {
    value: "2017",
    label: "Founded in Raleigh, NC",
    text: "A digital health company built for proactive respiratory care, helping providers deliver better care from the first breath test onward.",
  },
  funding: {
    value: "$2.14M",
    label: "Seed Round",
    text: "Led by Geekdom Fund to grow the company and meet rising demand for our predictive medicine platform.",
  },
  solutions: {
    value: "4",
    label: "Platform Solutions",
    text: "VitalFloPRACTICE, VitalFloHOME, VitalFloDPC and VitalFloTRIALS bring spirometry, remote monitoring and research tools together in one platform.",
  },
};
