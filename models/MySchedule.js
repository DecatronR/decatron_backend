const mongoose = require("mongoose");
const MyScheduleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: String,
    required: true,
    default: '0'
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});
module.exports = mongoose.model("MySchedule", MyScheduleSchema);
