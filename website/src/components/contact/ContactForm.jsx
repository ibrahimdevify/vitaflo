import React, { useState } from "react";

// Sends a form to the Google Apps Script web app (see Code.gs).
// URL comes from .env:  VITE_FORM_URL=https://script.google.com/macros/s/XXXX/exec
// (restart `npm run dev` after changing .env - Vite only reads it at startup)
const FORM_URL = import.meta.env.VITE_FORM_URL;

export const formsConfigured = Boolean(FORM_URL);

if (!formsConfigured) {
  console.warn(
    "[forms] VITE_FORM_URL is empty - forms are NOT connected. " +
      "Put it in the .env file next to package.json and restart `npm run dev`.",
  );
}

export async function submitForm(type, fields) {
  if (!FORM_URL) throw new Error("not-configured");

  let res;
  try {
    res = await fetch(FORM_URL, {
      method: "POST",
      body: new URLSearchParams({
        type,
        page: window.location.href,
        ...fields,
      }),
    });
  } catch (err) {
    console.error(
      "[forms] Request blocked. Deployment access must be 'Anyone' and the URL must end with /exec.",
      err,
    );
    throw new Error("network");
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(
      "[forms] The script did not return JSON. Usually: old deployment version, or the script crashed. Response was:",
      text.slice(0, 300),
    );
    throw new Error("bad-response");
  }

  if (!data.ok) {
    console.error("[forms] Script replied with an error:", data.error);
    throw new Error(data.error || "failed");
  }
  return data;
}

// ─────────────────────────────────────────────────────────────
// UI COMPONENT (Framer Style Design)
// ─────────────────────────────────────────────────────────────
export default function ContactForm() {
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      await submitForm("contact", data);
      setStatus("success");
      e.target.reset();
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Input Fields */}
        <div className="flex flex-col gap-6">
          <div className="relative">
            <label htmlFor="name" className="block text-gray-500 text-sm mb-2">
              Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Compose the future with us"
              required
              className="w-full bg-transparent border-b border-gray-300 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-800 transition-colors"
            />
          </div>

          <div className="relative">
            <label htmlFor="email" className="block text-gray-500 text-sm mb-2">
              Email*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              className="w-full bg-transparent border-b border-gray-300 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-800 transition-colors"
            />
          </div>

          <div className="relative">
            <label
              htmlFor="message"
              className="block text-gray-500 text-sm mb-2"
            >
              Comment
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="How can we help you?"
              required
              rows="1"
              className="w-full bg-transparent border-b border-gray-300 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-800 transition-colors resize-none"
            ></textarea>
          </div>
        </div>

        {/* Honeypot field */}
        <input
          type="text"
          name="website"
          className="hidden"
          tabIndex="-1"
          autoComplete="off"
        />

        {/* Terms Text */}
        <div className="flex items-start gap-3 mt-2">
          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black shrink-0"></div>
          <p className="text-sm text-gray-800">
            By submitting this form, you agree to our{" "}
            <a href="/terms" className="underline hover:text-black">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-black">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-[#3B5A7D] hover:bg-[#2d4765] text-white font-medium py-4 px-6 rounded-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {status === "loading" ? "Sending..." : "Contact Us"}
        </button>

        {/* Status Messages */}
        {status === "success" && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">
            Message sent successfully! We'll get back to you soon.
          </div>
        )}

        {status === "error" && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            Something went wrong. Please try again. (Check VITE_FORM_URL in
            .env)
          </div>
        )}
      </form>
    </div>
  );
}
