const express = require("express");
const router = express.Router();
const {
  create,
  edit,
  update,
  fetch,
  deleteRecord,
} = require("../controllers/myScheduleController");
const { body, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/create",
  requireAuth, // Ensure authentication middleware is still used
  [
    body("userId").notEmpty().withMessage("User ID field is required"),

    // Validate that availability is an array and not empty
    body("availability")
      .isArray({ min: 1 })
      .withMessage("Availability array is required"),

    // Validate that each availability entry has a date and a non-empty time array
    body("availability.*.date")
      .notEmpty()
      .withMessage("Date field is required for each availability"),
    body("availability.*.time")
      .isArray({ min: 1 })
      .withMessage("Time array is required for each availability"),
    body("availability.*.time.*")
      .notEmpty()
      .withMessage("Each time slot must not be empty"),
  ],
  create
);

router.post(
  "/edit",
  requireAuth,
  [body("id").notEmpty().withMessage("ID field is required")],
  edit
);

router.post(
  "/update",
  requireAuth,
  [
    body("id").notEmpty().withMessage("ID field is required"),
    body("date").notEmpty().withMessage("Date field is required"),
    body("time").notEmpty().withMessage("Time field is required"),
  ],
  update
);

router.get("/fetch", fetch);
router.post(
  "/deleteRecord",
  requireAuth,
  [body("id").notEmpty().withMessage("ID field is required")],
  deleteRecord
);

module.exports = router;
