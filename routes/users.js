const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { body } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { updateFcmToken } = require("../controllers/userController");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage1 = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "passport",
    format: async (req, file) => "jpg", // supports "jpg", "png", etc.
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Unique identifier
  },
});

const upload1 = multer({
  storage1,
  limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 1MB
}); // Allow up to 10 files

const {
  getUsers,
  editUsers,
  updateUsers,
  deleteUser,
  rateUser,
  fetchUserRating,
  userTree,
} = require("../controllers/userController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Set up storage for passport files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/passports/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize upload middleware with size limit of 150KB
const upload = multer({
  storage,
  limits: { fileSize: 153600 }, // 150KB limit
  fileFilter: (req, file, cb) => {
    // You can also check the file type here (optional)
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Only image files are allowed!")); // Reject non-image files
    }
  },
});

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/getusers", requireAuth, getUsers);

router.post(
  "/editusers",
  [body("id").notEmpty().withMessage("Id is required")],
  editUsers
);

router.post(
  "/update",
  requireAuth,
  upload.single("passport"), // This handles file uploads
  (err, req, res, next) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File size exceeds the 150KB limit" });
    }
    if (!req.file && !req.body.passport) {
      return res.status(400).json({ message: "Passport file is required" });
    }
    next();
  },
  [
    body("id").notEmpty().withMessage("Id is required"), // Only ID is mandatory now
    // No need to enforce other fields unless necessary
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
  "/userTree",
  requireAuth,
  [body("id").notEmpty().withMessage("Id is required")],
  userTree
);

router.post(
  "/fetchUserRating",
  [body("userID").notEmpty().withMessage("User Id field is required")],
  fetchUserRating
);

router.post(
  "/rateUser",
  requireAuth,
  [
    body("userID").notEmpty().withMessage("User ID is required"),
    body("rating").notEmpty().withMessage("Rating is required"),
    body("reviewerID").notEmpty().withMessage("Reviewer ID is required"),
    body("comment").notEmpty().withMessage("Comment is required"),
  ],
  rateUser
);

router.post("/update-fcm-token", requireAuth, updateFcmToken);

module.exports = router;
