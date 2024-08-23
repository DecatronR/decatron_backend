const State = require("../models/State");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const createState = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { state } = req.body;

  try {
    const slug = state.toLowerCase().replace(/\s+/g, "-");
    const existing = await State.findOne({ slug });

    if (existing) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "Property Type with the same name already exists",
      });
    }

    const createNew = await State.create({
      slug,
      state,
    });
    // return res.send(propertyType);
    if (createNew) {
      return res.status(201).json({
        responseMessage: "Property Type created successfully",
        responseCode: 201,
        data: {
          id: createNew._id,
          slug: createNew.slug,
          state: createNew.state,
        },
      });
    } else {
      return res.status(400).send({
        responseMessage: "Property Type creation failed.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

const editState = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { id } = req.body;
    const objectId = new ObjectId(id);
    const checkDb = await State.findOne({ _id: objectId });
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
          state: checkDb.state,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ responseCode: 400, responseMessage: error.message });
  }
};

const updateState = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const { id, state } = req.body;
    const slug = state.toLowerCase().replace(/\s+/g, "-");
    
    const Data = { state, slug };
    const updated = await State.findOneAndUpdate({ _id: id }, Data, {
      new: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({
          responseCode: 404,
          responseMessage: "State not found",
        });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "State updated successfully",
      role: {
        id: updated.id,
        state: updated.state,
        slug: updated.slug
      },
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

const fetchState = async (req, res) => {
  try {
    // const users = await User.find();
    const fetchRcords = await State.find().select(
      "slug state createdAt"
    );
    res.json(fetchRcords);
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const deleteState = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { id } = req.body;
    const objectId = new ObjectId(id);
    const check = await State.findById({ _id: objectId });
    if (!check) {
      return res
        .status(404)
        .json({
          responseCode: 404,
          responseMessage: "State not found",
        });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await State.findByIdAndDelete({ _id: objectId });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "State deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

module.exports = {
  createState,
  editState,
  updateState,
  fetchState,
  deleteState
};
