const WitnessSignatureInvite = require("../models/WitnessSignatureInvite");

const validateWitnessToken = async (req, res, next) => {
  const { token } = req.query;
  if (!token)
    return res.status(401).json({ message: "Invalid or missing token" });

  // Find the signature event associated with the token
  const signatureEvent = await WitnessSignatureInvite.findOne({
    signingToken: token,
  });

  if (!signatureEvent)
    return res.status(401).json({ message: "Invalid token" });

  // Check if the token has expired
  const currentDate = new Date();
  if (currentDate > signatureEvent.tokenExpiresAt) {
    return res.status(401).json({ message: "Token has expired" });
  }

  // If token is valid and not expired, attach it to the request
  req.signatureEvent = signatureEvent;
  next();
};

module.exports = validateWitnessToken;
