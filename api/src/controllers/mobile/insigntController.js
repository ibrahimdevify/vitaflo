'use strict';

const { PrismaClient } = require("@prisma/client");

/**
 * VitalFlo Insights API â€” drop-in authenticated Express handler factory.
 * GET /api2/patients/:patient_id/insights?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
 *
 * Uses the existing Prisma models portal_spirometry and portal_observation.
 * REQUIRED: mount BEHIND your existing authentication middleware and supply
 * your real patient-access authorizer (do not replace it with `() => true`).
 */
const prisma = new PrismaClient();
function createInsightsHandler() {
  

  function utcBoundary(raw, end, offset) {
    if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    const date = new Date(`${raw}T00:00:00.000Z`);
    if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== raw) return null;
    if (end) date.setUTCDate(date.getUTCDate() + 1);
    date.setUTCMinutes(date.getUTCMinutes() - offset);
    return date;
  }

  const numeric = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  const rounded = (n) => n === null ? null : Math.round(n * 100) / 100;

  return async function getPatientInsights(req, res) {
    try {
      const patientId = Number(req.params.patient_id);
      if (!Number.isSafeInteger(patientId) || patientId <= 0) {
        return res.status(400).json({ error: 'Invalid patient ID' });
      }
      
      const offset = Number(req.query.tz_offset_minutes ?? 0);
      if (!Number.isInteger(offset) || offset < -840 || offset > 840) {
        return res.status(400).json({ error: 'Invalid timezone offset' });
      }
      const start = utcBoundary(req.query.from_date, false, offset);
      const end = utcBoundary(req.query.to_date, true, offset);
      if (!start || !end || start >= end || end - start > 370 * 86400 * 1000) {
        return res.status(400).json({ error: 'Invalid date range; maximum 370 days' });
      }
      res.setHeader('Cache-Control', 'private, no-store');

      const tests = await prisma.portal_spirometry.findMany({
        where: {
          dbdate: { gte: start, lt: end },
          observation: { is: { user_id: patientId } },
        },
        orderBy: [{ dbdate: 'desc' }, { id: 'desc' }],
        select: { id: true, dbdate: true, fev1: true, fvc: true },
      });

      // Shift test time into user's requested calendar timezone for grouping.
      const localDate = (at) => new Date(at.getTime() + offset * 60000)
        .toISOString().slice(0, 10);
      const monthKey = (at) => localDate(at).slice(0, 7);

      const byMonth = new Map();
      const startMonth = req.query.from_date.slice(0, 7);
      const endMonth = req.query.to_date.slice(0, 7);
      const [sy, sm] = startMonth.split('-').map(Number);
      const [ey, em] = endMonth.split('-').map(Number);
      for (let y = sy, m = sm; y < ey || (y === ey && m <= em); ) {
        const key = `${y}-${String(m).padStart(2, '0')}`;
        byMonth.set(key, { month: key, tests: 0, avg_fev1: null });
        if (++m === 13) { y++; m = 1; }
      }
      const fev1Readings = [];
      const fvcReadings = [];
      const uniqueDays = new Set();
      const monthFev1 = new Map();
      for (const test of tests) {
        uniqueDays.add(localDate(test.dbdate));
        const key = monthKey(test.dbdate);
        const bucket = byMonth.get(key);
        if (bucket) bucket.tests++;
        const fev1 = numeric(test.fev1);
        const fvc = numeric(test.fvc);
        if (fev1 !== null) {
          fev1Readings.push(fev1);
          if (!monthFev1.has(key)) monthFev1.set(key, []);
          monthFev1.get(key).push(fev1);
        }
        if (fvc !== null) fvcReadings.push(fvc);
      }
      const average = (arr) => arr.length ? rounded(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
      for (const item of byMonth.values()) item.avg_fev1 = average(monthFev1.get(item.month) || []);
      const mostRecent = tests[0] || null;
      return res.json({
        patient_id: patientId,
        range: { from_date: req.query.from_date, to_date: req.query.to_date },
        summary: {
          total_tests: tests.length,
          active_days: uniqueDays.size,
          avg_fev1: average(fev1Readings),
          avg_fvc: average(fvcReadings),
          best_fev1: fev1Readings.length ? rounded(Math.max(...fev1Readings)) : null,
        },
        monthly: [...byMonth.values()],
        latest: mostRecent ? {
          id: mostRecent.id, date: mostRecent.dbdate.toISOString(),
          fev1: numeric(mostRecent.fev1), fvc: numeric(mostRecent.fvc),
        } : null,
        // Survey history is not present in the supplied Prisma schema.
        // Do not claim the count is zero or invent data.
        survey_count: null,
      });
    } catch (error) {
      console.error('[VitalFlo Insights API]', error);
      return res.status(500).json({ error: 'Could not load insights' });
    }
  };
}
module.exports = { createInsightsHandler };