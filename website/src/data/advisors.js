// Photos: put them in src/assets/about/ named exactly like the "photo" value
// below (png / jpg / jpeg / webp). A missing photo shows the initials instead.
const images = import.meta.glob("../assets/about/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

export const aboutImage = (name) =>
  Object.entries(images).find(
    ([path]) =>
      path
        .split("/")
        .pop()
        .replace(/\.[^.]+$/, "") === name,
  )?.[1] ?? null;

export const ADVISORS = [
  {
    name: "Carl Mottram, RRT, RPFT, FAARC",
    photo: "carl-mottram",
    lines: [
      "Professor Emeritus, Mayo Clinic",
      "President, Clinical & Laboratory Standards Institute",
      "Author, Manual of Pulmonary Function Testing",
    ],
  },
  {
    name: "Dr. Wes Sublett, MPH, FACAAI",
    photo: "wes-sublett",
    lines: [
      "Med Dir, Family Allergy & Asthma Research Institute",
      "American Acad. of Allergy, Asthma & Immunology",
      "American Academy of Pediatrics",
    ],
  },
  {
    name: "Dr. Todd Rowland, FAAPMR",
    photo: "todd-rowland",
    lines: [
      "Chief Medical Officer & Clinical Advisory Chair, VitalFlo",
      "Chairperson, Telehealth Innovation Group, AAPM&R",
      "CMIO, HealthLINC",
    ],
  },
  {
    name: "Dr. Michelle Hernandez, FAAAAI",
    photo: "michelle-hernandez",
    lines: [
      "Director, UNC Children's Research Institute, Clinical Research Unit",
      "Chief Medical Officer, UNC Center Environ Med, Asthma, Lung",
      "Associate Professor, UNC School of Medicine",
    ],
  },
  {
    name: "Dr. David Peden, FAAAAI",
    photo: "david-peden",
    lines: [
      "Sr. Assoc. Dean, UNC School of Medicine Translational Research",
      "Chief of Allergy & Immunology, UNC School of Medicine",
      "Director, UNC Center Environ Med, Asthma, Lung Biology",
    ],
  },
];
