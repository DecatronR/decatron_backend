const express = require("express");
const router = express.Router();
const {
  create,
  getManualPayments,
} = require("../controllers/manualPaymentController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");
const { attachUserDetails } = require("../middleware/attachUserDetails");

router.post(
  "/create",
  requireAuth,
  attachUserDetails,
  [
    body("contractId").notEmpty().withMessage("Contract ID is required"),
    body("accountName").notEmpty().withMessage("Account name is required"),
    body("accountNumber").notEmpty().withMessage("Account number is required"),
    body("bankName").notEmpty().withMessage("Bank name is required"),
    body("amount").notEmpty().withMessage("Amount is required"),
  ],
  create
);

router.get(
  "/getManualPayments",
  requireAuth,
  attachUserDetails,
  getManualPayments
);

module.exports = router;
