import { aboutImage } from "./advisors.js";

// Real people from vitalflohealth.com/about (the Clinical Advisory Board) -
// the original site has no other staff list. Photos are the same files the
// About page's Advisory Board uses: src/assets/about/<name>.(png|jpg|jpeg|webp).
// No photo = initials. `linkedin` is optional (no button when it is missing).
export const TEAM = [
  {
    name: "Dr. Todd Rowland, FAAPMR",
    role: "Chief Medical Officer & Clinical Advisory Chair",
    image: aboutImage("todd-rowland"),
    linkedin: "https://www.linkedin.com/in/toddrowlandmd/",
  },
  {
    name: "Carl Mottram, RRT, RPFT, FAARC",
    role: "Professor Emeritus, Mayo Clinic",
    image: aboutImage("carl-mottram"),
  },
  {
    name: "Dr. Wes Sublett, MPH, FACAAI",
    role: "Medical Director, Family Allergy & Asthma Research Institute",
    image: aboutImage("wes-sublett"),
  },
  {
    name: "Dr. Michelle Hernandez, FAAAAI",
    role: "Associate Professor, UNC School of Medicine",
    image: aboutImage("michelle-hernandez"),
  },
  {
    name: "Dr. David Peden, FAAAAI",
    role: "Chief of Allergy & Immunology, UNC School of Medicine",
    image: aboutImage("david-peden"),
  },
];
