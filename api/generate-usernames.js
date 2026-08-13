/**
 * generate-usernames.js
 * 
 * Generates unique usernames for ALL users in dc_users table
 * Priority: f_name -> f_name_l_name -> email prefix -> random
 * Handles conflicts automatically
 * 
 * USAGE:
 *   node generate-usernames.js              -> Dry run (preview only)
 *   node generate-usernames.js --apply      -> Apply changes to database
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

// File paths
const RESULTS_FILE = path.join(__dirname, 'username-generation-results.json');
const ERROR_LOG_FILE = path.join(__dirname, 'username-generation-errors.log');

/**
 * Clean username to be URL-safe and normalized
 */
function cleanUsername(name) {
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
    let result = 'user_';
    for (let i = 0; i < 8; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

/**
 * Get email prefix (before @)
 */
function getEmailPrefix(email) {
    if (!email) return null;
    const prefix = email.split('@')[0];
    return cleanUsername(prefix);
}

/**
 * Generate all possible username candidates for a user
 */
function generateUsernameCandidates(user) {
    const candidates = [];

    // 1. First priority: f_name
    if (user.f_name) {
        const firstName = cleanUsername(user.f_name);
        if (firstName) candidates.push(firstName);
    }

    // 2. Second priority: f_name + l_name
    if (user.f_name && user.l_name) {
        const fullName = cleanUsername(`${user.f_name}_${user.l_name}`);
        if (fullName) candidates.push(fullName);
    }

    // 3. Third priority: email prefix
    const emailPrefix = getEmailPrefix(user.email);
    if (emailPrefix) candidates.push(emailPrefix);

    // 4. Fourth priority: f_name + random number
    if (user.f_name) {
        const firstName = cleanUsername(user.f_name);
        if (firstName) {
            candidates.push(`${firstName}${Math.floor(Math.random() * 1000)}`);
            candidates.push(`${firstName}_${Math.floor(Math.random() * 10000)}`);
        }
    }

    // 5. Last resort: random
    candidates.push(generateRandomUsername());

    // Remove duplicates and empty values
    return [...new Set(candidates.filter(c => c && c.length >= 3))];
}

/**
 * Log error to file
 */
function logError(errorData) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${JSON.stringify(errorData)}\n`;
    fs.appendFileSync(ERROR_LOG_FILE, logEntry);
}

/**
 * Main function
 */
async function main() {
    console.log('='.repeat(60));
    console.log('👤 Username Generation Script');
    console.log('='.repeat(60));
    console.log(`Mode: ${APPLY ? '✅ APPLY (Live)' : '🔍 DRY RUN (Preview)'}`);
    console.log('Priority: f_name -> f_name_l_name -> email -> random');
    console.log('='.repeat(60));

    // Fetch all users
    console.log('\n📊 Fetching all users...');
    const users = await prisma.dc_users.findMany({
        select: {
            user_id: true,
            f_name: true,
            l_name: true,
            email: true,
            userName: true
        },
        orderBy: {
            user_id: 'asc'
        }
    });

    console.log(`✅ Found ${users.length} users`);

    // Get existing usernames (from users that already have one)
    const existingUsernames = new Set(
        users.filter(u => u.userName).map(u => u.userName.toLowerCase())
    );

    console.log(`📊 Existing usernames: ${existingUsernames.size}`);

    const results = {
        total: users.length,
        alreadyHadUsername: 0,
        generated: 0,
        failed: 0,
        users: []
    };

    // Process users
    console.log('\n🔄 Generating usernames...\n');

    for (let i = 0; i < users.length; i++) {
        const user = users[i];

        // Skip if already has username
        if (user.userName) {
            results.alreadyHadUsername++;
            results.users.push({
                user_id: user.user_id,
                email: user.email,
                username: user.userName,
                status: 'existing'
            });
            console.log(`[${i + 1}/${users.length}] SKIP (has username): ${user.email}`);
            continue;
        }

        try {
            // Generate candidates
            const candidates = generateUsernameCandidates(user);

            // Find first available username
            let selectedUsername = null;
            for (const candidate of candidates) {
                if (!existingUsernames.has(candidate.toLowerCase())) {
                    selectedUsername = candidate;
                    break;
                }
            }

            // If all candidates taken, generate unique random
            if (!selectedUsername) {
                let attempts = 0;
                do {
                    selectedUsername = generateRandomUsername();
                    attempts++;
                    if (attempts > 100) {
                        throw new Error('Could not generate unique username after 100 attempts');
                    }
                } while (existingUsernames.has(selectedUsername.toLowerCase()));
            }

            // Add to existing usernames set
            existingUsernames.add(selectedUsername.toLowerCase());

            // Update database if APPLY mode
            if (APPLY) {
                await prisma.dc_users.update({
                    where: { user_id: user.user_id },
                    data: { userName: selectedUsername }
                });
            }

            results.generated++;

            // Determine source of username
            let source = 'other';
            const firstName = cleanUsername(user.f_name || '');
            const fullName = cleanUsername(`${user.f_name || ''}_${user.l_name || ''}`);
            const emailPrefix = getEmailPrefix(user.email);

            if (selectedUsername === firstName) source = 'f_name';
            else if (selectedUsername === fullName) source = 'f_name_l_name';
            else if (selectedUsername === emailPrefix) source = 'email';
            else if (selectedUsername.startsWith('user_')) source = 'random';
            else source = 'modified';

            results.users.push({
                user_id: user.user_id,
                email: user.email,
                username: selectedUsername,
                status: 'generated',
                source: source
            });

            console.log(`[${i + 1}/${users.length}] ✅ ${user.email} -> ${selectedUsername} (${source})`);

        } catch (err) {
            results.failed++;
            logError({
                type: 'USERNAME_GENERATION_FAILED',
                user_id: user.user_id,
                email: user.email,
                error: err.message
            });
            console.error(`[${i + 1}/${users.length}] ❌ ${user.email}: ${err.message}`);
        }
    }

    // Save results
    const resultsData = {
        summary: {
            mode: APPLY ? 'apply' : 'dry-run',
            total_users: results.total,
            already_had_username: results.alreadyHadUsername,
            generated: results.generated,
            failed: results.failed,
            timestamp: new Date().toISOString()
        },
        users: results.users
    };

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(resultsData, null, 2));

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(60));
    console.log(`Total users: ${results.total}`);
    console.log(`Already had username: ${results.alreadyHadUsername}`);
    console.log(`Generated new: ${results.generated}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`\n📁 Results saved to: ${RESULTS_FILE}`);

    if (APPLY) {
        console.log('\n✅ Usernames have been applied to database');
    } else {
        console.log('\n🔍 Dry run complete. Use --apply to update database');
    }

    await prisma.$disconnect();
    process.exit(0);
}

// Run the script
main().catch(async (err) => {
    console.error('\n❌ Fatal error:', err);
    logError({ type: 'FATAL_ERROR', error: err.message, stack: err.stack });
    await prisma.$disconnect();
    process.exit(1);
});