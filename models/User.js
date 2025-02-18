const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  reviewerID: { type: String, required: true }, // ID of the user who gave the rating
  comment: { type: String, required: false },  // Optional comment for the rating
  createdAt: { type: Date, default: new Date() }
});

const UserSchema = new mongoose.Schema({
  // userID: {
  //   type: String,
  //   required: true
  // },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  referralCode: {
    type: String,
    unique: true,
  },
  referrer: {
    type: String
  },
  role: {
    type: String,
    required: true,
  },
  passport: {
    type: String,
    required: false,
  },
  identificationDocument: {
    type: String,
    required: false,
  },
  identificationNo: {
    type: String,
    required: false,
  },
  otp: {
    type: String,
    required: false,
  },
  email_verified_at: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  ratings: [RatingSchema], // Array of individual ratings
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  }
});
module.exports = mongoose.model("User", UserSchema);
