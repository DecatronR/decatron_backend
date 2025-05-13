const crypto = require("crypto");
const {
  prepareDocumentState,
  validateDocumentState,
} = require("./documentState");

/**
 * Creates a SHA-256 hash of the document and its audit trail
 * @param {Object} document - The document metadata
 * @param {Array} auditTrail - The audit trail of signatures
 * @param {Array} signatures - Array of signature data including the actual signature images
 * @returns {String} - The SHA-256 hash
 */
const hashDocument = (document, auditTrail, signatures) => {
  // Prepare the document state
  const documentState = prepareDocumentState(document);

  // Create a string representation of the document, audit trail, and signatures
  const documentString = JSON.stringify({
    document: documentState, // Includes agreement data
    auditTrail: auditTrail,
    signatures: signatures.map((sig) => ({
      role: sig.role,
      signature: sig.signature, // The actual signature image
      timestamp: sig.timestamp,
      user: sig.user
        ? {
            id: sig.user.id,
            email: sig.user.email,
            name: sig.user.name,
          }
        : null,
      witness: sig.witness
        ? {
            name: sig.witness.name,
            email: sig.witness.email,
            signature: sig.witness.signature, // The witness signature image
            timestamp: sig.witness.timestamp,
          }
        : null,
    })),
  });

  return crypto.createHash("sha256").update(documentString).digest("hex");
};

/**
 * Verifies if a document's current state matches its stored hash
 * @param {Object} document - The current document state
 * @param {Array} auditTrail - The current audit trail
 * @param {Array} signatures - The current signatures
 * @param {String} storedHash - The hash stored in the database
 * @returns {Object} - Verification result with details
 */
const verifyDocumentHash = (document, auditTrail, signatures, storedHash) => {
  const currentHash = hashDocument(document, auditTrail, signatures);
  const isVerified = currentHash === storedHash;

  return {
    isVerified,
    currentHash,
    storedHash,
    timestamp: new Date().toISOString(),
    details: isVerified
      ? "Document integrity verified - no tampering detected"
      : "Document integrity check failed - possible tampering detected",
  };
};

module.exports = {
  hashDocument,
  verifyDocumentHash,
};
