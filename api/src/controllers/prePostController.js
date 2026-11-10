'use strict';
const { PrismaClient } = require('@prisma/client');
const { canReadPatient } = require('../helpers/patientScope');
const prisma = new PrismaClient();

const CLINICAL_ROLES = new Set([1, 2, 3, 6]);
function id(raw) {
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
async function access(req, res, patientId) {
  if (!CLINICAL_ROLES.has(Number(req.user?.ut_id_fk))) {
    res.status(403).json({ error: 'Clinical staff permissions required' }); return false;
  }
  if (!(await canReadPatient(req.user, patientId))) {
    res.status(403).json({ error: 'Not authorized for this patient' }); return false;
  }
  return true;
}

// Pairing is a clinical confirmation action, not an automatic proximity rule.
// The existing mobile client provides no reliable shared PRE/POST session ID.
async function confirmPair(req, res) {
  const patientId = id(req.params.id);
  const preId = id(req.body?.preObservationId);
  const postId = id(req.body?.postObservationId);
  if (!patientId || !preId || !postId || preId === postId || req.body?.confirmed !== true) {
    return res.status(400).json({ error: 'Choose two different observation IDs and confirm the clinical pairing' });
  }
  try {
    if (!(await access(req, res, patientId))) return;
    const result = await prisma.$transaction(async tx => {
      const observations = await tx.portal_observation.findMany({
        where: { id: { in: [preId, postId] }, user_id: patientId },
        select: { id: true, user_id: true, linked_pre_post_observation_id: true, related_observations: { select: { id: true } }, spirometries: { select: { id: true }, take: 1 } },
      });
      if (observations.length !== 2 || observations.some(o => !o.spirometries.length)) {
        const err = new Error('Both observations must belong to this patient and contain spirometry results'); err.status = 400; throw err;
      }
      const [pre, post] = [preId, postId].map(n => observations.find(o => o.id === n));
      const otherLinks = observations.some(o =>
        (o.linked_pre_post_observation_id && ![preId, postId].includes(o.linked_pre_post_observation_id)) ||
        o.related_observations.some(child => ![preId, postId].includes(child.id)));
      if (otherLinks) { const err = new Error('One observation is already linked to a different test. Unpair it first.'); err.status = 409; throw err; }
      await tx.portal_observation.update({ where: { id: pre.id }, data: {
        is_post_bronchodilator: false,
        linked_pre_post_observation_id: null,
      } });
      await tx.portal_observation.update({ where: { id: post.id }, data: {
        is_post_bronchodilator: true,
        linked_pre_post_observation_id: pre.id,
      } });
      return { preObservationId: preId, postObservationId: postId, isLinkedPair: true };
    });
    return res.json({ data: result });
  } catch (error) {
    console.error('[VitalFlo Pre/Post confirm]', error);
    return res.status(error.status || 500).json({ error: error.status ? error.message : 'Unable to confirm pairing' });
  }
}

async function removePair(req, res) {
  const patientId = id(req.params.id), observationId = id(req.params.observationId);
  if (!patientId || !observationId) return res.status(400).json({ error: 'Invalid IDs' });
  try {
    if (!(await access(req, res, patientId))) return;
    const observation = await prisma.portal_observation.findFirst({
      where: { id: observationId, user_id: patientId }, select: { id: true },
    });
    if (!observation) return res.status(404).json({ error: 'Observation not found' });
    // Unlink in either direction; keep raw phase boolean and spirometry measurements unchanged.
    await prisma.$transaction(async tx => {
      await tx.portal_observation.updateMany({
        where: { user_id: patientId, linked_pre_post_observation_id: observationId },
        data: { linked_pre_post_observation_id: null },
      });
      await tx.portal_observation.update({
        where: { id: observationId }, data: { linked_pre_post_observation_id: null },
      });
    });
    return res.json({ success: true });
  } catch (error) {
    console.error('[VitalFlo Pre/Post unpair]', error);
    return res.status(500).json({ error: 'Unable to remove pairing' });
  }
}
module.exports = { confirmPair, removePair };
