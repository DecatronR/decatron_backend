const express = require("express");
const { body } = require("express-validator");
const {
  createContract,
  fetchContractsByClient,
  fetchContractsByOwner,
  fetchContractById,
} = require("../controllers/contractController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Create contract
router.post(
  "/create",
  authenticate,
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
    body("contractAmount")
      .isNumeric()
      .withMessage("Contract amount must be a number"),
    body("terms").notEmpty().withMessage("Terms are required"),
  ],
  createContract
);

router.get("/my-contracts", authenticate, fetchContractsByClient);

router.get("/owner-contracts", authenticate, fetchContractsByOwner);

router.get("/:id", authenticate, fetchContractById);

module.exports = router;
