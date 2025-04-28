const express = require("express");
const { body } = require("express-validator");
const {
  registerUser,
  loginUser,
  logoutUser,
  confirmOTP,
  resendOTP,
  sendWPOTP,
  changePassword,
  confirmPhoneNo,
} = require("../controllers/authController");
const router = express.Router();

/* GET home page. */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  loginUser
);
router.post(
  "/confirmOTP",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("otp").notEmpty().withMessage("OTP field is required"),
  ],
  confirmOTP
);
router.post(
  "/resendOTP",
  [body("email").isEmail().withMessage("Invalid email address")],
  resendOTP
);

router.post(
  "/confirmPhoneNo",
  [body("id").notEmpty().withMessage("ID field is required")],
  confirmPhoneNo
);

router.post(
  "/sendWPOTP",
  [body("phoneNo").notEmpty().withMessage("Phone Number Fields is required")],
  sendWPOTP
);

router.post(
  "/changePassword",
  [
    body("password").notEmpty().withMessage("Password Fields is required"),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Confirm Password Fields is required"),
    body("email").notEmpty().withMessage("Email Fields is required"),
  ],
  changePassword
);

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name field is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("role").notEmpty().withMessage("role field is required"),
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
