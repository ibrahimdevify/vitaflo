'use strict';

// The legacy database default (false) does not prove a test was performed PRE.
// In particular, older offline Flutter retries omit isPostBronchodilator.
function parsePhaseFlag(value) {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  return null;
}

/**
 * No schema migration: the existing boolean has no provenance field.
 * Legacy false can also mean "phase omitted during offline retry".
 * Thus a PRE phase is trusted for display ONLY when it is explicitly linked
 * to a POST observation. An unlinked false observation remains UNKNOWN.
 * A stored POST flag is shown but marked unverified until linked.
 * Existing linkage is not proof of who made the clinical confirmation.
 */
function linkedPostObservation(observation) {
  const children = observation?.related_observations || [];
  return children.find(child => child?.is_post_bronchodilator === true) || null;
}

function linkedObservationId(observation) {
  if (observation?.is_post_bronchodilator === true) {
    return observation.linked_pre_post_observation_id || null;
  }
  return linkedPostObservation(observation)?.id || null;
}

function describePhase(observation) {
  const linked = Boolean(linkedObservationId(observation));
  if (linked) return {
    phase: observation.is_post_bronchodilator ? 'POST' : 'PRE',
    phaseVerified: false, phaseLinked: true, phaseSource: 'linked_observation',
  };
  if (observation?.is_post_bronchodilator === true) return {
    phase: 'POST', phaseVerified: false, phaseLinked: false, phaseSource: 'legacy_flag',
  };
  return { phase: 'UNKNOWN', phaseVerified: false, phaseLinked: false, phaseSource: 'unknown' };
}

function responseMetric(pre, post) {
  if (!Number.isFinite(pre?.observed) || !Number.isFinite(post?.observed)) {
    return { absoluteChange: null, percentBaselineChange: null, percentPredictedChange: null };
  }
  const delta = post.observed - pre.observed;
  const predicted = Number.isFinite(pre.predicted) && pre.predicted > 0 ? pre.predicted : null;
  return {
    absoluteChange: Number(delta.toFixed(4)),
    percentBaselineChange: pre.observed !== 0 ? Number((delta / pre.observed * 100).toFixed(2)) : null,
    percentPredictedChange: predicted ? Number((delta / predicted * 100).toFixed(2)) : null,
  };
}

function buildBronchodilatorResponse(preResults = [], postResults = []) {
  const byVar = (rows) => new Map(rows.map(row => [row.variable, row]));
  const pre = byVar(preResults); const post = byVar(postResults);
  return ['FEV1', 'FVC', 'FEV1/FVC'].map(variable => ({
    variable,
    // FEV1/FVC absolute change is ratio, not liters.
    ...responseMetric(pre.get(variable), post.get(variable)),
  }));
}

module.exports = { parsePhaseFlag, describePhase, linkedObservationId, responseMetric, buildBronchodilatorResponse };
