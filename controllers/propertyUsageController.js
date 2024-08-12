const PropertyUsage = require("../models/PropertyUsage");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const createPropertyUsage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { propertyUsage } = req.body;

  try {
    const slug = propertyUsage.toLowerCase().replace(/\s+/g, "-");
    const existing = await PropertyUsage.findOne({ slug });

    if (existing) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "Property Usage with the same name already exists",
      });
    }

    const createNew = await PropertyUsage.create({
      slug,
      propertyUsage,
    });
    // return res.send(propertyType);
    if (createNew) {
      return res.status(201).json({
        responseMessage: "Property Usage created successfully",
        responseCode: 201,
        data: {
          id: createNew._id,
          slug: createNew.slug,
          propertyUsage: createNew.propertyUsage,
        },
      });
    } else {
      return res.status(400).send({
        responseMessage: "Property Usage creation failed.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

const editPropertyUsage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { id } = req.body;
    const objectId = new ObjectId(id);
    const checkDb = await PropertyUsage.findOne({ _id: objectId });
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
          propertyUsage: checkDb.propertyUsage,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ responseCode: 400, responseMessage: error.message });
  }
};

const updatePropertyUsage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const { id, propertyUsage } = req.body;
    const slug = propertyUsage.toLowerCase().replace(/\s+/g, "-");

    const Data = { propertyUsage, slug };
    const updated = await PropertyUsage.findOneAndUpdate({ _id: id }, Data, {
      new: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({
          responseCode: 404,
          responseMessage: "Property Usage not found",
        });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Property Usage updated successfully",
      role: {
        id: updated.id,
        state: updated.state,
        propertyUsage: updated.propertyUsage
      },
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

const fetchPropertyUsage = async (req, res) => {
  try {
    // const users = await User.find();
    const fetchRcords = await PropertyUsage.find().select(
      "slug propertyUsage createdAt"
    );
    res.json(fetchRcords);
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const deletePropertyUsage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { id } = req.body;
    const objectId = new ObjectId(id);
    const check = await PropertyUsage.findById({ _id: objectId });
    if (!check) {
      return res
        .status(404)
        .json({
          responseCode: 404,
          responseMessage: "Property Usage not found",
        });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await PropertyUsage.findByIdAndDelete({ _id: objectId });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Property Usage deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

module.exports = {
  createPropertyUsage,
  editPropertyUsage,
  updatePropertyUsage,
  fetchPropertyUsage,
  deletePropertyUsage
};
