const Booking = require("../models/Booking");
const PropertyListing = require("../models/PropertyListing");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { userID, agentID, propertyID, bookingDateTime } = req.body;

  try {
    if (!bookingDateTime || isNaN(new Date(bookingDateTime).getTime())) {
      return res.status(400).json({
        responseMessage: "Invalid or missing booking date and time",
        responseCode: 400,
      });
    }
    const existingUser = await User.findOne({ _id: userID });
    if (!existingUser) {
      return res.status(404).json({
        responseMessage: "User doesnt exist",
        responseCode: 404,
      });
    }
    const existingAgent = await User.findOne({ _id: agentID });
    if (!existingAgent) {
      return res.status(404).json({
        responseMessage: "Agent doesnt exist",
        responseCode: 404,
      });
    }
    const existingProperty = await PropertyListing.findOne({ _id: propertyID });
    if (!existingProperty) {
      return res.status(404).json({
        responseMessage: "Property doesnt exist",
        responseCode: 404,
      });
    }
    const createNew = await Booking.create({
      userID,
      agentID,
      propertyID,
      bookingDateTime,
    });
    // return res.send(propertyType);
    if (createNew) {
      return res.status(201).json({
        responseMessage: "Successfully booked an inspection",
        responseCode: 201,
        data: createNew,
      });
    } else {
      return res.status(400).send({
        responseMessage: "Oops could not book successful.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

// const getReview = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(400)
//         .json({ responseCode: 400, responseMessage: errors.array() });
//     }
//     const { propertyID } = req.body;
//     const checkDb = await Review.find({ propertyID: propertyID });
//     if (!checkDb) {
//       return res.status(404).json({
//         responseMessage: "Record not found",
//         responseCode: 404,
//       });
//     } else {
//       return res.status(200).json({
//         responseMessage: "Record Found",
//         responseCode: 200,
//         data: checkDb
//       });
//     }
//   } catch (error) {
//     res.status(400).json({ responseCode: 400, responseMessage: error.message });
//   }
// };

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
    const check = await Booking.findById({ _id: objectId });
    if (!check) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Booking item not found",
      });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await Booking.findByIdAndDelete({ _id: objectId });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

module.exports = {
  create,
  deleteData,
};
