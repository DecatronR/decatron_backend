const User = require("../models/User");
const PropertyListing = require("../models/PropertyListing");
const Photos = require("../models/Photos");
const Favorite = require("../models/Favorite");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createPropertyListing = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const {
    userID,
    title,
    listingType,
    usageType,
    propertyType,
    propertySubType,
    propertyCondition,
    state,
    lga,
    neighbourhood,
    houseNoStreet,
    size,
    propertyDetails,
    // livingrooms,
    bedrooms,
    bathrooms,
    // parkingSpace,
    price,
    inspectionFee,
    cautionFee,
    agencyFee,
    latePaymentFee,
    virtualTour,
    video,
    photo,
  } = req.body;

  try {
    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const createNew = await PropertyListing.create({
      userID,
      title,
      slug,
      listingType,
      usageType,
      propertyType,
      propertySubType,
      propertyCondition,
      state,
      lga,
      neighbourhood,
      houseNoStreet,
      size,
      propertyDetails,
      livingrooms,
      bedrooms,
      bathrooms,
      parkingSpace,
      price,
      inspectionFee,
      cautionFee,
      agencyFee,
      latePaymentFee,
      virtualTour,
      video,
    });

    if (createNew) {
      console.log(createNew);
      let counter = 0;

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "properties", // Optional: specify a folder in Cloudinary
          });

          // Save the Cloudinary URL to the Photos model
          await Photos.create({
            propertyListingId: createNew._id,
            path: result.secure_url, // Cloudinary URL
          });

          // Optionally, delete the local file after uploading to Cloudinary
          // fs.unlinkSync(file.path);

          counter++;
        }
      }

      if (counter > 0) {
        return res.status(201).json({
          responseMessage: "Property Listed successfully",
          responseCode: 201,
          data: {
            id: createNew._id,
          },
        });
      } else {
        return res.status(204).json({
          responseMessage: "Oops - Something went wrong",
          responseCode: 204,
        });
      }
    } else {
      return res.status(400).send({
        responseMessage: "Property Listing creation failed.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

const editPropertyListing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { id } = req.body;
    const objectId = new ObjectId(id);
    const checkDb = await PropertyListing.findOne({ _id: objectId });
    const checkPhoto = await Photos.find({ propertyListingId: objectId });
    const userID = checkDb.userID;
    const gottenUser = await User.find({ _id: userID });
    if (!checkDb) {
      return res.status(404).json({
        responseMessage: "Record not found",
        responseCode: 404,
      });
    } else {
      // console.log(gottenUser[0].role);
      return res.status(200).json({
        responseMessage: "Record Found",
        responseCode: 200,
        data: checkDb,
        photos: checkPhoto,
        role: gottenUser[0].role,
      });
    }
  } catch (error) {
    res.status(400).json({ responseCode: 400, responseMessage: error.message });
  }
};

const updatePropertyListing = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const {
      id,
      title,
      listingType,
      usageType,
      propertyType,
      propertySubType,
      propertyCondition,
      state,
      lga,
      neighbourhood,
      houseNoStreet,
      size,
      propertyDetails,
      livingrooms,
      bedrooms,
      bathrooms,
      parkingSpace,
      price,
      inspectionFee,
      cautionFee,
      agencyFee,
      latePaymentFee,
      virtualTour,
      video,
    } = req.body;

    const photos = req.files; // Access uploaded files

    const Data = {
      title,
      listingType,
      usageType,
      propertyType,
      propertySubType,
      propertyCondition,
      state,
      lga,
      neighbourhood,
      houseNoStreet,
      size,
      propertyDetails,
      livingrooms,
      bedrooms,
      bathrooms,
      parkingSpace,
      price,
      inspectionFee,
      cautionFee,
      agencyFee,
      latePaymentFee,
      virtualTour,
      video,
    };

    const objectId = new ObjectId(id);
    const updated = await PropertyListing.findOneAndUpdate(
      { _id: objectId },
      Data,
      {
        new: true,
      }
    );

    // Process uploaded photos
    if (photos.length > 0) {
      await Photos.deleteMany({ propertyListingId: objectId });
      photos.forEach((photo) => {
        Photos.create({ propertyListingId: id, path: photo.path });
      });
    }

    if (!updated) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Could not update property",
      });
    }

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Property updated successfully",
      data: {
        data: updated,
      },
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

const fetchPropertyListing = async (req, res) => {
  try {
    // Extract search parameters and pagination from query string
    const {
      state,
      lga,
      title,
      livingrooms,
      bedrooms,
      bathrooms,
      page = 1,
      limit = 2,
    } = req.query;

    // Convert pagination params to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build match conditions based on provided filters
    const matchConditions = {};

    if (state) {
      matchConditions.state = { $regex: state, $options: "i" }; // Case-insensitive search
    }

    if (lga) {
      matchConditions.lga = { $regex: lga, $options: "i" }; // Case-insensitive search
    }

    if (title) {
      matchConditions.title = { $regex: title, $options: "i" }; // Case-insensitive search
    }

    if (livingrooms) {
      matchConditions.livingrooms = parseInt(livingrooms);
    }

    if (bedrooms) {
      matchConditions.bedrooms = parseInt(bedrooms);
    }

    if (bathrooms) {
      matchConditions.bathrooms = parseInt(bathrooms);
    }

    // Build the aggregation pipeline
    const pipeline = [];

    // Add match stage only if there are conditions to match
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add the remaining stages
    pipeline.push(
      {
        $addFields: {
          _idString: { $toString: "$_id" },
        },
      },
      {
        $lookup: {
          from: "photos", // The name of the photos collection
          localField: "_idString",
          foreignField: "propertyListingId",
          as: "photos",
        },
      },
      {
        $lookup: {
          from: "users", // The name of the users collection
          localField: "userId", // Assuming there's a userId field in PropertyListing
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true, // This ensures the document is not dropped if no user is found
        },
      },
      {
        $project: {
          title: 1,
          slug: 1,
          listingType: 1,
          usageType: 1,
          propertyType: 1,
          propertySubType: 1,
          propertyCondition: 1,
          state: 1,
          lga: 1,
          neighbourhood: 1,
          houseNoStreet: 1,
          size: 1,
          propertyDetails: 1,
          livingrooms: 1,
          bedrooms: 1,
          bathrooms: 1,
          parkingSpace: 1,
          price: 1,
          inspectionFee: 1,
          cautionFee: 1,
          agencyFee: 1,
          latePaymentFee: 1,
          virtualTour: 1,
          video: 1,
          isSoldOut: 1,
          photos: 1,
          createdAt: 1,
          userRole: "$user.role", // Add the user's role
        },
      }
    );

    // Create a separate pipeline for counting total documents (before pagination)
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });

    // Add pagination to the main pipeline
    pipeline.push({ $skip: skip }, { $limit: limitNumber });

    // Execute both pipelines
    const [fetchRecords, countResult] = await Promise.all([
      PropertyListing.aggregate(pipeline),
      PropertyListing.aggregate(countPipeline),
    ]);

    const totalRecords = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalRecords / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.json({
      responseCode: 200,
      responseMessage: "Properties fetched successfully",
      data: fetchRecords,
      pagination: {
        currentPage: pageNumber,
        totalPages: totalPages,
        totalRecords: totalRecords,
        recordsPerPage: limitNumber,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPage: hasNextPage ? pageNumber + 1 : null,
        prevPage: hasPrevPage ? pageNumber - 1 : null,
      },
      filters: matchConditions, // Optional: return applied filters
    });
  } catch (error) {
    res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

const deletePropertyListing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { id } = req.body;
    const objectId = new ObjectId(id);
    const check = await PropertyListing.findById({ _id: objectId });
    if (!check) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Property Listing not found",
      });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await PropertyListing.findByIdAndDelete({ _id: objectId });
    await Photos.deleteMany({ propertyListingId: objectId });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Property Listing deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const myProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { userID } = req.body;
    const properties = await PropertyListing.aggregate([
      {
        $match: {
          userID: userID, // Filter records where userID matches the provided userID
        },
      },
      {
        $addFields: {
          _idString: { $toString: "$_id" },
        },
      },
      {
        $lookup: {
          from: "photos", // The name of the photos collection
          localField: "_idString", // The field from PropertyListing as string
          foreignField: "propertyListingId", // The field from the photos collection that matches
          as: "photos", // The name of the array field to be added to each document
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          listingType: 1,
          usageType: 1,
          propertyType: 1,
          propertySubType: 1,
          propertyCondition: 1,
          state: 1,
          neighbourhood: 1,
          size: 1,
          propertyDetails: 1,
          livingrooms: 1,
          bedrooms: 1,
          bathrooms: 1,
          parkingSpace: 1,
          price: 1,
          isSoldOut: 1,
          inspectionFee: 1,
          cautionFee: 1,
          agencyFee: 1,
          latePaymentFee: 1,
          virtualTour: 1,
          video: 1,
          photos: 1, // Include the photos array
          createdAt: 1,
        },
      },
    ]);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const isSoldOut = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const { id } = req.body;

    const updateData = { isSoldOut: 1 };
    const updated = await PropertyListing.findOneAndUpdate(
      { _id: id },
      updateData,
      {
        new: true,
      }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "Record not found" });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Status updated successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ responseCode: 500, responseMessage: error.message });
  }
};

module.exports = {
  createPropertyListing,
  editPropertyListing,
  updatePropertyListing,
  fetchPropertyListing,
  deletePropertyListing,
  myProperty,
  isSoldOut,
};
