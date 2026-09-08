const {
  getResources,
  getResourceFile,
} = require('../services/resource.service');

const listResources = (req, res) => {
  return res.json({
    success: true,
    data: getResources(),
  });
};

const getResourcePdf = (req, res) => {
  const { filename } = req.params;

  const resource = getResourceFile(filename);

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
    });
  }

  res.setHeader('Content-Type', 'application/pdf');

  res.setHeader(
    'Content-Disposition',
    `inline; filename="${resource.file}"`
  );

  return res.sendFile(resource.filePath);
};

module.exports = {
  listResources,
  getResourcePdf,
};