const ListingType = require("../models/ListingType");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const createListingType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { listingType } = req.body;

  try {
    const slug = listingType.toLowerCase().replace(/\s+/g, "-");
    const existinglistingType = await ListingType.findOne({ slug });

    if (existinglistingType) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "Listing Type with the same name already exists",
      });
    }

    const newListingType = await ListingType.create({
      slug,
      listingType
    });
    // return res.send(listingType);
    if (newListingType) {
      return res.status(201).json({
        responseMessage: "Listing Type created successfully",
        responseCode: 201,
        data: {
          id: newListingType._id,
          slug: newListingType.slug,
          listingType: newListingType.listingType,
        },
      });
    } else {
      return res.status(400).send({
        responseMessage: "Listing Type creation failed.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

const editListingType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { id } = req.body;
    const objectId = new ObjectId(id);
    const ListingTypedb = await ListingType.findOne({ _id: objectId });
    if (!ListingTypedb) {
      return res.status(404).json({
        responseMessage: "Record not found",
        responseCode: 404,
      });
    } else {
      return res.status(200).json({
        responseMessage: "Record Found",
        responseCode: 200,
        data: {
          id: ListingTypedb._id,
          slug: ListingTypedb.slug,
          listingType: ListingTypedb.listingType,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ responseCode: 400, responseMessage: error.message });
  }
};

const updateListingType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const { id, listingType } = req.body;
    const slug = listingType.toLowerCase().replace(/\s+/g, "-");

    const listingData = { listingType, slug };
    const updated = await ListingType.findOneAndUpdate(
      { _id: id },
      listingData,
      {
        new: true,
      }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "Listing Type not found" });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Listing Type updated successfully",
      role: {
        id: updated.id,
        listingType: updated.listingType,
      },
    });
  } catch (error) {
   
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

const fetchListingType = async (req, res) => {
  try {
    // const users = await User.find();
    const fetchRcords = await ListingType.find().select("slug listingType createdAt");
    res.json(fetchRcords);
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const deleteListingType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { id } = req.body;
    const objectId = new ObjectId(id);
    const check = await ListingType.findById({ _id: objectId });
    if (!check) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "Listing Type not found" });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await ListingType.findByIdAndDelete({ _id: objectId });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Listed Type deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

module.exports = {
  createListingType,
  editListingType,
  updateListingType,
  fetchListingType,
  deleteListingType
};
