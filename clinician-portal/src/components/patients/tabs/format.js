export const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// [ADDED] This was missing — imports doing `{ formatNumber }` from this
// file were crashing at the module level ("does not provide an export
// named 'formatNumber'"), which is what was taking down PatientDetail.
//
// Adjust the options below if you need a specific format (e.g. no
// decimals, a unit suffix, etc.) — this is a reasonable generic default.
export const formatNumber = (value, options = {}) => {
  if (value === null || value === undefined || value === "") return "";

  const num = Number(value);
  if (Number.isNaN(num)) return "";

  return num.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    ...options,
  });
};

// [ADDED] Missing export — same crash pattern as formatNumber above,
// this time for "does not provide an export named 'formatDateTime'".
// Generic date + time format; adjust options if a different look
// (24-hour clock, no seconds, etc.) is needed.
export const formatDateTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default formatDate;