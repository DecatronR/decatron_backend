const express = require("express");
const router = express.Router();
const {
  create,
  getMyFavorites,
  deleteData
} = require("../controllers/favoriteController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/createFavorite",
  requireAuth,
  [body("userId").notEmpty().withMessage("user ID field is required")],
  [body("propertyListingId").notEmpty().withMessage("Property Listing field is required")],
  create
);

router.post(
  "/getMyFavorites",
  requireAuth,
  [body("userId").notEmpty().withMessage("User ID field is required")],
  getMyFavorites
);

router.post(
  "/deleteData",
  requireAuth,
  [body("id").notEmpty().withMessage("ID field is required")],
  deleteData
);

module.exports = router;
