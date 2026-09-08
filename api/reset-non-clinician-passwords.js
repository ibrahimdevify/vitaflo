/**
 * reset-non-clinician-passwords.js
 * 
 * Instantly resets passwords for ALL non-clinician users (except admin@VitalFlo.com)
 * No email sending, no rate limiting - processes all users immediately
 * Only updates users with ut_id_fk != 3 (non-clinicians)
 * 
 * USAGE:
 *   node reset-non-clinician-passwords.js              -> Dry run (preview only)
 *   node reset-non-clinician-passwords.js --apply      -> Execute instantly
 *   node reset-non-clinician-passwords.js --apply --fresh  -> Start fresh
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuration
const APPLY = process.argv.includes('--apply');
const FRESH_START = process.argv.includes('--fresh');
const ADMIN_EMAIL = 'admin@VitalFlo.com';
const CLINICIAN_TYPE_ID = 3;

// File paths
const PROGRESS_FILE = path.join(__dirname, 'non-clinician-reset-progress.json');
const RESULTS_FILE = path.join(__dirname, 'non-clinician-reset-results.json');
const ERROR_LOG_FILE = path.join(__dirname, 'non-clinician-reset-errors.log');

/**
 * Generate a strong readable password
 */
function generatePassword(length = 12) {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%&*';

    let password = [
        uppercase[crypto.randomInt(uppercase.length)],
        lowercase[crypto.randomInt(lowercase.length)],
        numbers[crypto.randomInt(numbers.length)],
        symbols[crypto.randomInt(symbols.length)]
    ];

    const allChars = uppercase + lowercase + numbers + symbols;

    for (let i = password.length; i < length; i++) {
        password.push(allChars[crypto.randomInt(allChars.length)]);
    }

    for (let i = password.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
}

/**
 * Load progress from previous run
 */
function loadProgress() {
    if (FRESH_START) {
        console.log('🔄 Fresh start requested - ignoring previous progress');
        return new Set();
    }

    try {
        if (fs.existsSync(PROGRESS_FILE)) {
            const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
            return new Set(data.processedUserIds || []);
        }
    } catch (err) {
        console.warn('⚠️  Could not load progress file, starting fresh');
    }

    return new Set();
}

/**
 * Save progress for crash recovery
 */
function saveProgress(processedUserIds) {
    try {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
            processedUserIds: Array.from(processedUserIds),
            lastUpdated: new Date().toISOString()
        }, null, 2));
    } catch (err) {
        console.error('⚠️  Failed to save progress:', err.message);
    }
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
 * Fetch non-clinician users (excluding admin)
 */
async function fetchNonClinicianUsers() {
    console.log('📊 Fetching non-clinician users from database...');

    const users = await prisma.dc_users.findMany({
        where: {
            email: {
                not: ADMIN_EMAIL
            },
            ut_id_fk: {
                not: CLINICIAN_TYPE_ID // Exclude clinicians
            }
        },
        select: {
            user_id: true,
            email: true,
            f_name: true,
            l_name: true,
            ut_id_fk: true,
        },
        orderBy: {
            user_id: 'asc'
        }
    });

    console.log(`✅ Found ${users.length} non-clinician users (excluding admin & clinicians)`);

    return users;
}

/**
 * Process single user
 */
async function processUser(user) {
    const startTime = Date.now();

    try {
        const newPassword = generatePassword();

        if (APPLY) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.dc_users.update({
                where: { user_id: user.user_id },
                data: { password: hashedPassword }
            });
        }

        const processingTime = Date.now() - startTime;

        return {
            user_id: user.user_id,
            email: user.email,
            name: `${user.f_name || ''} ${user.l_name || ''}`.trim(),
            user_type_id: user.ut_id_fk,
            status: APPLY ? 'completed' : 'dry-run',
            password_updated: APPLY,
            new_password: APPLY ? newPassword : '[HIDDEN_IN_DRY_RUN]',
            processing_time_ms: processingTime
        };

    } catch (err) {
        logError({
            type: 'USER_PROCESSING_FAILED',
            user_id: user.user_id,
            email: user.email,
            error: err.message,
            stack: err.stack
        });

        return {
            user_id: user.user_id,
            email: user.email,
            name: `${user.f_name || ''} ${user.l_name || ''}`.trim(),
            user_type_id: user.ut_id_fk,
            status: 'failed',
            error: err.message,
            processing_time_ms: Date.now() - startTime
        };
    }
}

/**
 * Main execution function
 */
async function main() {
    const startTime = Date.now();

    console.log('='.repeat(60));
    console.log('🔐 Instant Password Reset - Non-Clinician Users');
    console.log('='.repeat(60));
    console.log(`Mode: ${APPLY ? '✅ APPLY (Live)' : '🔍 DRY RUN (Preview)'}`);
    console.log(`Fresh Start: ${FRESH_START ? 'Yes' : 'No (Resume)'}`);
    console.log(`Admin excluded: ${ADMIN_EMAIL}`);
    console.log(`Processing: Only non-clinician users (ut_id_fk != ${CLINICIAN_TYPE_ID})`);
    console.log(`Speed: Instant (no rate limiting, no emails)`);
    console.log('='.repeat(60));

    // Load previous progress
    const processedUsers = loadProgress();
    if (processedUsers.size > 0) {
        console.log(`📌 Resuming: ${processedUsers.size} users already processed`);
    }

    // Fetch users
    const users = await fetchNonClinicianUsers();

    // Filter out already processed users
    const remainingUsers = users.filter(u => !processedUsers.has(u.user_id));

    if (remainingUsers.length === 0) {
        console.log('✅ All non-clinician users have been processed already!');
        await prisma.$disconnect();
        process.exit(0);
    }

    console.log(`\n📋 Processing ${remainingUsers.length} non-clinician users instantly...\n`);

    // Results tracking
    const results = {
        total: remainingUsers.length,
        passwordUpdated: 0,
        failed: 0,
        skipped: processedUsers.size,
        processed: [],
        startTime: new Date().toISOString()
    };

    // Process all users immediately (no delay)
    for (let i = 0; i < remainingUsers.length; i++) {
        const user = remainingUsers[i];

        console.log(`[${i + 1}/${remainingUsers.length}] Processing ${user.email}...`);

        // Process user
        const result = await processUser(user);
        results.processed.push(result);

        // Update progress
        processedUsers.add(user.user_id);
        saveProgress(processedUsers);

        // Update results
        if (result.status === 'completed') {
            results.passwordUpdated++;
            console.log(`  ✅ Success (${result.processing_time_ms}ms)`);
        } else if (result.status === 'failed') {
            results.failed++;
            console.log(`  ❌ Failed: ${result.error}`);
        } else {
            console.log(`  🔍 Dry run - would process`);
        }
    }

    // Generate final report
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    results.endTime = new Date().toISOString();
    results.totalTimeSeconds = parseFloat(totalTime);

    // Save detailed results
    const resultsData = {
        summary: {
            mode: APPLY ? 'apply' : 'dry-run',
            total_users: users.length,
            processed_this_run: results.total,
            skipped_previously: results.skipped,
            passwords_updated: results.passwordUpdated,
            completely_failed: results.failed,
            total_time_seconds: totalTime,
            start_time: results.startTime,
            end_time: results.endTime
        },
        details: results.processed
    };

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(resultsData, null, 2));

    // Print final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(60));
    console.log(`Mode: ${resultsData.summary.mode}`);
    console.log(`Total non-clinician users: ${resultsData.summary.total_users}`);
    console.log(`Previously processed: ${resultsData.summary.skipped_previously}`);
    console.log(`Processed this run: ${resultsData.summary.processed_this_run}`);
    console.log(`Passwords updated: ${resultsData.summary.passwords_updated}`);
    console.log(`Completely failed: ${resultsData.summary.completely_failed}`);
    console.log(`Total time: ${resultsData.summary.total_time_seconds} seconds`);
    console.log(`\n📁 Detailed results saved to: ${RESULTS_FILE}`);
    console.log(`📁 Progress saved to: ${PROGRESS_FILE}`);
    if (resultsData.summary.completely_failed > 0) {
        console.log(`⚠️  Errors logged to: ${ERROR_LOG_FILE}`);
    }

    // Security warning
    if (APPLY) {
        console.log('\n⚠️  SECURITY NOTICE:');
        console.log('   Results file contains plaintext passwords.');
        console.log('   Please secure or delete it after verification.');
    }

    await prisma.$disconnect();

    // Exit with error code if any failures occurred
    if (results.failed > 0) {
        process.exit(1);
    }

    process.exit(0);
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Process interrupted by user');
    console.log('Progress has been saved. Run again to resume.');
    await prisma.$disconnect();
    process.exit(0);
});

// Run the script
main().catch(async (err) => {
    console.error('\n❌ Fatal error:', err);
    logError({
        type: 'FATAL_ERROR',
        error: err.message,
        stack: err.stack
    });
    await prisma.$disconnect();
    process.exit(1);
});