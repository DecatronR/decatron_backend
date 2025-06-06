const User = require("../models/User");

const attachUserDetails = async (req, res, next) => {
  try {
    // If no user in request, just proceed
    if (!req.user || !req.user.id) {
      return next();
    }

    const user = await User.findById(req.user.id).select("name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user.details = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { attachUserDetails };
