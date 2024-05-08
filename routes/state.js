const express = require("express");
const router = express.Router();
const {
  createState,
  editState,
  updateState,
  fetchState,
  deleteState,
} = require("../controllers/stateController");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

router.post(
  "/createState",
  requireAuth,
  [
    body("state")
      .notEmpty()
      .withMessage("State Name field is required"),
  ],
  createState
);

router.post(
  "/editState",
  requireAuth,
  [body("id").notEmpty().withMessage("State ID field is required")],
  editState
);

router.post(
  "/updateState",
  requireAuth,
  [
    body("id").notEmpty().withMessage("State ID field is required"),
    body("state")
      .notEmpty()
      .withMessage("State field is required"),
  ],
  updateState
);

router.get("/fetchState", requireAuth, fetchState);
router.post(
  "/deleteState",
  requireAuth,
  [body("id").notEmpty().withMessage("State ID field is required")],
  deleteState
);

module.exports = router;
