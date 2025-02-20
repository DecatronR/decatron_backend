const MySchedule = require("../models/MySchedule");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { userId, availability } = req.body;

  try {
    const objectId = new ObjectId(userId);
    const user = await User.findById(objectId);
    if (!user) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "User not found" });
    }
    let createdRecords = [];

    // Loop through each availability entry
    for (const item of availability) {
      const { date, time } = item;

      // Loop through each time slot in the time array for that specific date
      for (const timeSlot of time) {
        // Check if a record with this userId, date, and time already exists
        const existing = await MySchedule.findOne({ userId, date, time: timeSlot });

        if (existing) {
          // Skip this time slot if a record already exists to avoid duplicate entries
          continue;
        }

        // Create a new record for the current date and time slot
        const newRecord = await MySchedule.create({
          userId,
          date,
          time: timeSlot // Create separate records for each time slot
        });

        // Keep track of the successfully created records
        if (newRecord) {
          createdRecords.push(newRecord);
        }
      }
    }

    // If new records were created, return success
    if (createdRecords.length > 0) {
      return res.status(201).json({
        responseMessage: "Records created successfully",
        responseCode: 201,
        data: createdRecords, // Return all created records
      });
    } else {
      return res.status(409).json({
        responseMessage: "No new records were created, all records already exist.",
        responseCode: 409,
      });
    }
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};


const edit = async (req, res) => {
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
    const checkDb = await MySchedule.findOne({ _id: objectId });
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

const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }
  const { userId, availability } = req.body;
  try {
    const objectId = new ObjectId(userId);
    const user = await User.findById(objectId);
    if (!user) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "User not found" });
    }

    // await MySchedule.findByIdAndDelete({ userId: objectId });
    await MySchedule.deleteMany({ userId: objectId, isAvailable: 0 });

    let createdRecords = [];

    // Loop through each availability entry
    for (const item of availability) {
      const { date, time } = item;

      // Loop through each time slot in the time array for that specific date
      for (const timeSlot of time) {
        // Check if a record with this userId, date, and time already exists
        const existing = await MySchedule.findOne({ userId, date, time: timeSlot });

        if (existing) {
          // Skip this time slot if a record already exists to avoid duplicate entries
          continue;
        }

        // Create a new record for the current date and time slot
        const newRecord = await MySchedule.create({
          userId,
          date,
          time: timeSlot // Create separate records for each time slot
        });

        // Keep track of the successfully created records
        if (newRecord) {
          createdRecords.push(newRecord);
        }
      }
    }

    // If new records were created, return success
    if (createdRecords.length > 0) {
      return res.status(201).json({
        responseMessage: "Records Updated successfully",
        responseCode: 201,
        // data: createdRecords, // Return all created records
      });
    } else {
      return res.status(409).json({
        responseMessage: "No new records were created, all records already exist.",
        responseCode: 409,
      });
    }
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

const fetch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { userId } = req.body;
    const fetchRcords = await MySchedule.find({ userId });
    // res.json(fetchRcords);
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Success",
      data: fetchRcords
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};
const fetchReferralSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { referralCode } = req.body;
    const existingAgent = await User.findOne({ referralCode: referralCode });
        if (!existingAgent) {
          return res.status(404).json({
            responseMessage: "Agent doesn't exist",
            responseCode: 404,
          });
        }
    const fetchRcords = await MySchedule.find({ userId:existingAgent._id  });
    // res.json(fetchRcords);
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Success",
      data: fetchRcords
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { id } = req.body;
    const objectId = new ObjectId(id);
    const check = await MySchedule.findById({ _id: objectId });
    if (!check) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Record not found",
      });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await MySchedule.findByIdAndDelete({ _id: objectId });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const scheduleBooked = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const { id } = req.body;

    const Data = { 
      isAvailable: 1
     };
    const updated = await MySchedule.findOneAndUpdate({ _id: id }, Data, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Record not found",
      });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Record flagged successfully",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

module.exports = {
  create,
  edit,
  update,
  fetch,
  deleteRecord,
  scheduleBooked,
  fetchReferralSchedule
};
