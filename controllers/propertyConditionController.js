const PropertyCondition = require("../models/PropertyCondition");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const createPropertyCondition = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { propertyCondition } = req.body;

  try {
    const slug = propertyCondition.toLowerCase().replace(/\s+/g, "-");
    const existing = await PropertyCondition.findOne({ slug });

    if (existing) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "Property Condition with the same name already exists",
      });
    }

    const createNew = await PropertyCondition.create({
      slug,
      propertyCondition,
    });
    // return res.send(propertyType);
    if (createNew) {
      return res.status(201).json({
        responseMessage: "Property Condition created successfully",
        responseCode: 201,
        data: {
          id: createNew._id,
          slug: createNew.slug,
          propertyCondition: createNew.propertyCondition,
        },
      });
    } else {
      return res.status(400).send({
        responseMessage: "Property Condition creation failed.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

const editPropertyCondition = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { id } = req.body;
    const objectId = new ObjectId(id);
    const checkDb = await PropertyCondition.findOne({ _id: objectId });
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
          propertyCondition: checkDb.propertyCondition,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ responseCode: 400, responseMessage: error.message });
  }
};

const updatePropertyCondition = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const { id, propertyCondition } = req.body;
    const slug = propertyCondition.toLowerCase().replace(/\s+/g, "-");

    const Data = { propertyCondition, slug };
    const updated = await PropertyCondition.findOneAndUpdate({ _id: id }, Data, {
      new: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({
          responseCode: 404,
          responseMessage: "Property Condition not found",
        });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Property Condition updated successfully",
      role: {
        id: updated.id,
        state: updated.state,
        propertyCondition: updated.propertyCondition
      },
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

const fetchPropertyCondition = async (req, res) => {
  try {
    // const users = await User.find();
    const fetchRcords = await PropertyCondition.find().select(
      "slug propertyCondition createdAt"
    );
    res.json(fetchRcords);
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const deletePropertyCondition = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { id } = req.body;
    const objectId = new ObjectId(id);
    const check = await PropertyCondition.findById({ _id: objectId });
    if (!check) {
      return res
        .status(404)
        .json({
          responseCode: 404,
          responseMessage: "Property Condition not found",
        });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await PropertyCondition.findByIdAndDelete({ _id: objectId });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Property Condition deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

module.exports = {
  createPropertyCondition,
  editPropertyCondition,
  updatePropertyCondition,
  fetchPropertyCondition,
  deletePropertyCondition,
};
