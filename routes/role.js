const express = require("express");
const router = express.Router();
const {
  createRole,
  editRole,
  updateRole,
  deleteRole
} = require("../controllers/roleController");
const { body } = require("express-validator");
const { requireAuth, checkUser } = require("../middleware/authMiddleware");

router.post(
  "/createRole",
  requireAuth,
  [body("roleName").notEmpty().withMessage("Role Name field is required")],
  createRole
);

router.post(
  "/editRole",
  requireAuth,
  [body("roleId").notEmpty().withMessage("Role ID field is required")],
  editRole
);

router.post(
  "/updateRole",
  requireAuth,
  [
    body("roleId").notEmpty().withMessage("Role ID field is required"),
    body("roleName").notEmpty().withMessage("Role Name field is required")
  ],
  updateRole
);

router.post(
  "/deleteRole",
  requireAuth,
  [
    body("roleId").notEmpty().withMessage("Role ID field is required")
  ],
  deleteRole
);

module.exports = router;