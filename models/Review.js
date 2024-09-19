const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  propertyID: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true
  },
    message: {
        type: String,
        required: true    
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("Review", ReviewSchema);
