const mongoose = require("mongoose");

const PhotosSchema = new mongoose.Schema({
  propertyListingId: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("Photos", PhotosSchema);
