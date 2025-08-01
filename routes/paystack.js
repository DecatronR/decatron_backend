const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
} = require("../controllers/paystackController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/initializePayment",
  requireAuth,
  [
    body("email").notEmpty().withMessage("Email field is required"),
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("subscriptionPlanID")
      .notEmpty()
      .withMessage("subscriptionPlanID field is required"),
  ],
  initializePayment
);
router.post(
  "/verifyPayment",
  requireAuth,
  [
    body("referenceId")
      .notEmpty()
      .withMessage("Reference ID field is required"),
  ],
  verifyPayment
);

module.exports = router;
