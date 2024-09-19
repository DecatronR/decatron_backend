const express = require('express');
const router = express.Router();
const {
  getUsers,
  editUsers,
  updateUsers,
  deleteUser,
  rateUser,
  fetchUserRating
} = require("../controllers/userController");
const { body } = require("express-validator");
const { requireAuth, checkUser } = require("../middleware/authMiddleware");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get("/getusers", requireAuth, getUsers);
// router.get("/editusers", editUsers);
router.post(
  "/editusers",
  requireAuth,
  [body("id").notEmpty().withMessage("Id is required")],
  editUsers
);

router.post(
  "/update",
  requireAuth,
  [
    body("name").notEmpty().withMessage("Name field is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("phone").isMobilePhone().withMessage("Invalid phone number"),
    body("id").notEmpty().withMessage("Id is required"),
    body("role").notEmpty().withMessage("Role is required")
  ],
  updateUsers
);
router.post(
  "/delete",
  requireAuth,
  [body("id").notEmpty().withMessage("Id is required")],
  deleteUser
);

router.post(
  "/fetchUserRating",
  requireAuth,
  [body("userID").notEmpty().withMessage("User Id field is required")],
  fetchUserRating
);

router.post(
  "/rateUser",
  requireAuth,
  [body("userID").notEmpty().withMessage("user ID is required")],
  [body("rating").notEmpty().withMessage("rating is required")],
  [body("reviewerID").notEmpty().withMessage("reviewer ID is required")],
  [body("comment").notEmpty().withMessage("comment is required")],
  rateUser
);

module.exports = router;
