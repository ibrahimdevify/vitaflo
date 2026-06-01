const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, email: user.email, ut_id_fk: user.ut_id_fk },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, generateRefreshToken, verifyToken };
