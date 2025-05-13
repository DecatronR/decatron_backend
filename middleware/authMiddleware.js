const jwt = require("jsonwebtoken");
const User = require("../models/User");

const secretKey = process.env.JWT_SECURITY_KEY;

const requireAuth = (req, res, next) => {
  // const token = req.cookies.auth_jwt;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (token) {
    jwt.verify(token, secretKey, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        return res.status(403).json({
          responseMessage:
            "Kindly Login to access this application's facilities",
          responseCode: 403,
        });
      } else {
        console.log(decodedToken);
        req.user = decodedToken;
        console.log("User: ", req.user);
        next(); // Proceed to the next middleware or route handler
      }
    });
  } else {
    return res.status(403).json({
      responseMessage: "Kindly Login to access this application's facilities",
      responseCode: 403,
    });
  }
};

// optional auth middleware
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);

  if (token) {
    jwt.verify(token, secretKey, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        req.user = null;
        return next();
      } else {
        req.user = decodedToken;
        console.log("User: ", req.user);
        next();
      }
    });
  } else {
    req.user = null;
    return next();
  }
};

const checkUser = (req, res, next) => {
  const token = req.cookies.auth_jwt;
  if (token) {
    jwt.verify(token, secretKey, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        console.log(decodedToken);
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

function generateReferralCode(userId) {
  return Buffer.from(userId.toString()).toString("hex").toUpperCase();
}

module.exports = { requireAuth, optionalAuth, checkUser };
