import {
  Cloud,
  DollarSign,
  ShieldPlus,
  Monitor,
  TrendingUp,
  BellRing,
} from "lucide-react";
import { IMAGES as HOME_IMAGES } from "./vitalflohome.js";
import { TRIALS_IMAGES } from "./trials.js";

// Copy for the Physician & Group Practices page
// (vitalflohealth.com/healthcare-providers).
//
// IMAGES (anywhere inside src/, found by file name - the name must contain "providers"):
//   providers-hero.png    round hero photo (girl with daisies)
//   providers-step-2.png  doctor illustration (woman with glasses)
// Step 1 and Step 3 use pictures that already exist on other pages, so they
// are reused unless you add your own:
//   providers-step-1.png  (default: the TRIALS "endpoints" illustration)
//   providers-step-3.png  (default: the VitalFloHOME monitor/chart illustration)
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

export const PROVIDERS_HERO = {
  text: "VitalFlo offers pulmonary function testing in the clinic or at home.",
  image: byName("providers", "hero"),
  imageAlt: "Girl smelling daisies in a field",
  imageLabel: "providers-hero.png",
};

export const PROVIDERS_STEPS = {
  title: "How it Works",
  paragraphs: [
    "Whether a patient has asthma, COPD or another condition, their environment, medications, allergies and lifestyle make every situation unique, and make it near impossible for providers to predict when problems may arise.",
    "VitalFlo was purpose-built to detect and forecast the small changes in patient conditions that can lead to big problems down the road. Perfect for remote respiratory care or for enabling telehealth initiatives, VitalFlo data is comprehensive, easy to review, and designed to help you step in when necessary, before it's too late.",
  ],
  steps: [
    {
      label: "Step 1",
      image: byName("providers", "step-1") ?? TRIALS_IMAGES.endpoints,
      imageName: "providers-step-1.png",
      imageAlt: "Smart spirometer, air quality monitor and the VitalFlo app",
      text: "VitalFlo is prescribed to a patient, who is given a take-home smart spirometer, an optional air quality monitor and an intuitive companion app.",
    },
    {
      label: "Step 2",
      image: byName("providers", "step-2"),
      imageName: "providers-step-2.png",
      imageAlt: "Friendly doctor with a stethoscope",
      text: "Friendly reminders and content promote daily use and build credibility, while VitalFlo automatically watches for respiratory health risk factors.",
    },
    {
      label: "Step 3",
      image: byName("providers", "step-3") ?? HOME_IMAGES.data ?? TRIALS_IMAGES.data,
      imageName: "providers-step-3.png",
      imageAlt: "Monitor showing a lung function trend chart",
      text: "VitalFlo's insights determine when a patient's respiratory status has changed, alerting the care team to review and respond.",
    },
  ],
};

export const PROVIDERS_BENEFITS = {
  title: "Benefits for Patients and Providers Alike",
  items: [
    { Icon: Cloud, text: "Remotely detect changes in patient conditions" },
    { Icon: DollarSign, text: "Prevent costly emergencies for patients" },
    {
      Icon: ShieldPlus,
      text: "Offer differentiated care while creating a new revenue stream for your practice",
    },
  ],
  note: "For more detailed information on VitalFlo's benefits and financial model for healthcare providers",
};

export const PROVIDERS_INSIGHTS = {
  title: "Delivering Insights that Drive Value",
  items: [
    {
      Icon: Monitor,
      title: "The spirometry data you count on",
      lines: [
        "FEV1, FVC, and FEF25-75",
        "In-app training, ensuring accurate data collection",
      ],
    },
    {
      Icon: TrendingUp,
      title: "Real health trends, not anecdotes",
      lines: ["Lung function over time", "Medication use", "Daily symptom perception"],
    },
    {
      Icon: BellRing,
      title: "New, game-changing information",
      lines: [
        "Air quality for identifying environmental triggers",
        "Patient status change alerts",
      ],
    },
  ],
};

export const PROVIDERS_CTA_TITLE =
  "Contact Us to learn more about incorporating VitalFlo into your practice";
