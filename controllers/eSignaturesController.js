const ESignature = require("../models/ESignature");
const { validationResult } = require("express-validator");

// Create signature event
const createSignature = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const {
      contractId,
      event,
      timestamp,
      role,
      device,
      signature,
      signingToken,
    } = req.body;

    // Define roles that require authentication
    const rolesRequiringAuth = ["propertyOwner", "tenant"];

    // If role requires auth but no authenticated user, reject
    if (rolesRequiringAuth.includes(role) && !req.user) {
      return res.status(403).json({
        responseCode: 403,
        responseMessage: `Authentication required to sign as ${role}. Please login.`,
      });
    }

    let user = null;
    let guestName = null;
    let guestEmail = null;

    if (req.user) {
      user = {
        id: req.user.id,
        email: req.user.email,
      };
    } else {
      guestName = req.body.guestName;
      guestEmail = req.body.guestEmail;
    }

    const newEvent = await ESignature.create({
      contractId,
      event,
      timestamp,
      role,
      user,
      guestName,
      guestEmail,
      ip,
      device,
      signature,
      signingToken,
    });

    return res.status(201).json({
      responseCode: 201,
      responseMessage: "Signature event created successfully",
      data: newEvent,
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

// Fetch all events for a contract
const fetchSignatureByContract = async (req, res) => {
  const { contractId } = req.body;

  try {
    const events = await ESignature.find({ contractId });

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Signature events fetched successfully",
      data: events,
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

const fetchSignedRoles = async (req, res) => {
  const { contractId } = req.body;

  try {
    const roles = await ESignature.find({ contractId }).distinct("role");

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Signed roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

module.exports = {
  createSignature,
  fetchSignatureByContract,
  fetchSignedRoles,
};
