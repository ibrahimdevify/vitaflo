const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const templates = require('./reportTemplates');

class ReportError extends Error {}

let browserPromise = null;

// Looked up once and cached. Drop a file named exactly one of these into
// services/assets/ and it's picked up automatically — no code changes needed.
// SVG is checked first since it scales cleanly at any print resolution.
const LOGO_CANDIDATES = ['vitalflo-logo.svg', 'vitalflo-logo.png', 'vitalflo-logo.jpg', 'vitalflo-logo.jpeg'];
const MIME_BY_EXT = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

let cachedLogoDataUri; // undefined = not looked up yet, null = looked up and not found

/** Returns a `data:<mime>;base64,...` URI for the logo, or null if no logo file is present. */
function getLogoDataUri() {
  if (cachedLogoDataUri !== undefined) return cachedLogoDataUri;

  for (const filename of LOGO_CANDIDATES) {
    const fullPath = path.join(__dirname, 'assets', filename);
    if (fs.existsSync(fullPath)) {
      const ext = path.extname(filename).toLowerCase();
      const mime = MIME_BY_EXT[ext] || 'application/octet-stream';
      const base64 = fs.readFileSync(fullPath).toString('base64');
      cachedLogoDataUri = `data:${mime};base64,${base64}`;
      return cachedLogoDataUri;
    }
  }

  cachedLogoDataUri = null;
  return cachedLogoDataUri;
}

/** Single shared browser instance, reused across requests (launching Chromium per-request is slow). */
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    browserPromise.catch(() => {
      browserPromise = null; // allow retry on next call if launch failed
    });
  }
  return browserPromise;
}

function footerTemplate(meta) {
  const patientName = (meta.patientName || '').replace(/</g, '&lt;');
  const brandHtml = meta.logoDataUri
    ? `<img src="${meta.logoDataUri}" style="height:10px;vertical-align:middle;" alt="VitalFlo" />`
    : 'VitalFlo';
  return `
    <div style="font-size:8px;width:100%;padding:0 12mm;color:#6B7280;display:flex;align-items:center;justify-content:space-between;font-family:Arial,sans-serif;">
      <span>${brandHtml} &middot; ${patientName}</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>`;
}

/**
 * Renders one tab's data to a PDF buffer.
 *
 * @param {string} tab - one of the keys in reportTemplates/index.js (same tab names the JSON API uses)
 * @param {object} data - whatever patientService.getPatientTabData(tab, params) returned
 * @param {object} [meta] - { patientName, clinicianName, sessionGrades?, lungAge?, survey? } for the header/footer
 * @returns {Promise<Buffer>}
 */
async function generateTabReportPdf(tab, data, meta = {}) {
  const builder = templates[tab];
  if (!builder) {
    throw new ReportError(`No PDF template registered for tab: ${tab}`);
  }

  const enrichedMeta = { ...meta, logoDataUri: meta.logoDataUri ?? getLogoDataUri() };
  const html = builder(data, enrichedMeta);
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Charts flip window.__chartsReady once every Chart.js instance finishes its
    // initial animation (see reportTemplates/layout.js -> chartBootstrap). Poll
    // for it so we never rasterize a half-drawn canvas; fall back to the timeout
    // rather than hanging forever if a chart script ever throws.
    await page.waitForFunction('window.__chartsReady === true', { timeout: 10000 }).catch(() => {});

    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '14mm', left: '10mm', right: '10mm' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: footerTemplate(enrichedMeta),
    });
  } finally {
    await page.close();
  }
}

async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise.catch(() => null);
    if (browser) await browser.close();
    browserPromise = null;
  }
}

module.exports = { generateTabReportPdf, closeBrowser, ReportError, getLogoDataUri };