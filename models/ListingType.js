const mongoose = require("mongoose");

const ListingTypeSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  listingType: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("ListingType", ListingTypeSchema);
