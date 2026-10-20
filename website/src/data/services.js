import {
  Stethoscope,
  House,
  HeartPulse,
  FlaskConical,
  Building2,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";

// Built from vitalflohealth.com (solutions + care-settings pages).
// No `image` on purpose: each card draws its own `art` illustration
// (components/services/ServiceArt.jsx). Add `image: "/services/<file>.png"`
// to any card once you have a real photo - the photo then replaces the art.
export const SERVICES = [
  {
    title: "VitalFloPRACTICE",
    art: "practice",
    tagline: "In-office spirometry, made easy.",
    description:
      "Fast, accurate spirometry for primary care, allergy & ENT and pulmonology, with built-in coaching, automated ATS/ERS grading and detailed reporting.",
    Icon: Stethoscope,
  },
  {
    title: "VitalFloHOME",
    art: "home",
    tagline: "Remote monitoring for COPD and asthma.",
    description:
      "Remote spirometry with symptom and medication tracking, plus customizable alerts, so care teams can step in before problems grow.",
    Icon: House,
  },
  {
    title: "VitalFloDPC",
    art: "dpc",
    tagline: "Built for small practices.",
    description:
      "A flexible respiratory platform for direct primary care, working for in-office visits and home visits alike.",
    Icon: HeartPulse,
  },
  {
    title: "VitalFloTRIALS",
    art: "trials",
    tagline: "Respiratory research, simplified.",
    description:
      "Customizable data capture for spirometry, surveys, adherence and environmental endpoints in clinical trials and research.",
    Icon: FlaskConical,
  },
  {
    title: "Health Systems",
    art: "systems",
    tagline: "Care across every setting.",
    description:
      "In-office care, hospital-at-home programs and remote monitoring in one platform to manage COPD and asthma patients proactively.",
    Icon: Building2,
  },
  {
    title: "Value-Based Care",
    art: "value",
    tagline: "Better outcomes you can measure.",
    description:
      "Track lung function, medication adherence and symptoms across your patients, and support spirometry HEDIS measures.",
    Icon: TrendingUp,
  },
  {
    title: "Group Practices",
    art: "group",
    tagline: "Spirometry for every clinic.",
    description:
      "Easy testing that fits into busy schedules, so primary care and specialty practices can test more patients, more often.",
    Icon: Users,
  },
  {
    title: "Decision Support",
    art: "insights",
    tagline: "Insights that drive action.",
    description:
      "Analytics, automated alerts and ATS/ERS-compliant reporting, with trends over time for every patient.",
    Icon: Activity,
  },
];

export const MARQUEE_ITEMS = [
  "Spirometry",
  "Remote Monitoring",
  "COPD",
  "Asthma",
  "Clinical Research",
];
