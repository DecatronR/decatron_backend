const crypto = require("crypto");

const generateSigningToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

module.exports = generateSigningToken;
