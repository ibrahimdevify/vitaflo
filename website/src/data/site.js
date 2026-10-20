export const SITE = {
  name: "VitalFlo",
  // "Join Now" button in the navbar
  portalUrl: "https://portal.vitalflohealth.com/login",
  address: "310 S. Harrington St., Floor 4 Raleigh, NC 27603 United States",
  email: "hello@vitalflohealth.com",
  // email2: "privacy@vitalflohealth.com",
  socials: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/vitalflohealth/home/",
    },
    {
      label: "Twitter",
      href: "https://x.com/vitalflohealth",
    },
  ],
};

// Navbar "Solutions" dropdown + footer (same as vitalflohealth.com).
// VitalFloDPC opens the RapidPFT page, exactly like the original site.
export const SOLUTIONS = [
  { label: "VitalFloPRACTICE", to: "/vitalflopractice" },
  { label: "VitalFloHOME", to: "/vitalflohome" },
  { label: "VitalFloDPC", to: "/rapidpft" },
  { label: "VitalFloTRIALS", to: "/research-and-clinical-trials" },
];

// Navbar "Care Settings" dropdown + footer. Some items share one page on the
// original site too: "DPC & Concierge" = Physician & Group Practices, and
// "Clinical Trials & Research" = VitalFloTRIALS.
export const CARE_SETTINGS = [
  { label: "Hospital & Health Systems", to: "/hospital-health-systems" },
  { label: "ACOs & Value Based Care", to: "/acos-ma-plans" },
  { label: "Physician & Group Practices", to: "/healthcare-providers" },
  { label: "DPC & Concierge", to: "/healthcare-providers" },
  { label: "Clinical Trials & Research", to: "/research-and-clinical-trials" },
];
