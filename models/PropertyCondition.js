const mongoose = require("mongoose");

const PropertyCondition = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  propertyCondition: {
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

module.exports = mongoose.model("PropertyCondition", PropertyCondition);
