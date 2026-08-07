/**
 * sync-emails-from-csv.js
 *
 * Matches rows in authenticator_andeuser.csv (column: username) against
 * dc_users.f_name, and updates dc_users.email with the CSV email —
 * but ONLY when the CSV email is present (skips blank / "NULL" values).
 *
 * USAGE
 *   node sync-emails-from-csv.js               -> dry run (prints what WOULD happen, no writes)
 *   node sync-emails-from-csv.js --apply        -> actually performs the updates
 *
 * Place this file in your project root (next to authenticator_andeuser.csv)
 * so it can reach your existing Prisma client. Adjust the import path below
 * if your PrismaClient isn't at the default location.
 *
 * Requires: npm install csv-parse   (Prisma Client should already be in your project)
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CSV_PATH = path.join(__dirname, 'authenticator_andeuser.csv');
const APPLY = process.argv.includes('--apply');

// Treat these as "no email provided" -> never touch dc_users.email for these rows
function isBlankEmail(raw) {
    if (raw === null || raw === undefined) return true;
    const v = String(raw).trim();
    if (v === '') return true;
    if (v.toUpperCase() === 'NULL') return true;
    return false;
}

// Very light email sanity check so we don't write obvious garbage into a unique column
function looksLikeEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

async function main() {
    if (!fs.existsSync(CSV_PATH)) {
        console.error(`CSV not found at ${CSV_PATH}`);
        process.exit(1);
    }

    const raw = fs.readFileSync(CSV_PATH, 'utf8');
    const rows = parse(raw, {
        columns: true,
        skip_empty_lines: true,
    });

    console.log(`Loaded ${rows.length} CSV rows.`);
    console.log(APPLY ? '*** APPLY MODE: writes will be committed ***' : 'DRY RUN (no writes) — pass --apply to commit changes');
    console.log('----------------------------------------------------');

    let matchedRows = 0;
    let updated = 0;
    let skippedBlankEmail = 0;
    let skippedNoMatch = 0;
    let skippedAmbiguous = 0;
    let skippedBadEmailFormat = 0;
    let skippedAlreadySame = 0;
    const errors = [];

    for (const row of rows) {
        const username = (row.username || '').trim();
        if (!username) continue;

        const rawEmail = row.email;

        if (isBlankEmail(rawEmail)) {
            skippedBlankEmail++;
            continue; // never touch dc_users.email when csv email is empty/NULL
        }

        const email = String(rawEmail).trim().toLowerCase();

        if (!looksLikeEmail(email)) {
            skippedBadEmailFormat++;
            console.log(`[SKIP bad-format] username="${username}" email="${rawEmail}"`);
            continue;
        }

        // Find dc_users rows whose f_name matches this username (case-insensitive, exact)
        const candidates = await prisma.dc_users.findMany({
            where: { f_name: { equals: username } }, // case sensitivity follows your DB collation
            select: { user_id: true, f_name: true, email: true },
        });

        if (candidates.length === 0) {
            skippedNoMatch++;
            continue;
        }

        if (candidates.length > 1) {
            skippedAmbiguous++;
            console.log(`[SKIP ambiguous] username="${username}" matched ${candidates.length} dc_users rows (user_ids: ${candidates.map(c => c.user_id).join(', ')}) — resolve manually`);
            continue;
        }

        matchedRows++;
        const user = candidates[0];

        if (user.email && user.email.toLowerCase() === email) {
            skippedAlreadySame++;
            continue;
        }

        console.log(`[${APPLY ? 'UPDATE' : 'WOULD UPDATE'}] user_id=${user.user_id} f_name="${user.f_name}" email: "${user.email}" -> "${email}"`);

        if (APPLY) {
            try {
                await prisma.dc_users.update({
                    where: { user_id: user.user_id },
                    data: { email },
                });
                updated++;
            } catch (err) {
                // Most likely cause: another dc_users row already owns this email (unique constraint)
                errors.push({ username, user_id: user.user_id, email, error: err.message });
                console.log(`[ERROR] user_id=${user.user_id} email="${email}" -> ${err.message}`);
            }
        } else {
            updated++; // count as "would update" in dry run
        }
    }

    console.log('----------------------------------------------------');
    console.log('Summary:');
    console.log(`  CSV rows total:            ${rows.length}`);
    console.log(`  Skipped (blank/NULL email):${skippedBlankEmail}`);
    console.log(`  Skipped (bad email format):${skippedBadEmailFormat}`);
    console.log(`  Skipped (no f_name match): ${skippedNoMatch}`);
    console.log(`  Skipped (ambiguous match): ${skippedAmbiguous}`);
    console.log(`  Skipped (already same):    ${skippedAlreadySame}`);
    console.log(`  Matched & ${APPLY ? 'updated' : 'would update'}:      ${updated}`);
    console.log(`  Errors (e.g. unique conflict): ${errors.length}`);

    if (errors.length) {
        fs.writeFileSync(path.join(__dirname, 'sync-emails-errors.json'), JSON.stringify(errors, null, 2));
        console.log('Details written to sync-emails-errors.json');
    }

    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});