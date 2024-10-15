const Booking = require("../models/Booking");
const PropertyListing = require("../models/PropertyListing");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const createBooking = async (req, res) => {
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
        responseMessage: "User doesn't exist",
        responseCode: 404,
      });
    }
    const existingAgent = await User.findOne({ _id: agentID });
    if (!existingAgent) {
      return res.status(404).json({
        responseMessage: "Agent doesn't exist",
        responseCode: 404,
      });
    }
    const existingProperty = await PropertyListing.findOne({ _id: propertyID });
    if (!existingProperty) {
      return res.status(404).json({
        responseMessage: "Property doesn't exist",
        responseCode: 404,
      });
    }

    const createNew = await Booking.create({
      userID,
      agentID,
      propertyID,
      bookingDateTime,
    });

    if (createNew) {
      return res.status(201).json({
        responseMessage: "Successfully booked an inspection",
        responseCode: 201,
        data: {
          bookingId: createNew._id,
        },
      });
    } else {
      return res.status(400).json({
        responseMessage: "Oops, could not book successfully.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

// Get booking by ID
const getBooking = async (req, res) => {
  const { id } = req.body;
  try {
    const booking = await Booking.findById(id)
      .populate("propertyID")
      .populate("agentID");

    if (!booking) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Booking not found",
      });
    }

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Booking retrieved successfully",
      data: {
        bookingId: booking._id,
        userID: booking.userID,
        agentID: booking.agentID,
        propertyID: booking.propertyID,
        bookingDateTime: booking.bookingDateTime,
        propertyDetails: booking.propertyID, // Property details will be available here
        agentDetails: booking.agentID, // Agent details will be available here
      },
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const getUserBookings = async (req, res) => {
  const { userID } = req.body;
  try {
    const bookings = await Booking.find({ userID: userID })
      .populate("propertyID")
      .populate("agentID");

    if (bookings.length === 0) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "No bookings found for this user",
      });
    }

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Bookings retrieved successfully",
      data: bookings.map((booking) => ({
        bookingId: booking._id,
        userID: booking.userID,
        agentID: booking.agentID,
        propertyID: booking.propertyID,
        bookingDateTime: booking.bookingDateTime,
        propertyDetails: booking.propertyID,
        agentDetails: booking.agentID,
      })),
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const updateBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { id } = req.body;
  const { userID, agentID, propertyID, bookingDateTime } = req.body;

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Booking not found",
      });
    }

    // Update booking details
    booking.userID = userID || booking.userID;
    booking.agentID = agentID || booking.agentID;
    booking.propertyID = propertyID || booking.propertyID;
    booking.bookingDateTime = bookingDateTime || booking.bookingDateTime;

    const updatedBooking = await booking.save();

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Booking updated successfully",
      data: {
        bookingId: updatedBooking._id,
        userID: updatedBooking.userID,
        agentID: updatedBooking.agentID,
        propertyID: updatedBooking.propertyID,
        bookingDateTime: updatedBooking.bookingDateTime,
      },
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const deleteBooking = async (req, res) => {
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
  createBooking,
  getBooking,
  getUserBookings,
  updateBooking,
  deleteBooking,
};
