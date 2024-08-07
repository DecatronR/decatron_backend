const mongoose = require("mongoose");

const LGASchema = new mongoose.Schema({

  stateId: {
    type: String,
    required: true
  },    
  slug: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },

  lga: {
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

module.exports = mongoose.model("LGA", LGASchema);
