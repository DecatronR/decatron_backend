const mongoose = require("mongoose");

const PropertyUsage = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  propertyUsage: {
    type: String,
    required: true,
    unique: true,
  },

  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("PropertyUsage", PropertyUsage);
