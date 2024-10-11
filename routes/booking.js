const express = require("express");
const router = express.Router();
const { create, deleteData } = require("../controllers/bookingController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/book",
  requireAuth,
  [
    body("propertyID").notEmpty().withMessage("Property ID field is required"),
    body("userID").notEmpty().withMessage("User ID field is required"),
    body("agentID").notEmpty().withMessage("Agent ID field is required"),
    body("bookingDateTime")
      .notEmpty()
      .withMessage("Booking date and time is required"),
  ],
  create
);

// router.post(
//   "/getReview",
//   requireAuth,
//   [body("propertyID").notEmpty().withMessage("property ID field is required")],
//   getReview
// );

router.post(
  "/deleteBooking",
  requireAuth,
  [body("id").notEmpty().withMessage("ID field is required")],
  deleteData
);

module.exports = router;
