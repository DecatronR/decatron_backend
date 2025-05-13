const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  createSignature,
  fetchSignatureByContract,
  fetchSignedRoles,
  sendWitnessInvite,
  validateWitnessSignatureLink,
} = require("../controllers/eSignatureController");
const { requireAuth, optionalAuth } = require("../middleware/authMiddleware");
const { attachUserDetails } = require("../middleware/attachUserDetails");
const validateWitnessToken = require("../middleware/validateWitnessToken");

const router = express.Router();

// Create signature event
router.post(
  "/create",
  optionalAuth,
  attachUserDetails,
  upload.single("signatureImage"),
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
      .withMessage("Invalid signer role")
      .custom((value, { req }) => {
        // If it's a witness role, ensure witness details are provided
        if (value.includes("Witness")) {
          if (!req.body.witnessName || !req.body.witnessEmail) {
            throw new Error(
              "Witness name and email are required for witness signatures"
            );
          }
        }
        return true;
      }),
    body("witnessName")
      .optional()
      .custom((value, { req }) => {
        if (req.body.role.includes("Witness") && !value) {
          throw new Error("Witness name is required for witness signatures");
        }
        return true;
      }),
    body("witnessEmail")
      .optional()
      .isEmail()
      .custom((value, { req }) => {
        if (req.body.role.includes("Witness") && !value) {
          throw new Error(
            "Valid witness email is required for witness signatures"
          );
        }
        return true;
      }),
    body("timestamp").notEmpty().withMessage("Timestamp is required"),
    body("device").notEmpty().withMessage("Device is required"),
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

router.post(
  "/sendWitnessInvite",
  requireAuth,
  attachUserDetails,
  [
    body("contractId").notEmpty(),
    body("witnessName").notEmpty(),
    body("witnessEmail").isEmail(),
    body("role").notEmpty(),
  ],
  sendWitnessInvite
);

// Validate witness signature link
router.get(
  "/validateSignatureLink",
  validateWitnessToken,
  validateWitnessSignatureLink
);

module.exports = router;
