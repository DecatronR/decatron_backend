const express = require("express");
const router = express.Router();
const {
  createPropertyListing,
  editPropertyListing,
  updatePropertyListing,
  fetchPropertyListing,
  deletePropertyListing,
  myProperty
} = require("../controllers/propertyListingController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/createPropertyListing",
  requireAuth,
  [
    body("userID").notEmpty().withMessage("user ID field is required"),
    body("title").notEmpty().withMessage("Title field is required"),
    body("listingType").notEmpty().withMessage("listingType field is required"),
    body("usageType").notEmpty().withMessage("usageType field is required"),
    body("propertyType").notEmpty().withMessage("Property Type Name field is required"),
    body("propertySubType").notEmpty().withMessage("propertySubType field is required"),
    body("propertyCondition").notEmpty().withMessage("propertyCondition field is required"),
    body("state").notEmpty().withMessage("state field is required"),
    body("neighbourhood").notEmpty().withMessage("neighbourhood field is required"),
    body("size").notEmpty().withMessage("size field is required"),
    body("lga").notEmpty().withMessage("LGA field is required"),
    body("propertyDetails").notEmpty().withMessage("propertyDetails field is required"),
    body("NoOfLivingRooms").notEmpty().withMessage("NoOfLivingRooms field is required"),
    body("NoOfBedRooms").notEmpty().withMessage("NoOfBedRooms field is required"),
    body("NoOfKitchens").notEmpty().withMessage("NoOfKitchens field is required"),
    body("NoOfParkingSpace").notEmpty().withMessage("NoOfParkingSpace field is required"),
    body("Price").notEmpty().withMessage("Price field is required"),
    body("virtualTour").notEmpty().withMessage("virtualTour field is required"),
    body("video").notEmpty().withMessage("video field is required"),
    body("photo")
    .isArray().withMessage("Photos must be an array")
    .custom((photos) => {
      if (photos.length === 0) {
        throw new Error("Photos array cannot be empty");
      }
      photos.forEach(photo => {
        if (!photo.path || typeof photo.path !== 'string' || photo.path.trim() === '') {
          throw new Error("Each photo must have a valid 'path' property");
        }
      });
      return true;
    })
  ],
  createPropertyListing
);

router.post(
  "/editPropertyListing",
  requireAuth,
  [body("id").notEmpty().withMessage("Property Listing ID field is required")],
  editPropertyListing
);

router.post(
  "/myProperty",
  requireAuth,
  [body("userID").notEmpty().withMessage("User ID field is required")],
  myProperty
);

router.post(
  "/updatePropertyListing",
  requireAuth,
  [
    body("id").notEmpty().withMessage("Property Listing ID field is required"),
    body("title").notEmpty().withMessage("Title field is required"),
    body("listingType").notEmpty().withMessage("listingType field is required"),
    body("usageType").notEmpty().withMessage("usageType field is required"),
    body("propertyType").notEmpty().withMessage("Property Type Name field is required"),
    body("propertySubType").notEmpty().withMessage("propertySubType field is required"),
    body("propertyCondition").notEmpty().withMessage("propertyCondition field is required"),
    body("state").notEmpty().withMessage("state field is required"),
    body("neighbourhood").notEmpty().withMessage("neighbourhood field is required"),
    body("size").notEmpty().withMessage("size field is required"),
    body("lga").notEmpty().withMessage("LGA field is required"),
    body("propertyDetails").notEmpty().withMessage("propertyDetails field is required"),
    body("NoOfLivingRooms").notEmpty().withMessage("NoOfLivingRooms field is required"),
    body("NoOfBedRooms").notEmpty().withMessage("NoOfBedRooms field is required"),
    body("NoOfKitchens").notEmpty().withMessage("NoOfKitchens field is required"),
    body("NoOfParkingSpace").notEmpty().withMessage("NoOfParkingSpace field is required"),
    body("Price").notEmpty().withMessage("Price field is required"),
    body("virtualTour").notEmpty().withMessage("virtualTour field is required"),
    body("video").notEmpty().withMessage("video field is required"),
    body("photo")
    .isArray().withMessage("Photos must be an array")
    .custom((photos) => {
      if (photos.length === 0) {
        throw new Error("Photos array cannot be empty");
      }
      photos.forEach(photo => {
        if (!photo.path || typeof photo.path !== 'string' || photo.path.trim() === '') {
          throw new Error("Each photo must have a valid 'path' property");
        }
      });
      return true;
    })
  ],
  updatePropertyListing
);

router.get("/fetchPropertyListing", requireAuth, fetchPropertyListing);
router.post(
  "/deletePropertyListing",
  requireAuth,
  [body("id").notEmpty().withMessage("Property Listing ID field is required")],
  deletePropertyListing
);

module.exports = router;
