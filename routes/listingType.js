const express = require("express");
const router = express.Router();
const {
  createListingType,
  editListingType,
  updateListingType,
  fetchListingType,
  deleteListingType
} = require("../controllers/listingTypeController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");


router.post(
  "/createListingType",
  requireAuth,
  [body("listingType").notEmpty().withMessage("Listing Type Name field is required")],
  createListingType
);

router.post(
  "/editListingType",
  requireAuth,
  [body("id").notEmpty().withMessage("Listing Type ID field is required")],
  editListingType
);

router.post(
  "/updateListingType",
  requireAuth,
  [
    body("id").notEmpty().withMessage("Listing Type ID field is required"),
    body("listingType")
      .notEmpty()
      .withMessage("Listing Type field is required"),
  ],
  updateListingType
);

router.get("/fetchListingType", requireAuth, fetchListingType);
router.post(
  "/deleteListingType",
  requireAuth,
  [body("id").notEmpty().withMessage("Listing Type ID field is required")],
  deleteListingType
);


module.exports = router;