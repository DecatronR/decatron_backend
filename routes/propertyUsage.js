const express = require("express");
const router = express.Router();
const {
  createPropertyUsage,
  editPropertyUsage,
  updatePropertyUsage,
  fetchPropertyUsage,
  deletePropertyUsage,
} = require("../controllers/propertyUsageController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/createPropertyUsage",
  requireAuth,
  [
    body("propertyUsage")
      .notEmpty()
      .withMessage("Property Usage Name field is required"),
  ],
  createPropertyUsage
);

router.post(
  "/editPropertyUsage",
  requireAuth,
  [body("id").notEmpty().withMessage("Property Usage field is required")],
  editPropertyUsage
);

router.post(
  "/updatePropertyUsage",
  requireAuth,
  [
    body("id").notEmpty().withMessage("Property Usage field is required"),
    body("propertyUsage")
      .notEmpty()
      .withMessage("Property Usage field is required"),
  ],
  updatePropertyUsage
);

router.get("/fetchPropertyUsage", requireAuth, fetchPropertyUsage);
router.post(
  "/deletePropertyUsage",
  requireAuth,
  [body("id").notEmpty().withMessage("Property Usage ID field is required")],
  deletePropertyUsage
);

module.exports = router;
