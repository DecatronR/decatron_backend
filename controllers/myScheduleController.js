const MySchedule = require("../models/MySchedule");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { userId, date, time } = req.body;

  try {
    
    const existing = await MySchedule.findOne({ userId, date, time });

    if (existing) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "Record with this details already exists",
      });
    }

    const createNew = await MySchedule.create({
      userId,
      date,
      time
    });
    // return res.send(propertyType);
    if (createNew) {
      return res.status(201).json({
        responseMessage: "Record created successfully",
        responseCode: 201,
        data: createNew,
      });
    } else {
      return res.status(400).send({
        responseMessage: "Record creation failed.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
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

  try {
    const { id, date, time } = req.body;

    const Data = { date, time };
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
      responseMessage: "Record updated successfully",
      data: {
        id: updated.id,
        date: updated.date,
        time: updated.time,
        userId: updated.userId
      },
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

const fetch = async (req, res) => {
  try {
    // const users = await User.find();
    const fetchRcords = await MySchedule.find().select("userId date time isAvailable");
    res.json(fetchRcords);
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

module.exports = {
  create,
  edit,
  update,
  fetch,
  deleteRecord
};
