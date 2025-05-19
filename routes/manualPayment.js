const express = require("express");
const router = express.Router();
const {
  create,
  getManualPayments,
  getPaymentsByContract,
  getUserPaymentByContract,
  updatePaymentStatus,
  getPaymentById,
} = require("../controllers/manualPaymentController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");
const { attachUserDetails } = require("../middleware/attachUserDetails");
const { requireAdmin } = require("../middleware/requireAdmin");

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
  // requireAdmin,
  getManualPayments
);

router.post(
  "/getPaymentsByContract",
  requireAuth,
  attachUserDetails,
  // requireAdmin,
  [body("contractId").notEmpty().withMessage("Contract ID is required")],
  getPaymentsByContract
);

router.post(
  "/getUserPaymentByContract",
  requireAuth,
  attachUserDetails,
  [body("contractId").notEmpty().withMessage("Contract ID is required")],
  getUserPaymentByContract
);

router.post(
  "/updatePaymentStatus",
  requireAuth,
  attachUserDetails,
  // requireAdmin,
  [
    body("paymentId").notEmpty().withMessage("Payment ID is required"),
    body("status").notEmpty().withMessage("Status is required"),
  ],
  updatePaymentStatus
);

router.post(
  "/getPaymentById",
  requireAuth,
  attachUserDetails,
  // requireAdmin,
  [body("paymentId").notEmpty().withMessage("Payment ID is required")],
  getPaymentById
);

router.post(
  "/verifyReceiptById",
  [body("paymentId").notEmpty().withMessage("Payment ID is required")],
  verifyReceiptById
);

module.exports = router;
