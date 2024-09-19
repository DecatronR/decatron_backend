const express = require("express");
const router = express.Router();
const {
  create,
  getReview,
  deleteData
} = require("../controllers/reviewController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/createReview",
  requireAuth,
  [body("propertyID").notEmpty().withMessage("Property ID field is required")],
  [body("userID").notEmpty().withMessage("User ID field is required")],
  [body("message").notEmpty().withMessage("Message field is required")],
  create
);

router.post(
  "/getReview",
  requireAuth,
  [body("propertyID").notEmpty().withMessage("property ID field is required")],
  getReview
);

router.post(
  "/deleteReview",
  requireAuth,
  [body("id").notEmpty().withMessage("ID field is required")],
  deleteData
);

module.exports = router;
