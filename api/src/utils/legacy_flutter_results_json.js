'use strict';

// Backend-only compatibility fix for older Flutter clients with strict double
// JSON parsing. Prisma's Float/@db.Double cannot force JSON.stringify to
// preserve 2.0: JSON.stringify({v: 2.0}) produces {"v":2}.
//
// Usage in your EXISTING getResults controller (keep all query/date/pagination
// logic untouched):
//   const { sendLegacyFlutterResults } = require('../utils/legacy_flutter_results_json');
//   const response = { spirometries, best_spirometries, lung_ages, pagination };
//   return sendLegacyFlutterResults(res, response);
//
// Replace ONLY the final `return res.json(response)` with the function call.
// Existing response keys/values, IDs, pagination, nullable fields and ordering
// are preserved. Only whole-number measurement JSON tokens acquire `.0`.

const { randomUUID } = require('node:crypto');

const METRICS = Object.freeze([
  'fev1', 'fvc', 'fev1fvc', 'fef2575', 'fev6', 'pefr', 'fet',
]);
const MEASUREMENT_FIELDS = new Set([
  'observed', 'value', 'lln', 'zscore', 'flow', 'volume', 'time',
]);

function serializeLegacyFlutterResults(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('Expected Results API response object');
  }

  // Identify ONLY the objects that hold decimal measurements.
  // Do not touch numeric identifiers, grades, pagination, statuses, etc.
  const measurementParents = new WeakSet();
  const markMetric = (metric) => {
    if (!metric || typeof metric !== 'object' || Array.isArray(metric)) return;
    measurementParents.add(metric);
    if (metric.predicted && typeof metric.predicted === 'object') {
      for (const lookupValues of Object.values(metric.predicted)) {
        if (lookupValues && typeof lookupValues === 'object' &&
            !Array.isArray(lookupValues)) {
          measurementParents.add(lookupValues);
        }
      }
    }
  };

  for (const sessionGroup of Object.values(payload.spirometries ?? {})) {
    for (const test of Object.values(sessionGroup ?? {})) {
      if (!test || typeof test !== 'object') continue;
      for (const name of METRICS) markMetric(test[name]);
      for (const direction of ['expiratory', 'inspiratory']) {
        for (const point of (test.flows?.[direction] ?? [])) {
          if (point && typeof point === 'object' && !Array.isArray(point)) {
            measurementParents.add(point);
          }
        }
      }
    }
  }

  for (const best of Object.values(payload.best_spirometries ?? {})) {
    if (!best || typeof best !== 'object') continue;
    for (const name of METRICS) markMetric(best[name]);
  }

  const lungAges = payload.lung_ages;
  const prefix = `__vf_float_${randomUUID().replace(/-/g, '')}_`;
  const integerMeasurements = [];

  // Use distinct placeholders during serialization; replace those placeholders
  // with numeric 0.0, 2.0, 95.0 tokens AFTER JSON.stringify completes.
  // A random prefix makes collisions with user-supplied strings negligible.
  const json = JSON.stringify(payload, function (key, value) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value)) return value;

    const isLungAge = this === lungAges;
    const isMeasurement = measurementParents.has(this) &&
      MEASUREMENT_FIELDS.has(key);

    if (isLungAge || isMeasurement) {
      const index = integerMeasurements.push(value) - 1;
      return `${prefix}${index}__`;
    }
    return value;
  });

  const marker = new RegExp(`"${prefix}(\\d+)__"`, 'g');
  return json.replace(marker, (_match, index) =>
    `${integerMeasurements[Number(index)]}.0`);
}

function sendLegacyFlutterResults(res, payload) {
  return res.type('application/json').send(serializeLegacyFlutterResults(payload));
}

module.exports = { serializeLegacyFlutterResults, sendLegacyFlutterResults };
