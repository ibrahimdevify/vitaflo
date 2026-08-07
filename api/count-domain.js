/**
 * count-domain.js
 * Counts dc_users rows whose email ends with a given domain.
 *
 * USAGE:
 *   node count-domain.js "@cahabamedicalcare.com"
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const domain = process.argv[2];
    if (!domain) {
        console.error('Usage: node count-domain.js "@example.com"');
        process.exit(1);
    }

    // Prisma-friendly version (case sensitivity follows your DB/column collation,
    // which is case-insensitive by default on most MySQL setups)
    const count = await prisma.dc_users.count({
        where: {
            email: { contains: domain },
        },
    });

    console.log(`dc_users with email containing "${domain}": ${count}`);

    // If you specifically need case-INSENSITIVE matching guaranteed regardless
    // of collation, uncomment this raw query instead:
    //
    // const result = await prisma.$queryRawUnsafe(
    //   `SELECT COUNT(*) AS total_count FROM dc_users WHERE email LIKE ?`,
    //   `%${domain}`
    // );
    // console.log(result);

    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});