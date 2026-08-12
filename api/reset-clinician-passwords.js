/**
 * reset-clinician-passwords.js
 * 
 * Resets passwords for clinicians (ut_id_fk = 3) AND sends email notifications
 * Rate limited to 2 users per minute to avoid email provider limits
 * Crash-safe with resume capability
 * 
 * USAGE:
 *   node reset-clinician-passwords.js              -> Dry run (preview only)
 *   node reset-clinician-passwords.js --apply      -> Execute with rate limiting
 *   node reset-clinician-passwords.js --apply --fresh  -> Start fresh
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

// Email service import
let sendNewPasswordEmail;
try {
  const emailService = require('./src/utils/emailService');
  sendNewPasswordEmail = emailService.sendNewPasswordEmail;
} catch (err) {
  console.error('❌ Email service not found. Please check the import path.');
  console.error('   Expected: ./src/utils/emailService');
  process.exit(1);
}

const prisma = new PrismaClient();

// Configuration
const APPLY = process.argv.includes('--apply');
const FRESH_START = process.argv.includes('--fresh');
const USERS_PER_MINUTE = 2;
const DELAY_BETWEEN_USERS_MS = 30000; // 30 seconds between each user (2 per minute)
const CLINICIAN_TYPE_ID = 3;

// File paths
const PROGRESS_FILE = path.join(__dirname, 'clinician-reset-progress.json');
const RESULTS_FILE = path.join(__dirname, 'clinician-reset-results.json');
const ERROR_LOG_FILE = path.join(__dirname, 'clinician-reset-errors.log');

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
 * Validate email configuration
 */
async function validateEmailService() {
  if (!APPLY) return true;

  try {
    if (typeof sendNewPasswordEmail !== 'function') {
      throw new Error('sendNewPasswordEmail is not a function');
    }
    console.log('✅ Email service validated');
    return true;
  } catch (err) {
    console.error('❌ Email service validation failed:', err.message);
    return false;
  }
}

/**
 * Fetch clinicians only (ut_id_fk = 3)
 */
async function fetchClinicians() {
  console.log('📊 Fetching clinicians from database...');

  const users = await prisma.dc_users.findMany({
    where: {
      ut_id_fk: CLINICIAN_TYPE_ID
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

  console.log(`✅ Found ${users.length} clinicians`);

  return users;
}

/**
 * Process single clinician
 */
async function processClinician(user, results) {
  const startTime = Date.now();

  try {
    const newPassword = generatePassword();

    if (APPLY) {
      // Update password in database first
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.dc_users.update({
        where: { user_id: user.user_id },
        data: { password: hashedPassword }
      });

      // Send email
      try {
        await sendNewPasswordEmail({
          to: user.email,
          firstName: user.f_name || 'User',
          lastName: user.l_name || '',
          newPassword: newPassword,
          email: user.email
        });

        results.emailSent++;
        console.log(`  ✉️  Email sent successfully`);
      } catch (emailErr) {
        results.emailFailed++;
        logError({
          type: 'EMAIL_FAILED',
          user_id: user.user_id,
          email: user.email,
          error: emailErr.message,
          note: 'Password was updated but email failed'
        });
        console.error(`  ⚠️  Email failed (password was updated): ${emailErr.message}`);
      }

      results.passwordUpdated++;
    }

    const processingTime = Date.now() - startTime;

    return {
      user_id: user.user_id,
      email: user.email,
      name: `${user.f_name || ''} ${user.l_name || ''}`.trim(),
      status: APPLY ? 'completed' : 'dry-run',
      password_updated: APPLY,
      email_sent: APPLY,
      new_password: APPLY ? newPassword : '[HIDDEN_IN_DRY_RUN]',
      processing_time_ms: processingTime
    };

  } catch (err) {
    results.failed++;
    const processingTime = Date.now() - startTime;

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
      status: 'failed',
      error: err.message,
      processing_time_ms: processingTime
    };
  }
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now();

  console.log('='.repeat(60));
  console.log('🔐 Password Reset - Clinicians with Email Notification');
  console.log('='.repeat(60));
  console.log(`Mode: ${APPLY ? '✅ APPLY (Live)' : '🔍 DRY RUN (Preview)'}`);
  console.log(`Fresh Start: ${FRESH_START ? 'Yes' : 'No (Resume)'}`);
  console.log(`Rate: ${USERS_PER_MINUTE} users/minute (30s delay between each)`);
  console.log(`Processing: Only clinicians (ut_id_fk=${CLINICIAN_TYPE_ID})`);
  console.log('='.repeat(60));

  // Validate email service if in apply mode
  if (APPLY) {
    const emailValid = await validateEmailService();
    if (!emailValid) {
      console.error('❌ Cannot proceed with --apply due to email service issues');
      await prisma.$disconnect();
      process.exit(1);
    }
  }

  // Load previous progress
  const processedUsers = loadProgress();
  if (processedUsers.size > 0) {
    console.log(`📌 Resuming: ${processedUsers.size} clinicians already processed`);
  }

  // Fetch clinicians
  const users = await fetchClinicians();

  // Filter out already processed users
  const remainingUsers = users.filter(u => !processedUsers.has(u.user_id));

  if (remainingUsers.length === 0) {
    console.log('✅ All clinicians have been processed already!');
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log(`\n📋 Processing ${remainingUsers.length} clinicians with email notification...`);
  console.log(`⏱️  Estimated time: ~${Math.ceil(remainingUsers.length / USERS_PER_MINUTE)} minutes\n`);

  // Results tracking
  const results = {
    total: remainingUsers.length,
    passwordUpdated: 0,
    emailSent: 0,
    emailFailed: 0,
    failed: 0,
    skipped: processedUsers.size,
    processed: [],
    startTime: new Date().toISOString()
  };

  // Process users with rate limiting
  for (let i = 0; i < remainingUsers.length; i++) {
    const user = remainingUsers[i];

    console.log(`\n[${i + 1}/${remainingUsers.length}] Processing ${user.email}...`);
    console.log(`  Name: ${user.f_name || ''} ${user.l_name || ''}`);

    // Process user
    const result = await processClinician(user, results);
    results.processed.push(result);

    // Update progress
    processedUsers.add(user.user_id);
    saveProgress(processedUsers);

    // Log result
    if (result.status === 'completed') {
      console.log(`  ✅ Success (${result.processing_time_ms}ms)`);
    } else if (result.status === 'failed') {
      console.log(`  ❌ Failed: ${result.error}`);
    } else {
      console.log(`  🔍 Dry run - would process`);
    }

    // Rate limiting - wait between users (except last one)
    if (i < remainingUsers.length - 1) {
      const waitSeconds = DELAY_BETWEEN_USERS_MS / 1000;
      console.log(`  ⏳ Waiting ${waitSeconds}s before next clinician...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_USERS_MS));
    }
  }

  // Generate final report
  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
  results.endTime = new Date().toISOString();
  results.totalTimeMinutes = parseFloat(totalTime);

  // Save detailed results
  const resultsData = {
    summary: {
      mode: APPLY ? 'apply' : 'dry-run',
      total_clinicians: users.length,
      processed_this_run: results.total,
      skipped_previously: results.skipped,
      passwords_updated: results.passwordUpdated,
      emails_sent: results.emailSent,
      emails_failed: results.emailFailed,
      completely_failed: results.failed,
      total_time_minutes: totalTime,
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
  console.log(`Total clinicians: ${resultsData.summary.total_clinicians}`);
  console.log(`Previously processed: ${resultsData.summary.skipped_previously}`);
  console.log(`Processed this run: ${resultsData.summary.processed_this_run}`);
  console.log(`Passwords updated: ${resultsData.summary.passwords_updated}`);
  console.log(`Emails sent: ${resultsData.summary.emails_sent}`);
  console.log(`Emails failed: ${resultsData.summary.emails_failed}`);
  console.log(`Completely failed: ${resultsData.summary.completely_failed}`);
  console.log(`Total time: ${resultsData.summary.total_time_minutes} minutes`);
  console.log(`\n📁 Detailed results saved to: ${RESULTS_FILE}`);
  console.log(`📁 Progress saved to: ${PROGRESS_FILE}`);
  if (resultsData.summary.emails_failed > 0 || resultsData.summary.completely_failed > 0) {
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