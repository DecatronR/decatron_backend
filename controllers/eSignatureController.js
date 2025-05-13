const ESignature = require("../models/ESignature");
const { validationResult } = require("express-validator");
const {
  sendWitnessSignatureInviteEmail,
} = require("../utils/emails/sendWitnessInvite");
const Contract = require("../models/Contract");
const WitnessSignatureInvite = require("../models/WitnessSignatureInvite");
const getClientIP = require("../utils/getClientIP");
const { checkAndUpdateContractStatus } = require("./contractController");

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
    let witnessData = null;

    if (req.user) {
      user = {
        id: req.user.details._id,
        email: req.user.details.email,
        name: req.user.details.name,
      };

      // Check for existing signature by this user for this contract
      const existingSignature = await ESignature.findOne({
        contractId,
        "user.id": user.id,
        role,
      });

      if (existingSignature) {
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "You have already signed this contract.",
        });
      }
    } else {
      // This is a witness signature
      const { witnessName, witnessEmail } = req.body;
      if (!witnessName || !witnessEmail) {
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "Witness name and email are required.",
        });
      }

      // Find the main signature to attach witness to
      const mainRole =
        role === "propertyOwnerWitness" ? "propertyOwner" : "tenant";
      const mainSignature = await ESignature.findOne({
        contractId,
        role: mainRole,
        event: "signed",
      }).sort({ timestamp: -1 });

      if (!mainSignature) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "Main signature not found to witness.",
        });
      }

      // Check if this witness has already signed
      if (
        mainSignature.witness &&
        mainSignature.witness.email === witnessEmail
      ) {
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "This witness has already signed the contract.",
        });
      }

      // Update the main signature with witness data
      mainSignature.witness = {
        name: witnessName,
        email: witnessEmail,
        signature: signature,
        timestamp: new Date(),
        ip: ip,
        device: device,
      };

      await mainSignature.save();

      // Check and update contract status after witness signature is added
      await checkAndUpdateContractStatus(contractId);

      return res.status(201).json({
        responseCode: 201,
        responseMessage: "Witness signature added successfully",
        data: mainSignature,
      });
    }

    // Create new signature for main signer
    const newEvent = await ESignature.create({
      contractId,
      event,
      timestamp,
      role,
      user,
      ip,
      device,
      signature,
    });

    // Check and update contract status after signature is added
    await checkAndUpdateContractStatus(contractId);

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
    // Get all signatures for this contract
    const signatures = await ESignature.find({ contractId });

    // Create a map to track signed roles
    const signedRoles = new Set();

    // Process each signature
    signatures.forEach((signature) => {
      // Add the main signer's role
      signedRoles.add(signature.role);

      // If there's a witness, add the corresponding witness role
      if (signature.witness) {
        const witnessRole =
          signature.role === "propertyOwner"
            ? "propertyOwnerWitness"
            : "tenantWitness";
        signedRoles.add(witnessRole);
      }
    });

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Signed roles fetched successfully",
      data: Array.from(signedRoles),
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
