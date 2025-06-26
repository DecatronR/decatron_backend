const express = require("express");
const router = express.Router();
const {
  createPropertyRequest,
  getAllPropertyRequests,
  getPropertyRequestsByUser,
  getPropertyRequestsByPhone,
  updatePropertyRequest,
} = require("../controllers/propertyRequestController");
const { requireAuth } = require("../middleware/authMiddleware");

// Create a new property request
router.post("/", createPropertyRequest);

// Fetch all property requests (with filtering, sorting, pagination)
router.get("/", requireAuth, getAllPropertyRequests);

// Fetch property requests by userId
router.get("/user/:userId", getPropertyRequestsByUser);

// Fetch property requests by phone
router.get("/phone/:phone", getPropertyRequestsByPhone);

// Update a property request by id
router.patch("/:id", updatePropertyRequest);

module.exports = router;
