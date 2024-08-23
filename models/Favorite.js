const mongoose = require("mongoose");
const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  propertyListingId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});
module.exports = mongoose.model("Favorite", FavoriteSchema);
