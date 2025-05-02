const ESignature = require("../models/ESignature");

const validateGuestSigningToken = async (req, res, next) => {
  const { token } = req.query;
  if (!token)
    return res.status(401).json({ message: "Invalid or missing token" });

  const signatureEvent = await ESignature.findOne({ signingToken: token });
  if (!signatureEvent)
    return res.status(401).json({ message: "Invalid token" });

  req.signatureEvent = signatureEvent;
  next();
};

module.exports = validateGuestSigningToken;
