const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.details || req.user.details.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden: Admins only",
    });
  }
  next();
};

module.exports = { requireAdmin };
