const mongoose = require("mongoose");
const BookingSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  propertyID: {
    type: String,
    required: true,
  },
  agentID: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});
module.exports = mongoose.model("Booking", BookingSchema);
