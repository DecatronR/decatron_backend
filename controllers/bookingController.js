const Booking = require("../models/Booking");
const PropertyListing = require("../models/PropertyListing");
const User = require("../models/User");
const Photos = require("../models/Photos");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");
const {
  inspectionScheduledClient,
} = require("../utils/emails/inspectionScheduledClient");
const {
  inspectionScheduledAgent,
} = require("../utils/emails/inspectionScheduledAgent");

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
      console.log(
        "Existing user: ",
        existingUser,
        existingAgent,
        existingProperty,
        bookingDateTime
      );
      const location = `${existingProperty.neighbourhood}, ${" "} ${
        existingProperty.lga
      }, ${" "} ${existingProperty.state}`;

      //send client inspection scheduled email
      await inspectionScheduledClient(
        existingUser.email,
        existingUser.name,
        existingAgent.name,
        existingAgent.phone,
        existingProperty.title,
        existingProperty.propertyDetails,
        location,
        bookingDateTime,
        createNew._id //bookingId
      );

      //send agent inspection schheduled email
      await inspectionScheduledAgent(
        existingAgent.email,
        existingAgent.name,
        existingUser.name,
        existingUser.phone,
        existingProperty.title,
        existingProperty.propertyDetails,
        location,
        bookingDateTime,
        createNew._id //bookingId
      );

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
const getUserBooking = async (req, res) => {
  try {
    const { userID } = req.body;

    // Step 1: Fetch all booking records using userID
    const bookings = await Booking.find({ userID: userID });
    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "No bookings found" });
    }

    // Step 2: Loop through each booking and fetch property details and photos
    const results = await Promise.all(
      bookings.map(async (booking) => {
        const propertyID = booking.propertyID;

        // Fetch property details using propertyID
        const propertyDetails = await PropertyListing.findById(propertyID);
        if (!propertyDetails) {
          return { booking, propertyDetails: null, photos: [] }; // Return empty data for missing property
        }

        // Fetch photos using propertyID
        const propertyPhotos = await Photos.find({
          propertyListingId: propertyID,
        });

        // Combine booking, property details, and photos
        return {
          booking,
          propertyDetails,
          photos: propertyPhotos,
        };
        // return res.status(200).json({ responseCode: 200, responseMessage: "No bookings found" });
      })
    );

    // Return the combined result for all bookings
    res
      .status(200)
      .json({ responseCode: 200, responseMessage: "Success", data: results });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return res
      .status(500)
      .json({ responseCode: 500, responseMessage: error.message });
  }
};

const getAgentBooking = async (req, res) => {
  try {
    const { agentID } = req.body;

    // Step 1: Fetch all booking records using userID
    const bookings = await Booking.find({ agentID: agentID });
    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "No bookings found" });
    }

    // Step 2: Loop through each booking and fetch property details and photos
    const results = await Promise.all(
      bookings.map(async (booking) => {
        const propertyID = booking.propertyID;

        // Fetch property details using propertyID
        const propertyDetails = await PropertyListing.findById(propertyID);
        if (!propertyDetails) {
          return { booking, propertyDetails: null, photos: [] }; // Return empty data for missing property
        }

        // Fetch photos using propertyID
        const propertyPhotos = await Photos.find({
          propertyListingId: propertyID,
        });

        // Combine booking, property details, and photos
        return {
          booking,
          propertyDetails,
          photos: propertyPhotos,
        };
      })
    );

    // Return the combined result for all bookings
    res
      .status(200)
      .json({ responseCode: 200, responseMessage: "Success", data: results });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return res
      .status(500)
      .json({ responseCode: 500, responseMessage: error.message });
  }
};

const getBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { id } = req.body;
    const objectId = new ObjectId(id);
    console.log(objectId);
    const checkDb = await Booking.findOne({ _id: objectId });
    if (!checkDb) {
      return res.status(404).json({
        responseMessage: "Record not found",
        responseCode: 404,
      });
    } else {
      return res.status(200).json({
        responseMessage: "Record Found",
        responseCode: 200,
        data: checkDb,
      });
    }
  } catch (error) {
    res.status(400).json({ responseCode: 400, responseMessage: error.message });
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
  getUserBooking,
  getAgentBooking,
  updateBooking,
  deleteBooking,
  getBooking,
};
