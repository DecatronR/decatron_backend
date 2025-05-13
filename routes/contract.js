const express = require("express");
const { body } = require("express-validator");
const {
  createContract,
  fetchClientContracts,
  fetchOwnerContracts,
  fetchContractById,
  updateAgreement,
  updateContractStatus,
  verifyDocumentIntegrity,
} = require("../controllers/contractController");
const { requireAuth } = require("../middleware/authMiddleware");
const { attachUserDetails } = require("../middleware/attachUserDetails");

const router = express.Router();

// Create contract
router.post(
  "/create",
  requireAuth,
  attachUserDetails,
  [
    body("propertyId").notEmpty().withMessage("Property ID is required"),
    body("propertyName").notEmpty().withMessage("Property Name is required"),
    body("ownerId").notEmpty().withMessage("Owner ID is required"),
    body("ownerName").notEmpty().withMessage("Owner Name is required"),
    body("propertyPrice")
      .isNumeric()
      .withMessage("Property price must be a number"),
    body("propertyLocation")
      .notEmpty()
      .withMessage("Property location is required"),
  ],
  createContract
);

router.get(
  "/clientContracts",
  requireAuth,
  attachUserDetails,
  fetchClientContracts
);

router.get(
  "/ownerContracts",
  requireAuth,
  attachUserDetails,
  fetchOwnerContracts
);

router.post(
  "/fetchContractById",
  requireAuth,
  [body("contractId").notEmpty().withMessage("Contract ID field is required")],
  fetchContractById
);

router.post(
  "/updateAgreement",
  requireAuth,
  [
    body("contractId").notEmpty().withMessage("Contract ID field is required"),
    body("agreement").notEmpty().withMessage("Agreement field is required"),
  ],
  updateAgreement
);

router.post(
  "/updateStatus",
  requireAuth,
  [
    body("contractId").notEmpty().withMessage("Contract ID is required"),
    body("status")
      .isIn(["pending", "active", "completed", "cancelled"])
      .withMessage("Invalid status value"),
  ],
  updateContractStatus
);

// Public verification endpoint for QR code
router.get("/verify/:contractId", verifyDocumentIntegrity);

module.exports = router;
