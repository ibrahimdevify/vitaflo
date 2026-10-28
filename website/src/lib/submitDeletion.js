// Sends the account deletion request to its OWN Google Apps Script web app
// (DeletionCode.gs), separate from the contact form script.
// URL comes from .env:  VITE_DELETION_FORM_URL=https://script.google.com/macros/s/XXXX/exec
// (restart `npm run dev` after changing .env - Vite only reads it at startup)
const DELETION_URL = import.meta.env.VITE_DELETION_FORM_URL;

export const deletionConfigured = Boolean(DELETION_URL);

if (!deletionConfigured) {
  console.warn(
    "[deletion] VITE_DELETION_FORM_URL is empty - deletion requests are NOT connected. " +
      "Put it in the .env file next to package.json and restart `npm run dev`.",
  );
}

export async function submitDeletion(fields) {
  if (!DELETION_URL) throw new Error("not-configured");

  let res;
  try {
    res = await fetch(DELETION_URL, {
      method: "POST",
      body: new URLSearchParams({
        page: window.location.href,
        ...fields,
      }),
    });
  } catch (err) {
    console.error(
      "[deletion] Request blocked. Deployment access must be 'Anyone' and the URL must end with /exec.",
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
      "[deletion] The script did not return JSON. Usually: old deployment version, or the script crashed. Response was:",
      text.slice(0, 300),
    );
    throw new Error("bad-response");
  }

  if (!data.ok) {
    console.error("[deletion] Script replied with an error:", data.error);
    throw new Error(data.error || "failed");
  }
  return data;
}
