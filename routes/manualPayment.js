const express = require("express");
const router = express.Router();
const { create } = require("../controllers/manualPaymentController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");
const { attachUser } = require("../middleware/attachUser");

router.post(
  "/create",
  requireAuth,
  attachUser,
  [
    body("contractId").notEmpty().withMessage("Contract ID is required"),
    body("accountName").notEmpty().withMessage("Account name is required"),
    body("accountNumber").notEmpty().withMessage("Account number is required"),
    body("bankName").notEmpty().withMessage("Bank name is required"),
    body("amount").notEmpty().withMessage("Amount is required"),
  ],
  create
);

module.exports = router;
