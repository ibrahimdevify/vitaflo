const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

function verifyDjangoPbkdf2(password, hash) {
  const parts = hash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return false;

  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const expectedHash = parts[3];

  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
  const derivedHashB64 = derivedKey.toString("base64");

  const a = Buffer.from(derivedHashB64);
  const b = Buffer.from(expectedHash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}


const comparePassword = async (password, hash) => {
  if (!hash) return false;

  // 1. Try bcrypt first.
  const bcryptMatch = await bcrypt.compare(password, hash);
  if (bcryptMatch) return true;

  // 2. Fall back to legacy Django pbkdf2_sha256.
  if (hash.startsWith("pbkdf2_sha256$")) {
    const djangoMatch = verifyDjangoPbkdf2(password, hash);
    if (djangoMatch) {
      // Rehash the SAME plaintext password directly with bcrypt, and wait
      // for it to actually save before confirming the login as valid.
      const newHash = await hashPassword(password);
      await prisma.dc_users.updateMany({
        where: { password: hash },
        data: { password: newHash },
      });
      return true;
    }
  }

  // 3. Neither format matched.
  return false;
};

module.exports = { hashPassword, comparePassword };