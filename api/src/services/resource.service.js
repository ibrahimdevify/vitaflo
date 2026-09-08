const fs = require('fs');
const path = require('path');

const PDF_DIR = path.resolve(__dirname, '../pdf');

const RESOURCE_LABELS = {
  'assessing-asthma.pdf': 'Assessing Asthma',
  'asthma-action-plan.pdf': 'Asthma Action Plan',
  'spirometry-summary.pdf': 'Spirometry Summary',
  'ats-2019-update.pdf': 'ATS 2019 Update',
  'interpretation-of-pfts.pdf': 'Interpretation of PFTs',
};

const getResources = () => {
  if (!fs.existsSync(PDF_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(PDF_DIR)
    .filter((file) => file.toLowerCase().endsWith('.pdf'));

  return files.map((file) => ({
    label:
      RESOURCE_LABELS[file] ||
      path.basename(file, '.pdf'),
    file,
  }));
};

const getResourceFile = (filename) => {
  // Decode URL encoded filename
  const decodedFilename = decodeURIComponent(filename);

  const filePath = path.join(PDF_DIR, decodedFilename);

  console.log('Requested:', decodedFilename);
  console.log('Path:', filePath);

  if (!fs.existsSync(filePath)) {
    console.log('❌ File does not exist');
    return null;
  }

  if (!decodedFilename.toLowerCase().endsWith('.pdf')) {
    return null;
  }

  return {
    file: decodedFilename,
    filePath,
  };
};

module.exports = {
  getResources,
  getResourceFile,
};