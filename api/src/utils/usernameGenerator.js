// src/utils/usernameGenerator.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Username Generator Utility
 * 
 * Generates unique usernames with priority:
 * 1. f_name
 * 2. f_name + l_name
 * 3. email prefix
 * 4. f_name + random number
 * 5. random username
 */

/**
 * Clean username to be URL-safe and normalized
 */
function cleanUsername(name) {
    if (!name) return '';

    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9._-]/g, '') // Remove special characters
        .replace(/\s+/g, '.') // Replace spaces with dots
        .replace(/\.{2,}/g, '.') // Remove multiple dots
        .replace(/^\.|\.$/g, '') // Remove leading/trailing dots
        .slice(0, 50); // Limit length
}

/**
 * Generate random username
 */
function generateRandomUsername() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const timestamp = Date.now().toString(36).slice(-4);
    let result = `user_${timestamp}`;

    for (let i = 0; i < 4; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}

/**
 * Get email prefix (before @)
 */
function getEmailPrefix(email) {
    if (!email) return '';
    const prefix = email.split('@')[0];
    return cleanUsername(prefix);
}

/**
 * Generate username candidates for a user
 */
function generateUsernameCandidates({ f_name, l_name, email }) {
    const candidates = [];

    // 1. First priority: f_name
    const firstName = cleanUsername(f_name);
    if (firstName) candidates.push(firstName);

    // 2. Second priority: f_name + l_name
    const fullName = cleanUsername(`${f_name}_${l_name}`);
    if (fullName) candidates.push(fullName);

    // 3. Third priority: f_name.l_name
    const dottedName = cleanUsername(`${f_name}.${l_name}`);
    if (dottedName) candidates.push(dottedName);

    // 4. Fourth priority: email prefix
    const emailPrefix = getEmailPrefix(email);
    if (emailPrefix) candidates.push(emailPrefix);

    // 5. Fifth priority: f_name + random number
    if (firstName) {
        candidates.push(`${firstName}${Math.floor(Math.random() * 1000)}`);
        candidates.push(`${firstName}${Math.floor(Math.random() * 10000)}`);
        candidates.push(`${firstName}_${Math.floor(Math.random() * 10000)}`);
    }

    // 6. Last resort: random
    candidates.push(generateRandomUsername());

    // Remove duplicates and empty values
    return [...new Set(candidates.filter(c => c && c.length >= 3))];
}

/**
 * Check if username is unique in database
 */
async function isUsernameUnique(username) {
    if (!username) return false;

    const existing = await prisma.dc_users.findFirst({
        where: { userName: username },
        select: { user_id: true }
    });

    return !existing;
}

/**
 * Generate a unique username for a new user
 * 
 * @param {Object} params - User details
 * @param {string} params.f_name - First name
 * @param {string} params.l_name - Last name (optional)
 * @param {string} params.email - Email address
 * @param {string} [params.preferredUsername] - Preferred username (optional)
 * @param {number} [excludeUserId] - User ID to exclude (for updates)
 * @returns {Promise<string>} Unique username
 */
async function generateUniqueUsername({ f_name, l_name, email, preferredUsername, excludeUserId = null }) {
    try {
        // If preferred username is provided, check it first
        if (preferredUsername) {
            const cleanedPreferred = cleanUsername(preferredUsername);

            if (cleanedPreferred) {
                const existing = await prisma.dc_users.findFirst({
                    where: {
                        userName: cleanedPreferred,
                        ...(excludeUserId ? { user_id: { not: excludeUserId } } : {})
                    },
                    select: { user_id: true }
                });

                if (!existing) {
                    return cleanedPreferred;
                }

                // If preferred username taken, add number
                const withNumber = `${cleanedPreferred}${Math.floor(Math.random() * 1000)}`;
                const existingNumber = await prisma.dc_users.findFirst({
                    where: {
                        userName: withNumber,
                        ...(excludeUserId ? { user_id: { not: excludeUserId } } : {})
                    },
                    select: { user_id: true }
                });

                if (!existingNumber) {
                    return withNumber;
                }
            }
        }

        // Generate candidates
        const candidates = generateUsernameCandidates({ f_name, l_name, email });

        // Try each candidate
        for (const candidate of candidates) {
            const existing = await prisma.dc_users.findFirst({
                where: {
                    userName: candidate,
                    ...(excludeUserId ? { user_id: { not: excludeUserId } } : {})
                },
                select: { user_id: true }
            });

            if (!existing) {
                return candidate;
            }
        }

        // If all candidates taken, generate unique random
        let attempts = 0;
        while (attempts < 50) {
            const randomUsername = generateRandomUsername();

            const existing = await prisma.dc_users.findFirst({
                where: {
                    userName: randomUsername,
                    ...(excludeUserId ? { user_id: { not: excludeUserId } } : {})
                },
                select: { user_id: true }
            });

            if (!existing) {
                return randomUsername;
            }

            attempts++;
        }

        throw new Error('Could not generate unique username after 50 attempts');

    } catch (error) {
        console.error('Error generating username:', error);
        throw error;
    }
}

/**
 * Generate username without checking database (for client-side preview)
 */
function previewUsername({ f_name, l_name, email }) {
    return generateUsernameCandidates({ f_name, l_name, email })[0] || generateRandomUsername();
}

/**
 * Validate if username meets requirements
 */
function isValidUsername(username) {
    if (!username) return false;
    if (username.length < 3 || username.length > 50) return false;

    // Check if contains only allowed characters
    const allowedPattern = /^[a-z0-9._-]+$/;
    return allowedPattern.test(username);
}

/**
 * Bulk generate usernames for multiple users (optimized)
 */
async function bulkGenerateUsernames(users) {
    const results = [];
    const usedUsernames = new Set();

    // Get all existing usernames
    const existingUsers = await prisma.dc_users.findMany({
        where: { userName: { not: null } },
        select: { userName: true }
    });

    existingUsers.forEach(u => {
        if (u.userName) usedUsernames.add(u.userName.toLowerCase());
    });

    for (const user of users) {
        const candidates = generateUsernameCandidates(user);

        let selectedUsername = null;

        // Try candidates
        for (const candidate of candidates) {
            if (!usedUsernames.has(candidate.toLowerCase())) {
                selectedUsername = candidate;
                break;
            }
        }

        // If no candidate works, generate random
        if (!selectedUsername) {
            do {
                selectedUsername = generateRandomUsername();
            } while (usedUsernames.has(selectedUsername.toLowerCase()));
        }

        usedUsernames.add(selectedUsername.toLowerCase());
        results.push({
            ...user,
            userName: selectedUsername
        });
    }

    return results;
}

module.exports = {
    generateUniqueUsername,
    previewUsername,
    isValidUsername,
    cleanUsername,
    bulkGenerateUsernames,
    generateRandomUsername
};