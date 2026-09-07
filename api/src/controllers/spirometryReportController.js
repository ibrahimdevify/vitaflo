const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const { buildSpirometryReportHtml } = require('../pdf/spirometryReport');
const { getLogoDataUri } = require('../services/reportService');
const prisma = new PrismaClient();

/**
 * Finds the portal_predicted_value row for a given variable whose
 * `created` timestamp is closest to the target date. Used because
 * predicted/LLN/z-score are stored per test-occasion, not tied
 * directly to a spirometry_id.
 */
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
    const obsId = parseInt(observation_id);
    if (!obsId) {
      return res.status(400).json({ error: 'Invalid observation_id' });
    }

    const anchorObservation = await prisma.portal_observation.findUnique({ where: { id: obsId } });
    if (!anchorObservation) {
      return res.status(404).json({ error: 'Observation not found' });
    }

    // Resolve which observation is PRE and which is POST, regardless of
    // which one was passed in.
    let preObservation = anchorObservation;
    let postObservation = null;

    if (anchorObservation.is_post_bronchodilator) {
      postObservation = anchorObservation;
      if (anchorObservation.linked_pre_post_observation_id) {
        preObservation = await prisma.portal_observation.findUnique({
          where: { id: anchorObservation.linked_pre_post_observation_id },
        });
      }
    } else if (anchorObservation.linked_pre_post_observation_id) {
      postObservation = await prisma.portal_observation.findUnique({
        where: { id: anchorObservation.linked_pre_post_observation_id },
      });
    } else {
      // Fallback: look for any post observation that links back to this one
      postObservation = await prisma.portal_observation.findFirst({
        where: { linked_pre_post_observation_id: obsId, is_post_bronchodilator: true },
      });
    }

    const userId = preObservation.user_id;

    const [preSpiroRows, postSpiroRows, user, predictedRows] = await Promise.all([
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
      prisma.dc_users.findUnique({
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
                  smoking: true,
                },
              },
            },
          },
        },
      }),
      prisma.portal_predicted_value.findMany({ where: { user_id: userId } }),
    ]);

    const preRaw = preSpiroRows[0] || null; // most recent = "best" trial
    const postRaw = postSpiroRows[0] || null;

    if (!preRaw) {
      return res.status(404).json({ error: 'No spirometry trials found for this observation' });
    }

    const pre = enrichSpirometry(preRaw, predictedRows);
    const post = enrichSpirometry(postRaw, predictedRows);

    const attrs = user?.patient_details?.attributes || {};
    const dob = attrs.dob ? new Date(attrs.dob) : null;
    const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)) : null;

    const heightIn = attrs.height || null;
    const weightLb = attrs.weight || null;
    const bmi = heightIn && weightLb ? +((703 * weightLb) / (heightIn * heightIn)).toFixed(1) : null;

    const patient = {
      name: user ? `${user.f_name ?? ''} ${user.l_name ?? ''}`.trim() : 'N/A',
      id: user?.user_id ?? 'N/A',
      referredBy: 'N/A', // not tracked in the current schema
      testDate: pre?.dbdate ? new Date(pre.dbdate).toLocaleString() : 'N/A',
      sex: attrs.gender ?? 'N/A',
      reason: 'N/A', // not tracked in the current schema
      dob: dob ? dob.toISOString().slice(0, 10) : 'N/A',
      spo2: 'N/A', // not tracked in the current schema
      age: age ?? 'N/A',
      height: heightIn ? `${heightIn} in` : 'N/A',
      ethnicity: attrs.ethnic_group ?? 'N/A',
      weight: weightLb ? `${weightLb} lbs` : 'N/A',
      smoking: attrs.smoking ? 'Yes' : 'N/A',
      bmi: bmi ?? 'N/A',
    };

      const html = buildSpirometryReportHtml({
      patient,
      pre,
      post,
      preFlows: preRaw?.flows,
      postFlows: postRaw?.flows,
      preVolumes: preRaw?.volumes,
      postVolumes: postRaw?.volumes,
    }, { logoDataUri: getLogoDataUri() });
    browser = await puppeteer.launch({
      headless: 'new',
      channel: 'chrome',
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