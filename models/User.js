const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true
  },
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
  }
});
module.exports = mongoose.model("User", UserSchema);
