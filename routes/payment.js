const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  webhookHandler,
  verifyPayment,
} = require("../controllers/paymentController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/initiate-payment",
  requireAuth,
  [
    body("amount").notEmpty().withMessage("Amount is required"),
    body("customerName").notEmpty().withMessage("Customer Name is required"),
    body("customerEmail").isEmail().withMessage("Valid Email is required"),
    body("paymentDescription")
      .optional()
      .isString()
      .withMessage("Invalid Payment Description"),
    body("paymentReference")
      .notEmpty()
      .withMessage("Payment Reference is required"),
  ],
  initiatePayment
);

router.post("/webhook", webhookHandler);

router.get("/verify-payment", (req, res, next) => {
  const { paymentReference } = req.query;

  if (!paymentReference) {
    return res.status(400).json({ message: "Payment Reference is required" });
  }

  verifyPayment(req, res);
});

module.exports = router;
