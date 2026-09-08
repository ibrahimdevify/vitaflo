const { PrismaClient } = require('@prisma/client');
const prisma = global.__vitalflo_prisma__ || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  global.__vitalflo_prisma__ = prisma;
}

module.exports = prisma;