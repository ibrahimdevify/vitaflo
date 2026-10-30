// src/controllers/spirometryReport.js
'use strict';

const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const { canReadPatient } = require('../helpers/patientScope');
const { bestObservedValues } = require('../helpers/spirometryParity');

const { buildSpirometryReportHtml } = require('../public/spirometryReport');
const { getLogoDataUri } = require('../services/reportService');
const {
  enrichSpirometry,
  buildDemographics,
} = require('../services/spirometryEnrich');

const prisma = new PrismaClient();

// The web Spirometry tab reports the highest values across the observation's
// maneuvers (best-per-field), not simply the last recorded maneuver.
// Charts, however, MUST come from an actual measured maneuver.
function summarizeObservation(rows = []) {
  if (!rows.length) return { summaryRaw: null, chartRaw: null };
  const best = bestObservedValues(rows);
  const numeric = (v) => v == null ? -Infinity : Number(v);
  const chartRaw = [...rows].sort((a, b) => {
    const aPoints = (a.flows?.length || a.volumes?.length || 0) > 1;
    const bPoints = (b.flows?.length || b.volumes?.length || 0) > 1;
    if (aPoints !== bPoints) return aPoints ? -1 : 1;
    return numeric(bestObservedValues([b]).fvc) - numeric(bestObservedValues([a]).fvc);
  })[0];
  return { chartRaw, summaryRaw: {
    ...chartRaw,
    fev1: best.fev1,
    fvc: best.fvc,
    pefr: best.pefr,
    fef2575: best.fef2575,
    fev6: best.fev6,
  } };
}


/**
 * GET /api/spirometry/observation/:observation_id/pdf
 *
 * Builds the ATS Bronchodilator Responsiveness Report PDF for the given
 * observation. observation_id may point at either the pre- or the
 * post-bronchodilator observation; the paired one is looked up via
 * linked_pre_post_observation_id in either direction.
 */
const getSpirometryReportPDF = async (req, res) => {
  let browser;
  try {
    const { observation_id } = req.params;
    const obsId = parseInt(observation_id, 10);
    if (!obsId) {
      return res.status(400).json({ error: 'Invalid observation_id' });
    }

    // --- Resolve anchor observation ---
    const anchorObservation = await prisma.portal_observation.findFirst({
      where: { id: obsId },
    });
    if (!anchorObservation) {
      return res.status(404).json({ error: 'Observation not found' });
    }

    // --- Resolve PRE/POST pair in either direction, verifying identity and phase ---
    // Do not relabel a standalone post observation as a pre observation.
    let preObservation = anchorObservation.is_post_bronchodilator ? null : anchorObservation;
    let postObservation = anchorObservation.is_post_bronchodilator ? anchorObservation : null;
    const inversePhase = !anchorObservation.is_post_bronchodilator;
    let paired = null;
    if (anchorObservation.linked_pre_post_observation_id) {
      paired = await prisma.portal_observation.findFirst({
        where: { id: anchorObservation.linked_pre_post_observation_id,
          user_id: anchorObservation.user_id,
          is_post_bronchodilator: inversePhase },
      });
    }
    if (!paired) {
      paired = await prisma.portal_observation.findFirst({
        where: { linked_pre_post_observation_id: obsId,
          user_id: anchorObservation.user_id,
          is_post_bronchodilator: inversePhase },
        orderBy: { dbdate: 'desc' },
      });
    }
    if (paired) {
      if (paired.is_post_bronchodilator) postObservation = paired;
      else preObservation = paired;
    }

    const userId = anchorObservation.user_id;
    // Authentication alone does not confer permission to read patient reports.
    if (!(await canReadPatient(req.user, userId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // --- Fetch everything needed in parallel ---
    const [preSpiroRows, postSpiroRows, user] = await Promise.all([
      prisma.portal_spirometry.findMany({
        where: { observation_id: preObservation?.id ?? -1 },
        orderBy: { dbdate: 'desc' },
        include: { flows: true, volumes: true },
      }),
      postObservation
        ? prisma.portal_spirometry.findMany({
            where: { observation_id: postObservation.id },
            orderBy: { dbdate: 'desc' },
            include: { flows: true, volumes: true },
          })
        : Promise.resolve([]),
      prisma.dc_users.findFirst({
        where: { user_id: userId },
        select: {
          user_id: true,
          f_name: true,
          l_name: true,
          patient_details: {
            select: {
              height: true,
              attributes: {
                select: {
                  dob: true,
                  gender: true,
                  height: true,
                  weight: true,
                  ethnic_group: true,
                  lookup_table: true,
                  smoking: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const preSession = summarizeObservation(preSpiroRows);
    const postSession = summarizeObservation(postSpiroRows);
    const preRaw = preSession.summaryRaw;
    const postRaw = postSession.summaryRaw;
    if (!preRaw && !postRaw) {
      return res.status(404).json({ error: 'No spirometry trials found for this observation' });
    }

    // --- Build GLI-2012 demographics using the observation's own height ---
    const attrs = user?.patient_details?.attributes || {};

    const demoForPre = buildDemographics({
      observation: preObservation || anchorObservation,
      attributes: attrs,
      details: user?.patient_details,
      testDate: preRaw?.dbdate || postRaw?.dbdate,
    });

    const demoForPost = buildDemographics({
      observation: postObservation || anchorObservation,
      attributes: attrs,
      details: user?.patient_details,
      testDate: postRaw?.dbdate || preRaw?.dbdate,
    });

    // --- Enrich pre and post ---
    const pre = enrichSpirometry(preRaw, demoForPre);
    const post = enrichSpirometry(postRaw, demoForPost);

    // --- Patient info (units fixed: cm / kg) ---
    const dob = attrs.dob ? new Date(attrs.dob) : null;
    const age = demoForPre?.age == null ? null : Math.floor(demoForPre.age);
    const heightCm = demoForPre?.height ?? null;
    const weightKg = attrs.weight ? Number(attrs.weight) : null;
    const bmi =
      heightCm && weightKg
        ? Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1))
        : null;

    const patient = {
      name: user ? `${user.f_name ?? ''} ${user.l_name ?? ''}`.trim() : 'N/A',
      id: user?.user_id ?? 'N/A',
      referredBy: 'N/A',
      testDate: (pre?.dbdate || post?.dbdate) ? new Date(pre?.dbdate || post?.dbdate).toISOString().replace('T', ' ').slice(0, 19) + ' UTC' : 'N/A',
      sex: attrs.gender ?? 'N/A',
      reason: 'N/A',
      dob: dob ? dob.toISOString().slice(0, 10) : 'N/A',
      spo2: 'N/A',
      age: age ?? 'N/A',
      height: heightCm ? `${heightCm.toFixed(1)} cm` : 'N/A',
      ethnicity: attrs.ethnic_group || attrs.lookup_table || 'N/A',
      weight: weightKg ? `${weightKg.toFixed(1)} kg` : 'N/A',
      smoking: attrs.smoking ? 'Yes' : 'N/A',
      bmi: bmi ?? 'N/A',
    };

    // --- Render HTML ---
    const html = buildSpirometryReportHtml(
      {
        patient,
        pre,
        post,
        preFlows: preSession.chartRaw?.flows,
        postFlows: postSession.chartRaw?.flows,
        preVolumes: preSession.chartRaw?.volumes,
        postVolumes: postSession.chartRaw?.volumes,
      },
      { logoDataUri: getLogoDataUri() }
    );

    // --- PDF generation ---
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    // All charts are inline SVG: no external script/network dependency.
    await page.setContent(html, { waitUntil: 'load' });

    const pdfBytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });

    const pdfBuffer = Buffer.from(pdfBytes);
    await browser.close();
    browser = null;

    const filename = `spirometry_report_${obsId}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    return res.send(pdfBuffer);
  } catch (error) {
    if (browser) await browser.close();
    console.error('Get spirometry report PDF error:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getSpirometryReportPDF, summarizeObservation };