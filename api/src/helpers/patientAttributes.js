"use strict";

/**
 * vf_attributes is the only source for current patient demographics.
 * dc_patient_details.height/weight remain a transactional legacy mirror.
 * Physical measurement units must be agreed at the API boundary (cm, kg).
 */
const DEMOGRAPHIC_FIELDS = new Set([
  'first_name', 'last_name', 'phone', 'dob', 'height', 'weight',
  'gender', 'ethnic_group', 'lookup_table', 'identify', 'smoking',
  'chart_number', 'account_type', 'welcome_method', 'mobile_app_save', 'extra',
]);

function parseMeasurement(value, field) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    const error = new Error(`${field} must be a non-negative finite number`);
    error.status = 400;
    throw error;
  }
  return number;
}

function safeAttributeData(raw = {}) {
  const result = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!DEMOGRAPHIC_FIELDS.has(key) || value === undefined) continue;
    if (key === 'height' || key === 'weight') {
      const parsed = parseMeasurement(value, key);
      result[key] = key === 'height' && parsed === null ? 0 : parsed;
    } else if (key === 'dob') {
      result.dob = value == null ? '' : String(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * ALWAYS call inside the caller's prisma.$transaction callback.
 * `patient` must hold a valid dc_patient_details.pd_id.
 * For updates, unspecified fields are untouched in both tables.
 */
async function upsertAttributesAndMirror(tx, patient, rawData, defaults = {}) {
  if (!patient?.pd_id) throw new Error('Patient detail record is required');
  const data = safeAttributeData(rawData);
  const createData = safeAttributeData(defaults);
  const attributes = await tx.vf_attributes.upsert({
    where: { pd_id: patient.pd_id },
    update: data,
    create: {
      first_name: '', last_name: '', dob: '', height: 0,
      ...createData,
      ...data,
      pd_id: patient.pd_id,
    },
  });
  const legacy = {};
  if (Object.hasOwn(data, 'height')) {
    legacy.height = rawData.height === null || rawData.height === '' ? null : data.height;
  }
  if (Object.hasOwn(data, 'weight')) legacy.weight = data.weight;
  if (Object.keys(legacy).length) {
    await tx.dc_patient_details.update({
      where: { pd_id: patient.pd_id }, data: legacy,
    });
  }
  return attributes;
}

function canonicalPatientDetails(details) {
  if (!details) return details;
  const attributes = details.attributes;
  return {
    ...details,
    height: attributes?.height > 0 ? attributes.height : null,
    weight: attributes?.weight ?? null,
  };
}

module.exports = {
  parseMeasurement, safeAttributeData, upsertAttributesAndMirror,
  canonicalPatientDetails,
};
