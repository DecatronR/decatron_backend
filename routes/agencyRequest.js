const express = require("express");
const router = express.Router();
const {
  create,
  deleteRequest,
  agentRequest,
  ownerRequest,
  updateStatus,
  agencyPropertyStatus,
} = require("../controllers/agencyRequestController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/create",
  requireAuth,
  [
    body("agentId").notEmpty().withMessage("Agent ID field is required"),
    body("propertyListingId")
      .notEmpty()
      .withMessage("Property Listing ID field is required"),
    body("status").notEmpty().withMessage("Status field is required"),
    body("ownerId").notEmpty().withMessage("Owner ID field is required"),
  ],
  create
);

router.post(
  "/agentRequest",
  requireAuth,
  [body("requestAgentId").notEmpty().withMessage("Agent ID field is required")],
  agentRequest
);
router.post(
  "/agencyUpdateStatus",
  requireAuth,
  [
    body("id").notEmpty().withMessage("ID field is required"),
    body("status").notEmpty().withMessage("Status field is required"),
  ],
  updateStatus
);

router.post(
  "/ownerRequest",
  requireAuth,
  [body("ownerId").notEmpty().withMessage("Owner ID field is required")],
  ownerRequest
);

router.post(
  "/delete",
  requireAuth,
  [body("requestId").notEmpty().withMessage("ID field is required")],
  deleteRequest
);
router.post(
  "/agencyPropertyStatus",
  requireAuth,
  [
    body("propertyListingId")
      .notEmpty()
      .withMessage("Property ID field is required"),
    body("agentId").notEmpty().withMessage("Agent ID field is required"),
  ],
  agencyPropertyStatus
);

// router.get("/getRoles", fetchRole);

module.exports = router;
