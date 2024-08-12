const express = require("express");
const router = express.Router();
const {
  createPropertyCondition,
  editPropertyCondition,
  updatePropertyCondition,
  fetchPropertyCondition,
  deletePropertyCondition,
} = require("../controllers/propertyConditionController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/createPropertyCondition",
  requireAuth,
  [
    body("propertyCondition")
      .notEmpty()
      .withMessage("Property Usage Name field is required"),
  ],
  createPropertyCondition
);

router.post(
  "/editPropertyCondition",
  requireAuth,
  [body("id").notEmpty().withMessage("Property Usage field is required")],
  editPropertyCondition
);

router.post(
  "/updatePropertyCondition",
  requireAuth,
  [
    body("id").notEmpty().withMessage("Property Usage field is required"),
    body("propertyCondition")
      .notEmpty()
      .withMessage("Property Usage field is required"),
  ],
  updatePropertyCondition
);

router.get("/fetchPropertyCondition", requireAuth, fetchPropertyCondition);
router.post(
  "/deletePropertyCondition",
  requireAuth,
  [body("id").notEmpty().withMessage("Property Usage ID field is required")],
  deletePropertyCondition
);

module.exports = router;
