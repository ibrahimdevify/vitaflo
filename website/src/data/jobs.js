export const JOBS = [
  {
    title: "Clinical Success Manager",
    type: "Full-Time • Remote",
    items: [
      "Onboard practices and health systems onto VitalFloPRACTICE",
      "Train clinicians on spirometry workflows",
      "Track adoption and patient outcomes",
    ],
  },
  {
    title: "Respiratory Therapist (RRT)",
    type: "Full-Time • Hybrid",
    items: [
      "Support ATS/ERS-compliant spirometry quality",
      "Review remote monitoring alerts and reports",
      "Advise product team on clinical workflows",
    ],
  },
  {
    title: "Full-Stack Engineer",
    type: "Full-Time • Remote",
    items: [
      "Build web and mobile spirometry workflows",
      "Work on analytics and automated alerts",
      "Maintain HIPAA-compliant infrastructure",
    ],
  },
  {
    title: "Data Analyst, Clinical Insights",
    type: "Full-Time • Remote",
    items: [
      "Analyse lung function and symptom trends",
      "Build dashboards for ACOs and value-based care",
      "Support research and clinical trial reporting",
    ],
  },
  {
    title: "Customer Support Specialist",
    type: "Full-Time • Remote",
    items: [
      "Answer practice and patient support requests",
      "Troubleshoot devices and the VitalFloHOME app",
      "Maintain Help Center articles",
    ],
  },
  {
    title: "Account Executive, Health Systems",
    type: "Full-Time • Hybrid",
    items: [
      "Sell to hospitals, ACOs and group practices",
      "Run product demos for clinical teams",
      "Manage long-cycle healthcare sales",
    ],
  },
];

// Career page only: 8 positions in the order shown on the page.
const EXTRA_JOBS = [
  {
    title: "Product Designer",
    type: "Full-Time • Remote",
    items: [
      "Design clinician and patient-facing workflows",
      "Prototype and test with care teams",
      "Maintain the VitalFlo design system",
    ],
  },
  {
    title: "Quality & Compliance Specialist",
    type: "Full-Time • Hybrid",
    items: [
      "Support HIPAA and clinical quality processes",
      "Keep reporting aligned with ATS/ERS standards",
      "Coordinate audits and documentation",
    ],
  },
];

const CAREER_ORDER = [
  "Clinical Success Manager",
  "Respiratory Therapist (RRT)",
  "Full-Stack Engineer",
  "Data Analyst, Clinical Insights",
  "Customer Support Specialist",
  "Account Executive, Health Systems",
  "Product Designer",
  "Quality & Compliance Specialist",
];

export const CAREER_JOBS = CAREER_ORDER.map((t) =>
  [...JOBS, ...EXTRA_JOBS].find((j) => j.title === t),
);
