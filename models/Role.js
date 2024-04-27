const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  roleId: {
    type: String,
    required: true,
  },
  roleName: {
    type: String,
    required: true,
    unique: true
  },

  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("Role", UserSchema);
