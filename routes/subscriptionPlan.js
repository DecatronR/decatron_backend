const express = require("express");
const router = express.Router();
const {
  create,
  deleteRecord,
  fetch,
} = require("../controllers/subscriptionPlanController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/createSubscriptionPlan",
  requireAuth,
  [
    body("plan").notEmpty().withMessage("Plan field is required"),
    body("period").isNumeric().withMessage("Period must be a number"),
  ],
  create
);

router.post(
  "/deleteSubscriptionPlan",
  requireAuth,
  [body("id").notEmpty().withMessage("ID field is required")],
  deleteRecord
);

router.get("/getSubscriptionPlan", fetch);

module.exports = router;
