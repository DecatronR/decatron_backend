const ESignature = require("../models/ESignature");
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const multer = require("multer");
const {
  sendWitnessSignatureInviteEmail,
} = require("../utils/emails/sendWitnessInvite");
const Contract = require("../models/Contract");
const WitnessSignatureInvite = require("../models/WitnessSignatureInvite");
const getClientIP = require("../utils/getClientIP");

// Create signature event
const createSignature = async (req, res) => {
  console.log("Request body:", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  let signature;
  try {
    const ip = getClientIP(req);
    const { contractId, event, timestamp, role, device, signingToken } =
      req.body;

    // Handle file upload and convert to base64 (file is in memory)
    const file = req.file; // Assuming multer is set up and file is saved in req.file
    if (file) {
      // Convert image file (buffer) to base64 string
      const base64String = file.buffer.toString("base64");

      // You can now store the base64 string in your database
      signature = base64String;
    } else {
      return res.status(400).json({
        responseCode: 400,
        responseMessage: "No signature image provided.",
      });
    }

    // Define roles that require authentication
    const rolesRequiringAuth = ["propertyOwner", "tenant"];
    if (rolesRequiringAuth.includes(role) && !req.user) {
      return res.status(403).json({
        responseCode: 403,
        responseMessage: `Authentication required to sign as ${role}. Please login.`,
      });
    }

    let user = null;
    let witnessName = null;
    let witnessEmail = null;
    let isWitnessSignature = false;
    let witnessedSignature = null;
    let witnessFor = null;

    if (req.user) {
      user = {
        id: req.user.details._id,
        email: req.user.details.email,
      };
    } else {
      witnessName = req.body.witnessName;
      witnessEmail = req.body.witnessEmail;
      isWitnessSignature = true;
    }

    // If this is a witness signature, find the signature they're witnessing
    if (isWitnessSignature) {
      const mainRole =
        role === "propertyOwnerWitness" ? "propertyOwner" : "tenant";
      const mainSignature = await ESignature.findOne({
        contractId,
        role: mainRole,
        event: "signed",
      }).sort({ timestamp: -1 });

      if (mainSignature) {
        witnessedSignature = mainSignature._id;
        witnessFor = mainSignature._id;
      }
    }

    const newEvent = await ESignature.create({
      contractId,
      event,
      timestamp,
      role,
      user,
      witnessName,
      witnessEmail,
      ip,
      device,
      signature,
      signingToken,
      isWitnessSignature,
      witnessedSignature,
      witnessFor,
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

const sendWitnessInvite = async (req, res) => {
  const { witnessName, witnessEmail, contractId, role } = req.body;

  if (!witnessName || !witnessEmail || !contractId || !role) {
    return res.status(400).json({
      responseCode: 400,
      responseMessage: "Missing required fields",
    });
  }
  const inviterId = req.user.details._id;
  const inviterName = req.user.details.name;

  try {
    // Send witness invite email
    const signingToken = await sendWitnessSignatureInviteEmail(
      witnessName,
      witnessEmail,
      contractId,
      role,
      inviterName,
      inviterId
    );

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Witness invitation sent successfully",
      data: { signingToken },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

const validateWitnessSignatureLink = async (req, res) => {
  try {
    const signatureEvent = req.signatureEvent;

    const contract = await Contract.findById(signatureEvent.contractId);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const invite = await WitnessSignatureInvite.findOne({
      contractId: signatureEvent.contractId,
      witnessEmail: signatureEvent.witnessEmail,
    });

    if (!invite) {
      return res.status(404).json({ message: "Witness invite not found" });
    }

    res.status(200).json({
      isValid: true,
      message: "Token is valid",
      contract: {
        id: contract._id,
        propertyName: contract.propertyName,
        propertyLocation: contract.propertyLocation,
        propertyPrice: contract.propertyPrice,
      },
      witnessRole: signatureEvent.role,
      invitedBy: invite.inviterName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createSignature,
  fetchSignatureByContract,
  fetchSignedRoles,
  sendWitnessInvite,
  validateWitnessSignatureLink,
};
