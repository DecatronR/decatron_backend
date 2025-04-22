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
      contractAmount,
      terms,
    } = req.body;

    const clientId = req.user._id;
    const clientName = req.user.name;

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
const fetchContractsByClient = async (req, res) => {
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
const fetchContractsByOwner = async (req, res) => {
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
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Contract not found",
      });
    }

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Contract fetched successfully",
      data: contract,
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

module.exports = {
  createContract,
  fetchContractsByClient,
  fetchContractsByOwner,
  fetchContractById,
};
