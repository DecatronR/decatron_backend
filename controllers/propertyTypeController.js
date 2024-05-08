const PropertyType = require("../models/PropertyType");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const createPropertyType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { propertyType } = req.body;

  try {
    const slug = propertyType.toLowerCase().replace(/\s+/g, "-");
    const existing = await PropertyType.findOne({ slug });

    if (existing) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "Property Type with the same name already exists",
      });
    }

    const createNew = await PropertyType.create({
      slug,
      propertyType,
    });
    // return res.send(propertyType);
    if (createNew) {
      return res.status(201).json({
        responseMessage: "Property Type created successfully",
        responseCode: 201,
        data: {
          id: createNew._id,
          slug: createNew.slug,
          propertyType: createNew.propertyType,
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

const editPropertyType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { id } = req.body;
    const objectId = new ObjectId(id);
    const checkDb = await PropertyType.findOne({ _id: objectId });
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
          propertyType: checkDb.propertyType,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ responseCode: 400, responseMessage: error.message });
  }
};

const updatePropertyType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const { id, propertyType } = req.body;
    const slug = propertyType.toLowerCase().replace(/\s+/g, "-");

    const Data = { propertyType, slug };
    const updated = await PropertyType.findOneAndUpdate(
      { _id: id },
      Data,
      {
        new: true,
      }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "Property Type not found" });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Property Type updated successfully",
      role: {
        id: updated.id,
        propertyType: updated.propertyType,
      },
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

const fetchPropertyType = async (req, res) => {
  try {
    // const users = await User.find();
    const fetchRcords = await PropertyType.find().select(
      "slug propertyType createdAt"
    );
    res.json(fetchRcords);
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const deletePropertyType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { id } = req.body;
    const objectId = new ObjectId(id);
    const check = await PropertyType.findById({ _id: objectId });
    if (!check) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "Property Type not found" });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await PropertyType.findByIdAndDelete({ _id: objectId });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Property Type deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

module.exports = {
  createPropertyType,
  editPropertyType,
  updatePropertyType,
  fetchPropertyType,
  deletePropertyType
};
