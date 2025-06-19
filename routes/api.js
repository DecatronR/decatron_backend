const express = require("express");
const router = express.Router();
const { verifyNIN } = require("../controllers/apiController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/verifyNIN",
  requireAuth,
  [body("id").notEmpty().withMessage("id field is required")],
  [body("nin").notEmpty().withMessage("NIN field is required")],
  [body("firstname").notEmpty().withMessage("Firstname field is required")],
  [body("lastname").notEmpty().withMessage("Lastname field is required")],
  verifyNIN
);

module.exports = router;
