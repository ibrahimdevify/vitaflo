const { verifyToken } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    let token = req.headers.vitalfloauth;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }

      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (authHeader.startsWith('Basic ')) {
        const base64 = authHeader.split(' ')[1];
        const decoded = Buffer.from(base64, 'base64').toString('utf-8');
        token = decoded.split(':')[0];
      } else {
        return res.status(401).json({ error: 'Invalid authorization format' });
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Try JWT first
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      req.session = { access_token: token };
      return next();
    } catch (jwtError) {
      // Not JWT, try session token
    }

    // Check vf_session
    const session = await prisma.vf_session.findUnique({
      where: { access_token: token },
      include: { user: { select: { user_id: true, ut_id_fk: true, email: true } } }
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Update last action
    await prisma.vf_session.update({
      where: { access_token: token },
      data: { last_action: new Date() }
    }).catch(() => {});

    req.user = {
      user_id: session.user.user_id,
      ut_id_fk: session.user.ut_id_fk,
      email: session.user.email,
    };
    req.session = session;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userTypeMap = {
      technician: 1,
      account_admin: 2,
      clinician: 3,
      patient: 4,
    };

    const userRole = Object.keys(userTypeMap).find(
      key => userTypeMap[key] === req.user.ut_id_fk
    );

    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = { authenticate, authorize };
