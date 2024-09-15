const PropertyListing = require("../models/PropertyListing");
const Photos = require("../models/Photos");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");
const cloudinary = require("../config/cloudinaryConfig");

const createPropertyListing = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const {
    title,
    listingType,
    usageType,
    propertyType,
    propertySubType,
    propertyCondition,
    state,
    neighbourhood,
    size,
    lga,
    propertyDetails,
    NoOfLivingRooms,
    NoOfBedRooms,
    NoOfKitchens,
    NoOfParkingSpace,
    Price,
    virtualTour,
    video,
  } = req.body;

  try {
    const slug = title.toLowerCase().replace(/\s+/g, "-");

    // Create a new property listing without photos first
    const createNew = await PropertyListing.create({
      title,
      slug,
      listingType,
      usageType,
      propertyType,
      propertySubType,
      propertyCondition,
      state,
      neighbourhood,
      size,
      lga,
      propertyDetails,
      NoOfLivingRooms,
      NoOfBedRooms,
      NoOfKitchens,
      NoOfParkingSpace,
      Price,
      virtualTour,
      video,
    });

    if (createNew) {
      let counter = 0;

      // Check if files are uploaded
      if (req.files && req.files.length > 0) {
        const photoEntries = req.files.map((file) => ({
          propertyListingId: createNew._id,
          path: file.path, // Cloudinary URL is available in file.path
        }));

        // Insert all photo entries at once
        await Photos.insertMany(photoEntries);
        counter = photoEntries.length;
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
        return res.status(201).json({
          responseMessage: "Property Listed successfully without photos",
          responseCode: 201,
          data: {
            id: createNew._id,
          },
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
    if (!checkDb) {
      return res.status(404).json({
        responseMessage: "Record not found",
        responseCode: 404,
      });
    } else {
      console.log(checkDb);
      return res.status(200).json({
        responseMessage: "Record Found",
        responseCode: 200,
        data: checkDb,
        photos: checkPhoto,
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
      neighbourhood,
      size,
      lga,
      propertyDetails,
      NoOfLivingRooms,
      NoOfBedRooms,
      NoOfKitchens,
      NoOfParkingSpace,
      Price,
      virtualTour,
      video,
    } = req.body;

    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const Data = {
      title,
      slug,
      listingType,
      usageType,
      propertyType,
      propertySubType,
      propertyCondition,
      state,
      neighbourhood,
      size,
      lga,
      propertyDetails,
      NoOfLivingRooms,
      NoOfBedRooms,
      NoOfKitchens,
      NoOfParkingSpace,
      Price,
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

    if (!updated) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Could not update property",
      });
    }

    let counter = 0;
    if (req.files && req.files.length > 0) {
      // Delete existing photos
      const existingPhotos = await Photos.find({ propertyListingId: objectId });
      for (const photo of existingPhotos) {
        // Extract public_id from the Cloudinary URL
        const publicId = photo.path
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      await Photos.deleteMany({ propertyListingId: objectId });

      // Prepare new photo entries
      const photoEntries = req.files.map((file) => ({
        propertyListingId: id,
        path: file.path, // Cloudinary URL
      }));

      // Insert new photos
      await Photos.insertMany(photoEntries);
      counter = photoEntries.length;
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
    const { page = 1, limit = 10 } = req.query;

    const fetchRecords = await PropertyListing.aggregate([
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
          NoOfLivingRooms: 1,
          NoOfBedRooms: 1,
          NoOfKitchens: 1,
          NoOfParkingSpace: 1,
          Price: 1,
          virtualTour: 1,
          video: 1,
          photos: 1, // Include the photos array
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by creation date descending
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
    ]);

    const total = await PropertyListing.countDocuments();

    res.json({
      data: fetchRecords,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
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

    // Fetch associated photos to delete from Cloudinary
    const photos = await Photos.find({ propertyListingId: objectId });
    for (const photo of photos) {
      // Extract public_id from the Cloudinary URL
      const parts = photo.path.split("/");
      const fileNameWithExtension = parts[parts.length - 1];
      const folderName = "property_listings"; // Ensure this matches your Cloudinary folder
      const fileName = fileNameWithExtension.split(".")[0]; // Remove file extension

      const publicId = `${folderName}/${fileName}`;

      await cloudinary.uploader.destroy(publicId);
    }

    // Delete the property listing and associated photos from the database
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

module.exports = {
  createPropertyListing,
  editPropertyListing,
  updatePropertyListing,
  fetchPropertyListing,
  deletePropertyListing,
};
