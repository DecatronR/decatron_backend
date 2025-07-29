const LGA = require("../models/LGA");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const createLGA = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { stateId, lga } = req.body;

  try {
    const slug = lga.toLowerCase().replace(/\s+/g, "-");
    const existing = await LGA.findOne({ slug });

    if (existing) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "LGA with the same name already exists",
      });
    }

    const createNew = await LGA.create({
      stateId,
      slug,
      lga,
    });
    // return res.send(propertyType);
    if (createNew) {
      return res.status(201).json({
        responseMessage: "LGA created successfully",
        responseCode: 201,
        data: {
          id: createNew._id,
          slug: createNew.slug,
          lga: createNew.lga,
        },
      });
    } else {
      return res.status(400).send({
        responseMessage: "LGA creation failed.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

const editLGA = async (req, res) => {
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
    const checkDb = await LGA.findOne({ _id: objectId });
    if (!checkDb) {
      return res.status(404).json({
        responseMessage: "Record not found",
        responseCode: 404,
      });
    } else {
      return res.status(200).json({
        responseMessage: "Record Found",
        responseCode: 200,
        data: {
          id: checkDb._id,
          slug: checkDb.slug,
          lga: checkDb.lga,
          stateId: checkDb.stateId,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ responseCode: 400, responseMessage: error.message });
  }
};

const updateLGA = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const { id, stateId, lga } = req.body;
    const slug = lga.toLowerCase().replace(/\s+/g, "-");

    const Data = { stateId, slug, lga };
    const updated = await LGA.findOneAndUpdate({ _id: id }, Data, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "LGA not found",
      });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "LGA updated successfully",
      data: {
        id: updated.id,
        lga: updated.lga,
        stateId: updated.stateId,
        slug: updated.slug,
      },
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

const fetchLGA = async (req, res) => {
  try {
    // const users = await User.find();
    const fetchRcords = await LGA.find().select("stateId slug lga createdAt");
    res.json(fetchRcords);
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const deleteLGA = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { id } = req.body;
    const objectId = new ObjectId(id);
    const check = await LGA.findById({ _id: objectId });
    if (!check) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "LGA not found",
      });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await LGA.findByIdAndDelete({ _id: objectId });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "LGA deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const fetchLGAsByStateId = async (req, res) => {
  try {
    const { stateId } = req.query;

    if (!stateId) {
      return res.status(400).json({
        responseCode: 400,
        responseMessage: "stateId query parameter is required",
      });
    }

    const lgas = await LGA.find({ stateId }).select("lga slug stateId");

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "LGAs fetched successfully",
      data: lgas,
    });
  } catch (error) {
    res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

module.exports = {
  createLGA,
  editLGA,
  updateLGA,
  fetchLGA,
  deleteLGA,
  fetchLGAsByStateId,
};
