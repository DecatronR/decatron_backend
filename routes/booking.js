const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBooking,
  getUserBookings,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

// Route to create a booking
router.post(
  "/book",
  requireAuth,
  [
    body("userID").notEmpty().withMessage("User ID field is required"),
    body("agentID").notEmpty().withMessage("Agent ID field is required"),
    body("propertyID").notEmpty().withMessage("Property ID field is required"),
    body("bookingDateTime").notEmpty().withMessage("Invalid date format"), // Ensure the date is in ISO 8601 format
  ],
  createBooking
);

// Route to get a booking by ID
router.post(
  "/getMyBooking",
  requireAuth,
  [body("id").notEmpty().withMessage("ID field is required")],
  getBooking
);

// Route to update a booking by ID
router.post(
  "/updateBooking",
  requireAuth,
  [
    body("id").notEmpty().withMessage("ID field is required"),
    body("userID").optional(),
    body("agentID").optional(),
    body("propertyID").optional(),
    body("bookingDateTime")
      .optional()
      .isISO8601()
      .withMessage("Invalid date format"),
  ],
  updateBooking
);

// Route to get all bookings for a specific user

router.post(
  "/userBookings",
  requireAuth,
  [body("userID").notEmpty().withMessage("User ID field is required")],
  getUserBookings
);

// Route to delete a booking
router.post(
  "/deleteBooking",
  requireAuth,
  [body("id").notEmpty().withMessage("ID field is required")],
  deleteBooking
);

module.exports = router;
