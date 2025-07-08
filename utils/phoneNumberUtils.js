/**
 * Phone Number Normalization Utility
 * Ensures consistent phone number format across the entire application
 */

/**
 * Normalizes a phone number to standard Nigerian format (234XXXXXXXXX)
 * @param {string} phone - The phone number to normalize
 * @returns {string|null} - Normalized phone number or null if invalid
 */
function normalizePhoneNumber(phone) {
  if (!phone) return null;

  // Remove WhatsApp prefix if present
  let normalized = phone.replace(/^whatsapp:/, "");

  // Remove all whitespace and special characters
  normalized = normalized.replace(/\s+/g, "").replace(/[^\d]/g, "");

  // Handle Nigerian numbers specifically
  // If it starts with 0, replace with 234
  if (normalized.startsWith("0")) {
    normalized = "234" + normalized.substring(1);
  }

  // If it starts with +234, remove the +
  if (normalized.startsWith("+234")) {
    normalized = normalized.substring(1);
  }

  // Ensure it's a valid Nigerian number (234 + 10 digits = 13 total)
  if (normalized.startsWith("234") && normalized.length === 13) {
    return normalized;
  }

  // If it's already 11 digits starting with 234, return as is
  if (normalized.length === 11 && normalized.startsWith("234")) {
    return normalized;
  }

  // Log unexpected format for debugging
  console.log("Phone number normalization warning:", phone, "->", normalized);

  return normalized;
}

/**
 * Validates if a phone number is in the correct Nigerian format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid Nigerian number
 */
function isValidNigerianPhone(phone) {
  const normalized = normalizePhoneNumber(phone);
  return normalized && normalized.startsWith("234") && normalized.length === 13;
}

/**
 * Formats a phone number for display (e.g., +234 806 324 7818)
 * @param {string} phone - The phone number to format
 * @returns {string} - Formatted phone number
 */
function formatPhoneForDisplay(phone) {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return phone;

  // Format as +234 806 324 7818
  return `+${normalized.substring(0, 3)} ${normalized.substring(
    3,
    6
  )} ${normalized.substring(6, 9)} ${normalized.substring(9)}`;
}

module.exports = {
  normalizePhoneNumber,
  isValidNigerianPhone,
  formatPhoneForDisplay,
};
