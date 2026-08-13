// src/utils/usernameHelper.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateUserName(email) {
    // Get email prefix
    let userName = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    // If empty, generate random
    if (!userName) {
        userName = `user${Math.floor(Math.random() * 10000)}`;
    }

    // Check if exists
    const existing = await prisma.dc_users.findUnique({
        where: { userName },
        select: { user_id: true }
    });

    // If exists, add random number
    if (existing) {
        userName = `${userName}${Math.floor(Math.random() * 1000)}`;
    }

    return userName;
}

module.exports = { generateUserName };