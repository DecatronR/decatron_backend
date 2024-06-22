const express = require('express');
const router = express.Router();
const {
  getUsers,
  editUsers,
  updateUsers,
  deleteUser
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

module.exports = router;
