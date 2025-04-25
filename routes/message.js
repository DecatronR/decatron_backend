const express = require("express");
const { body } = require("express-validator");
const {
  fetchMessagesByContractId,
} = require("../controllers/messagesController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/fetchMessages",
  requireAuth,
  [body("contractId").notEmpty().withMessage("Contract ID is required")],
  fetchMessagesByContractId
);

module.exports = router;
