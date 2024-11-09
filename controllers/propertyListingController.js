const PropertyListing = require("../models/PropertyListing");
const Photos = require("../models/Photos");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

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
      console.log(createNew);
      let counter = 0;

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'properties', // Optional: specify a folder in Cloudinary
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

    const photos = req.files; // Access uploaded files

    const Data = {
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
    // const users = await User.find();
    // const fetchRcords = await PropertyListing.find().select(
    //   "title slug listingType usageType propertyType propertySubType propertyCondition state neighbourhood size propertyDetails NoOfLivingRooms NoOfBedRooms NoOfKitchens NoOfParkingSpace Price virtualTour video photo createdAt"
    // );
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
          lga:1,
          propertyDetails: 1,
          NoOfLivingRooms: 1,
          NoOfBedRooms: 1,
          NoOfKitchens: 1,
          NoOfParkingSpace: 1,
          Price: 1,
          virtualTour: 1,
          video: 1,
          photos: 1,
          createdAt: 1,
        },
      },
    ]);

    res.json(fetchRecords);
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
    const fetchRecords = await PropertyListing.aggregate([
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
    ]);
    res.json(fetchRecords);
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
  myProperty,
};
