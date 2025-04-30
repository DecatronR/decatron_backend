const ESignature = require("../models/ESignatures");
const { validationResult } = require("express-validator");

// Create signature event
const createSignature = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      responseCode: 400,
      responseMessage: errors.array(),
    });
  }

  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const { contractId, event, timestamp, user, device, signature } = req.body;

    const newEvent = await ESignature.create({
      contractId,
      event,
      timestamp,
      user,
      ip,
      device,
      signature,
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

module.exports = {
  createSignature,
  fetchSignatureByContract,
};
