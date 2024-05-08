const express = require("express");
const router = express.Router();
const {
  createPropertyType,
  editPropertyType,
  updatePropertyType,
  fetchPropertyType,
  deletePropertyType,
} = require("../controllers/propertyTypeController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/createPropertyType",
  requireAuth,
  [
    body("propertyType")
      .notEmpty()
      .withMessage("Property Type Name field is required"),
  ],
  createPropertyType
);

router.post(
  "/editPropertyType",
  requireAuth,
  [body("id").notEmpty().withMessage("Property Type ID field is required")],
  editPropertyType
);

router.post(
  "/updatePropertyType",
  requireAuth,
  [
    body("id").notEmpty().withMessage("Property Type ID field is required"),
    body("propertyType")
      .notEmpty()
      .withMessage("Property Type field is required"),
  ],
  updatePropertyType
);

router.get("/fetchPropertyType", requireAuth, fetchPropertyType);
router.post(
  "/deletePropertyType",
  requireAuth,
  [body("id").notEmpty().withMessage("Property Type ID field is required")],
  deletePropertyType
);

module.exports = router;
