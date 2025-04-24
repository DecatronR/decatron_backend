const Contract = require("../models/Contract");
const { validationResult } = require("express-validator");

// Create a new contract
const createContract = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const {
      propertyId,
      propertyName,
      ownerId,
      ownerName,
      propertyPrice,
      propertyLocation,
    } = req.body;

    if (!req.user || !req.user.details) {
      return res.status(400).json({
        responseCode: 400,
        responseMessage: "User is not authenticated properly",
      });
    }

    const clientId = req.user.details._id;
    const clientName = req.user.details.name;

    console.log("client id: ", clientId);
    console.log("client name: ", clientName);

    const newContract = await Contract.create({
      clientId,
      clientName,
      propertyId,
      propertyName,
      ownerId,
      ownerName,
      propertyPrice,
      propertyLocation,
    });

    return res.status(201).json({
      responseCode: 201,
      responseMessage: "Contract created successfully",
      data: newContract,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ responseCode: 500, responseMessage: error.message });
  }
};

// Fetch contracts by client
const fetchClientContracts = async (req, res) => {
  try {
    const clientId = req.user._id;
    const contracts = await Contract.find({ clientId });

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Contracts fetched successfully",
      data: contracts,
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

// Fetch contracts by owner
const fetchOwnerContracts = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const contracts = await Contract.find({ ownerId });

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Contracts fetched successfully",
      data: contracts,
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

// Fetch single contract by contractId
const fetchContractById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      responseCode: 400,
      responseMessage: errors.array(),
    });
  }

  try {
    const { contractId } = req.body;

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Contract not found.",
      });
    }

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Contract fetched successfully.",
      data: contract,
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

module.exports = {
  createContract,
  fetchClientContracts,
  fetchOwnerContracts,
  fetchContractById,
};
