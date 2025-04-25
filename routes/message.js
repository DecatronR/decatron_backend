const express = require("express");
const { body } = require("express-validator");
const {
  fetchMessagesByContractId,
} = require("../controllers/messagesController");
const { requireAuth } = require("../middleware/authMiddleware");
const { attachUserDetails } = require("../middleware/attachUserDetails");

const router = express.Router();

// Fetch messages by contractId
router.post(
  "/fetchMessages",
  requireAuth,
  attachUserDetails,
  [body("contractId").notEmpty().withMessage("Contract ID is required")],
  fetchMessagesByContractId
);

module.exports = router;
