const Review = require("../models/Review");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { propertyID, userID, message } = req.body;

  try {
    const createNew = await Review.create({
        propertyID,
        userID,
        message
    });
    // return res.send(propertyType);
    if (createNew) {
      return res.status(201).json({
        responseMessage: "Review Posted Successfully",
        responseCode: 201,
        data: createNew
      });
    } else {
      return res.status(400).send({
        responseMessage: "Oops could not post data.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

const getReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { propertyID } = req.body;
    const checkDb = await Review.find({ propertyID: propertyID });
    if (!checkDb) {
      return res.status(404).json({
        responseMessage: "Record not found",
        responseCode: 404,
      });
    } else {
      return res.status(200).json({
        responseMessage: "Record Found",
        responseCode: 200,
        data: checkDb
      });
    }
  } catch (error) {
    res.status(400).json({ responseCode: 400, responseMessage: error.message });
  }
};


const deleteData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { id } = req.body;
    const objectId = new ObjectId(id);
    const check = await Review.findById({ _id: objectId });
    if (!check) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Review item not found",
      });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await Review.findByIdAndDelete({ _id: objectId });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

module.exports = {
  create,
  getReview,
  deleteData
};