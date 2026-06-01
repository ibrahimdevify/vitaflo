const crypto = require('crypto');

const generateAccessToken = () => {
  // v2.xxx.yyy format, shorter
  return 'v2.' + crypto.randomBytes(16).toString('hex') + '.' + crypto.randomBytes(32).toString('hex');
};

module.exports = { generateAccessToken };
