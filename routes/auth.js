const express = require("express");
const { body } = require("express-validator");
const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
const router = express.Router();

/* GET home page. */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  loginUser
);

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name field is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("roleId").notEmpty().withMessage("roleId field is required"),
    body("phone").isMobilePhone().withMessage("Invalid phone number"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmpassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  registerUser
);

router.get("/logout", logoutUser);

module.exports = router;
