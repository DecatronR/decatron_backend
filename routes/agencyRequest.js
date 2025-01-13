const express = require("express");
const router = express.Router();
const {
  create,
  deleteRequest,
  agentRequest,
  ownerRequest,
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

// router.get("/getRoles", fetchRole);

module.exports = router;
