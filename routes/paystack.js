const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  initializeUpgradePayment,
} = require("../controllers/paystackController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

// For new user registrations (after OTP verification)
router.post(
  "/initializePayment",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("subscriptionPlanID")
      .notEmpty()
      .withMessage("Subscription plan ID is required"),
  ],
  initializePayment
);

// For existing user upgrades
router.post(
  "/initializeUpgradePayment",
  requireAuth,
  [
    body("userId").notEmpty().withMessage("User ID is required"),
    body("planName").notEmpty().withMessage("Plan name is required"),
  ],
  initializeUpgradePayment
);

router.post(
  "/verifyPayment",
  [body("referenceId").notEmpty().withMessage("Reference ID is required")],
  verifyPayment
);

module.exports = router;
