const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const { buildSpirometryReportHtml } = require('../public/spirometryReport');
const { getLogoDataUri } = require('../services/reportService');
const {
  buildSpirometryReportHtml,
} = require('../templates/spirometryReport'); // adjust path to your template
const {
  enrichSpirometry,
  buildDemographics,
} = require('../services/spirometryEnrich');
const {
  normalizeSpirometryValue,
} = require('../helpers/gli2012');
const prisma = new PrismaClient();

/**
 * Finds the portal_predicted_value row for a given variable whose
 * `created` timestamp is closest to the target date. Used because
 * predicted/LLN/z-score are stored per test-occasion, not tied
 * directly to a spirometry_id.
 */
function getLogoDataUri() {
  // If you already have a helper in services/reportService.js, use that instead.
  return null; // falls back to the "VP" badge in the template
}
function closestPredictedValue(predictedRows, variable, targetDate) {
  const matches = predictedRows.filter((p) => p.variable === variable);
  if (!matches.length || !targetDate) return null;
  const targetMs = new Date(targetDate).getTime();
  let best = matches[0];
  let bestDiff = Math.abs(new Date(matches[0].created).getTime() - targetMs);
  for (const m of matches) {
    const diff = Math.abs(new Date(m.created).getTime() - targetMs);
    if (diff < bestDiff) {
      best = m;
      bestDiff = diff;
    }
  }
  return best;
}

/**
 * Builds the enriched object the template expects (Best/LLN/z-score/%Pred
 * per metric) from a raw portal_spirometry row + the predicted-value table.
 */
function enrichSpirometry(row, predictedRows) {
  if (!row) return null;
  const fvcPred = closestPredictedValue(predictedRows, 'fvc', row.dbdate);
  const fev1Pred = closestPredictedValue(predictedRows, 'fev1', row.dbdate);
  const ratioPred = closestPredictedValue(predictedRows, 'fev1_fvc', row.dbdate);

  return {
    ...row,
    fev1_fvc: row.fvc ? +(row.fev1 / row.fvc).toFixed(2) : null,
    lln_fvc: fvcPred?.lln ?? null,
    zscore_fvc: fvcPred?.z_score ?? null,
    pred_percent_fvc: fvcPred?.percent_predicted ?? null,
    lln_fev1: fev1Pred?.lln ?? null,
    zscore_fev1: fev1Pred?.z_score ?? null,
    pred_percent_fev1: fev1Pred?.percent_predicted ?? null,
    lln_fev1_fvc: ratioPred?.lln ?? null,
    zscore_fev1_fvc: ratioPred?.z_score ?? null,
    fet: null, // not tracked in the current schema
  };
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

    // --- Resolve PRE/POST pair ---
    let preObservation = anchorObservation;
    let postObservation = null;

    if (anchorObservation.is_post_bronchodilator) {
      postObservation = anchorObservation;
      if (anchorObservation.linked_pre_post_observation_id) {
        preObservation = await prisma.portal_observation.findFirst({
          where: { id: anchorObservation.linked_pre_post_observation_id },
        });
      }
    } else if (anchorObservation.linked_pre_post_observation_id) {
      postObservation = await prisma.portal_observation.findFirst({
        where: { id: anchorObservation.linked_pre_post_observation_id },
      });
    } else {
      postObservation = await prisma.portal_observation.findFirst({
        where: {
          linked_pre_post_observation_id: obsId,
          is_post_bronchodilator: true,
        },
      });
    }

    const userId = preObservation.user_id;

    // --- Fetch everything needed in parallel ---
    const [preSpiroRows, postSpiroRows, user] = await Promise.all([
      prisma.portal_spirometry.findMany({
        where: { observation_id: preObservation.id },
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
              attributes: {
                select: {
                  dob: true,
                  gender: true,
                  height: true,
                  weight: true,
                  ethnic_group: true,
                  lookup_table: true,   // ← needed for GLI ethnicity
                  smoking: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // "Best" trial = most recent. (ATS best-pick is done inside the
    // template's pre/post trial selection in the original code — keep
    // that behavior here for parity with how the report was designed.)
    const preRaw = preSpiroRows[0] || null;
    const postRaw = postSpiroRows[0] || null;

    if (!preRaw) {
      return res.status(404).json({
        error: 'No spirometry trials found for this observation',
      });
    }

    // --- Build GLI-2012 demographics using the observation's own height ---
    const attrs = user?.patient_details?.attributes || {};

    const demoForPre = buildDemographics({
      observation: preObservation,
      attributes: attrs,
    });

    const demoForPost = buildDemographics({
      observation: postObservation || preObservation,
      attributes: attrs,
    });

    // --- Enrich pre and post ---
    const pre = enrichSpirometry(preRaw, demoForPre);
    const post = enrichSpirometry(postRaw, demoForPost);

    // --- Patient info (units fixed: cm / kg) ---
    const dob = attrs.dob ? new Date(attrs.dob) : null;
    const age = dob
      ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000))
      : null;

    const heightCm = attrs.height ? Number(attrs.height) : null;
    const weightKg = attrs.weight ? Number(attrs.weight) : null;
    const bmi =
      heightCm && weightKg
        ? Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1))
        : null;

    const patient = {
      name: user ? `${user.f_name ?? ''} ${user.l_name ?? ''}`.trim() : 'N/A',
      id: user?.user_id ?? 'N/A',
      referredBy: 'N/A',
      testDate: pre?.dbdate
        ? new Date(pre.dbdate).toLocaleString()
        : 'N/A',
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
        preFlows: preRaw?.flows,
        postFlows: postRaw?.flows,
        preVolumes: preRaw?.volumes,
        postVolumes: postRaw?.volumes,
      },
      { logoDataUri: getLogoDataUri() }
    );

    // --- PDF generation ---
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });

    await browser.close();

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

module.exports = { getSpirometryReportPDF };