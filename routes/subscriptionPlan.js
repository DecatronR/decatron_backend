const express = require("express");
const router = express.Router();
const {
  create,
  deleteRecord,
  fetch,
} = require("../controllers/subscriptionPlanController");
const { getAvailableSubscriptionPlans } = require("../utils/paymentUtils");
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

// New route to get available plans for registration
router.get("/getAvailablePlans", async (req, res) => {
  try {
    const result = await getAvailableSubscriptionPlans();
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Available plans retrieved successfully",
      data: result.plans,
    });
  } catch (error) {
    console.error("Error getting available plans:", error);
    return res.status(500).json({
      responseCode: 500,
      responseMessage: "Failed to retrieve available plans",
    });
  }
});

module.exports = router;
