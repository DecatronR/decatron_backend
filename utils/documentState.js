/**
 * Prepares a document state for hashing by removing system fields and ensuring consistent structure
 * @param {Object} document - The document to prepare
 * @returns {Object} - The prepared document state
 */
const prepareDocumentState = (document) => {
  // Convert Mongoose document to plain object if needed
  const docState = document.toObject ? document.toObject() : { ...document };

  // Fields to exclude from hashing
  const excludeFields = [
    "__v", // Mongoose version key
    "_id", // MongoDB ID
    "documentHash", // Current hash
    "documentContent", // Current content
    "auditTrail", // Current audit trail
    "createdAt", // System timestamp
    "updatedAt", // System timestamp
    "deletedAt", // Soft delete timestamp
    "isDeleted", // Soft delete flag
    "lastModifiedBy", // System tracking
    "lastModifiedAt", // System tracking
  ];

  // Remove excluded fields
  excludeFields.forEach((field) => {
    delete docState[field];
  });

  // Sort object keys for consistent hashing
  return Object.keys(docState)
    .sort()
    .reduce((acc, key) => {
      acc[key] = docState[key];
      return acc;
    }, {});
};

/**
 * Validates that all required fields are present in the document state
 * @param {Object} documentState - The document state to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {boolean} - Whether the document state is valid
 */
const validateDocumentState = (documentState, requiredFields) => {
  return requiredFields.every((field) => {
    const value = documentState[field];
    return value !== undefined && value !== null;
  });
};

module.exports = {
  prepareDocumentState,
  validateDocumentState,
};
