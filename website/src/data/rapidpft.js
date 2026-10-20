import {
  Gauge,
  Ambulance,
  House,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

// Copy for the RapidPFT page (from vitalflohealth.com/rapidpft).
//
// The only image is the round hero photo. It is picked up from anywhere in
// src/ by file name: any image whose name contains "rapid"
// (e.g. rapidpft-hero.png).
const files = import.meta.glob("../**/*.{png,jpg,jpeg,webp,svg,avif}", {
  eager: true,
  import: "default",
});
const heroImage = Object.entries(files).find(([path]) =>
  path.split("/").pop().toLowerCase().includes("rapid"),
)?.[1];

export const RAPID_HERO = {
  subtitle: "Full loop PFT in under 3 minutes, anytime, anywhere.",
  image: heroImage,
  imageAlt: "Two people cycling on a wooded path",
  imageLabel: "rapidpft-hero.png",
};

export const RAPID_INTRO = {
  paragraphs: [
    "With RapidPFT by VitalFlo, clinics can perform full loop PFTs in under 3 minutes and bring the test to the patient, in the clinic or at home, with real-time reporting of results.",
  ],
};

export const RAPID_FEATURES = [
  {
    title: "Fast",
    text: "Full loop PFT flow loops in under 3 minutes.",
    Icon: Gauge,
  },
  {
    title: "Portable",
    text: "Perform RapidPFT anytime, anywhere: in-clinic and at home.",
    Icon: Ambulance,
  },
  {
    title: "At-Home Ready",
    text: "Easily enroll patients in VitalFlo remote patient monitoring.",
    Icon: House,
  },
  {
    title: "Dependable",
    text: "ATS compliant and trusted by world-renowned academic researchers.",
    Icon: ShieldCheck,
  },
  {
    title: "Easy",
    text: "Save staff time with quick set-up and onboarding.",
    Icon: ClipboardList,
  },
];
