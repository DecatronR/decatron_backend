const RequestProperty = require("../models/RequestProperty");
const { validationResult } = require("express-validator");
// const { formatRoleId } = require("../utils/helpers");
const { ObjectId } = require("mongodb");

const create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { agentId, propertyListingId, status, ownerId } = req.body;
  try {

    const created = await RequestProperty.create({
      agentId,
      propertyListingId,
      status,
      ownerId
    });
    if (created) {
      return res.status(201).json({
        responseMessage: "Request created successfully",
        responseCode: 201,
        data: created,
      });
    } else {
      return res.status(400).send({
        responseMessage: "Request creation failed.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { requestId } = req.body;
    const id = new ObjectId(requestId);
    const deleted = await RequestProperty.findById({ _id:id });
    if (!deleted) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "Property Request not found" });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await RequestProperty.findByIdAndDelete({ _id:id });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Property request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const agentRequest = async (req, res) => { 
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { requestAgentId } = req.body;
    // const id = new ObjectId(requestAgentId);
    const check = await RequestProperty.find({ agentId:requestAgentId });
    if (!check) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "No Record found" });
    }
    const data = await RequestProperty.find({ agentId: requestAgentId });
    return res.status(200).json({
        responseMessage: "Record Found",
        responseCode: 200,
        data: data
      });
  } catch (error) {
    res.status(500).json({ responseMessage: error.message });
  }
}

const ownerRequest = async (req, res) => { 
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { ownerId } = req.body;
    const id = new ObjectId(ownerId);
    const check = await RequestProperty.find({ ownerId:id });
    if (!check) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "No Record found" });
    }
    const data = await RequestProperty.find({ ownerId: id });
    return res.status(200).json({
        responseMessage: "Record Found",
        responseCode: 200,
        data: data
      });
  } catch (error) {
    res.status(500).json({ responseMessage: error.message });
  }
}
module.exports = {
  create,
  deleteRequest,
  agentRequest,
  ownerRequest
};
