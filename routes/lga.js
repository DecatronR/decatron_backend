const express = require("express");
const router = express.Router();
const {
  createLGA,
  editLGA,
  updateLGA,
  fetchLGA,
  deleteLGA,
} = require("../controllers/lgaController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/createLGA",
  requireAuth,
  [body("stateId").notEmpty().withMessage("StateId field is required")],
  [body("lga").notEmpty().withMessage("LGA Name field is required")],
  createLGA
);

router.post(
  "/editLGA",
  requireAuth,
  [body("id").notEmpty().withMessage("LGA ID field is required")],
  editLGA
);

router.post(
  "/updateLGA",
  requireAuth,
  [
    body("id").notEmpty().withMessage("LGA ID field is required"),
    body("lga").notEmpty().withMessage("LGA field is required"),
    body("stateId").notEmpty().withMessage("State Id field is required"),
  ],
  updateLGA
);

router.get("/fetchLGA", fetchLGA);
router.post(
  "/deleteLGA",
  requireAuth,
  [body("id").notEmpty().withMessage("LGA ID field is required")],
  deleteLGA
);

module.exports = router;
