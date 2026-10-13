const crypto = require('crypto');

const OTP_SECRET = process.env.JWT_SECRET || 'pesitm_smart_lab_otp_secret_2026';

/**
 * Validates and normalizes email address (trimmed & lowercased)
 */
function normalizeAndValidateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Valid email address is required');
  }
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    throw new Error('Invalid email address format');
  }
  return clean;
}

/**
 * Generates a cryptographically secure 6-digit numerical OTP code
 */
function generateSecureOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Computes SHA-256 hash of the OTP code
 */
function hashOtp(code) {
  return crypto.createHash('sha256').update(code + OTP_SECRET).digest('hex');
}

/**
 * Safely compares candidate OTP code against stored SHA-256 hash
 */
function verifyOtpHash(candidateCode, storedHash) {
  if (!candidateCode || !storedHash) return false;
  const candidateHash = hashOtp(candidateCode);
  return crypto.timingSafeEqual(Buffer.from(candidateHash), Buffer.from(storedHash));
}

module.exports = {
  normalizeAndValidateEmail,
  generateSecureOtp,
  hashOtp,
  verifyOtpHash,
};
