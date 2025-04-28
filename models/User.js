const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  reviewerID: { type: String, required: true }, // ID of the user who gave the rating
  comment: { type: String, required: false }, // Optional comment for the rating
  createdAt: { type: Date, default: new Date() },
});
const ninSchema = new mongoose.Schema({
  nin: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  middlename: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  address: { type: String, required: true },
  lga: { type: String, required: true },
  state: { type: String, required: true },
  photo: { type: String, required: true }
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
    type: String,
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
  phoneOTP: {
    type: String,
    required: false,
  },
  email_verified_at: {
    type: String,
    required: false,
  },
  phone_no_verified_at: {
    type: String,
    required: false,
  },
  nin_verified_at: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  fcmToken: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  ratings: [RatingSchema], // Array of individual ratings
  nin:[ninSchema],
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("User", UserSchema);
