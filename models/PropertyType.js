const mongoose = require("mongoose");

const PropertyTypeSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    lowercase: true,
  },
  propertyType: {
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

module.exports = mongoose.model("PropertyType", PropertyTypeSchema);
