const express = require("express");
const router = express.Router();
const contractController = require("../controllers/contractController");
const { authenticateToken } = require("../middleware/auth");

// ... existing routes ...

// Update contract status
router.put(
  "/status",
  authenticateToken,
  contractController.updateContractStatus
);

module.exports = router;
