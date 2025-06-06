const AgencyRequest = require("../models/AgencyRequest");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Photos = require("../models/Photos");
const PropertyListing = require("../models/PropertyListing");
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
    const created = await AgencyRequest.create({
      agentId,
      propertyListingId,
      status,
      ownerId,
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
    const deleted = await AgencyRequest.findById({ _id: id });
    if (!deleted) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Property Request not found",
      });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await AgencyRequest.findByIdAndDelete({ _id: id });

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
    const check = await AgencyRequest.find({ agentId: requestAgentId });
    if (!check) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "No Record found" });
    }

    const results = await Promise.all(
      (
        await AgencyRequest.find({ agentId: requestAgentId })
      ).map(async (request) => {
        const getProperty = await PropertyListing.findOne({
          _id: request.propertyListingId,
        });

        const response = {
          id: request._id,
          agentId: request.agentId,
          agentProp: {
            propertyName: getProperty.title,
            location: getProperty.neighbourhood,
          },
          propertyListingId: request.propertyListingId,
          status: request.status,
          ownerId: request.ownerId,
          createdAt: request.createdAt,
        };

        return response;
      })
    );

    return res.status(200).json({
      responseMessage: "Record Found",
      responseCode: 200,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ responseMessage: error.message });
  }
};
const ownerRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { ownerId } = req.body;
    // const id = new ObjectId(ownerId);
    const check = await AgencyRequest.find({ ownerId: ownerId });
    if (!check) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "No Record found" });
    }

    const results = await Promise.all(
      (
        await AgencyRequest.find({ ownerId: ownerId })
      ).map(async (request) => {
        const getUser = await User.findOne({ _id: request.agentId });
        const ratings = getUser.ratings;
        const totalRatings = ratings.length;
        const sumOfRatings = ratings.reduce(
          (acc, curr) => acc + curr.rating,
          0
        );
        const averageRating =
          totalRatings > 0 ? (sumOfRatings / totalRatings).toFixed(1) : 0;
        const getProperty = await PropertyListing.findOne({
          _id: request.propertyListingId,
        });
        const response = {
          id: request._id,
          agentId: request.agentId,
          agentProp: {
            agentName: getUser.name,
            rating: parseFloat(averageRating),
          },
          propertyListingId: request.propertyListingId,
          propertyName: getProperty.title,
          status: request.status,
          ownerId: request.ownerId,
          createdAt: request.createdAt,
        };

        return response;
      })
    );

    return res.status(200).json({
      responseMessage: "Record Found",
      responseCode: 200,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ responseMessage: error.message });
  }
};
const updateStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { id, status } = req.body;
    const objId = new ObjectId(id);
    const check = await AgencyRequest.find({ _id: objId });
    if (!check) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "No Record found" });
    }
    const Data = { status };
    const updated = await AgencyRequest.findOneAndUpdate({ _id: id }, Data, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Recoed with ID not found",
      });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Status updated successfully",
    });
  } catch (error) {
    res.status(500).json({ responseMessage: error.message });
  }
};

const agencyPropertyStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { propertyListingId, agentId } = req.body;

    const getRecord = await AgencyRequest.find({ propertyListingId, agentId });
    if (!getRecord) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Recoed with ID not found",
      });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Record found",
      data: getRecord.status,
    });
  } catch (error) {
    res.status(500).json({ responseMessage: error.message });
  }
};

const getAcceptedProperties = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { agentId } = req.body;
    const records = await Promise.all(
      (
        await AgencyRequest.find({ agentId })
      ).map(async (req) => {
        const property = await PropertyListing.findOne({
          _id: req.propertyListingId,
        });
        const photo = await Photos.find({
          propertyListingId: req.propertyListingId,
        });
        return {
          property: property,
          photo,
        };
      })
    );
    return res.status(200).json({
      responseMessage: "Record Found",
      responseCode: 200,
      data: records, // Now returning a single object instead of an array
    });
  } catch (error) {
    res.status(400).json({ responseCode: 400, responseMessage: error.message });
  }
};

module.exports = {
  create,
  deleteRequest,
  agentRequest,
  ownerRequest,
  updateStatus,
  agencyPropertyStatus,
  getAcceptedProperties,
};
