const express = require("express");
const router = express.Router();
const {
  create,
  edit,
  update,
  fetch,
  deleteRecord,
} = require("../controllers/myScheduleController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/create",
  requireAuth,
  [body("userId").notEmpty().withMessage("User ID field is required")],
  [body("date").notEmpty().withMessage("Date  field is required")],
  [body("time").notEmpty().withMessage("Time  field is required")],
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

router.get("/fetch", requireAuth, fetch);
router.post(
  "/deleteRecord",
  requireAuth,
  [body("id").notEmpty().withMessage("ID field is required")],
  deleteRecord
);

module.exports = router;
