const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};




const BCRYPT_SALT_ROUNDS = 12; 
/**
 * Verifies a Django pbkdf2_sha256 hash.
 * Format: pbkdf2_sha256$<iterations>$<salt>$<base64hash>
 */
function verifyDjangoPbkdf2(password, hash) {
  const parts = hash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return false;

  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const expectedHash = parts[3];

  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
  const derivedHashB64 = derivedKey.toString("base64");

  // Constant-time comparison to avoid timing attacks.
  const a = Buffer.from(derivedHashB64);
  const b = Buffer.from(expectedHash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}


const comparePassword = async (password, hash) => {
  if (!hash) return { valid: false, newHash: null };

  // 1. Try bcrypt first — this is the normal/expected path for accounts
  // already on the new system (new signups, or users already re-hashed).
  const bcryptMatch = await bcrypt.compare(password, hash);
  if (bcryptMatch) {
    return { valid: true, newHash: null };
  }

  // 2. Fall back to Django's pbkdf2_sha256 format (legacy migrated accounts).
  if (hash.startsWith("pbkdf2_sha256$")) {
    const djangoMatch = verifyDjangoPbkdf2(password, hash);
    if (djangoMatch) {
      const newHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      return { valid: true, newHash };
    }
  }

  // 3. Neither format matched.
  return { valid: false, newHash: null };
};



module.exports = { hashPassword, comparePassword };
