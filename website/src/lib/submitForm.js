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

// type: "contact" | "newsletter"
// fields: { name?, email, message?, website? (honeypot), page? }
export async function submitForm(type, fields) {
  if (!FORM_URL) throw new Error("not-configured");

  // x-www-form-urlencoded is a "simple" request, so the browser does not send
  // a CORS preflight (Apps Script cannot answer one).
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
