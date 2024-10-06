const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = (req, res, next) => {
  const token = req.cookies.auth_jwt;
  // console.log(token);
  if (token) {
    jwt.verify(
      token,
      "h8BHWDXuW1IPcUHNcCNdsDKucaqHgLzN6ZZT4DMm0LM",
      (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          // res.redirect('/login');
          return res.status(403).json({
            responseMessage:
              "Kindly Login to access this application facillities",
            responseCode: 403,
          });
        } else {
          console.log(decodedToken);
          next();
        }
      }
    );
  } else {
    // res.redirect('/login');
    return res.status(403).json({
      responseMessage: "Kindly Login to access this application facilities",
      responseCode: 403,
    });
  }
};

const checkUser = (req, res, next) => {
  const token = req.cookies.auth_jwt;
  if (token) {
    jwt.verify(
      token,
      "h8BHWDXuW1IPcUHNcCNdsDKucaqHgLzN6ZZT4DMm0LM",
      async (err, decodedToken) => {
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
      }
    );
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, checkUser };
