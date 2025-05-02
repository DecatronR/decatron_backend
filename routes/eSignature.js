const express = require("express");
const { body } = require("express-validator");
const {
  createSignature,
  fetchSignatureByContract,
  fetchSignedRoles,
} = require("../controllers/eSignaturesController");
const { requireAuth, optionalAuth } = require("../middleware/authMiddleware");
const { attachUserDetails } = require("../middleware/attachUserDetails");

const router = express.Router();

// Create signature event
router.post(
  "/create",
  optionalAuth,
  attachUserDetails,
  [
    body("contractId").notEmpty().withMessage("Contract ID is required"),
    body("event")
      .isIn(["signed", "viewed", "declined"])
      .withMessage("Invalid event type"),
    body("role")
      .isIn([
        "propertyOwner",
        "tenant",
        "propertyOwnerWitness",
        "tenantWitness",
      ])
      .withMessage("Invalid signer role"),

    body("timestamp").notEmpty().withMessage("Timestamp is required"),
    body("device").notEmpty().withMessage("Device is required"),
    body("signature")
      .notEmpty()
      .withMessage("Signature (base64 string) is required"),
  ],
  createSignature
);
// Fetch events for a contract
router.post(
  "/fetchByContract",
  requireAuth,
  [body("contractId").notEmpty().withMessage("Contract ID is required")],
  fetchSignatureByContract
);

router.post(
  "/fetchSignedRoles",
  requireAuth,
  [body("contractId").notEmpty().withMessage("Contract ID is required")],
  fetchSignedRoles
);

module.exports = router;
