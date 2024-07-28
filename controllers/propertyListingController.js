const PropertyListing = require("../models/PropertyListing");
const Photos = require("../models/Photos");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

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
    photo
  } = req.body;

  try {
    const slug = title.toLowerCase().replace(/\s+/g, "-");

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
      video
    });
    // return res.send(propertyType);
    if (createNew) {
      //INSERT PHOTO WITH RECORD ID
      console.log(createNew);
      var counter = 0;
      for (const photoEntry of photo) {
        await Photos.create({ 
          propertyListingId: createNew._id,
          path: photoEntry.path 
        });
        counter++;
      }
      if(counter > 0){
        return res.status(201).json({
          responseMessage: "Property Listed successfully",
          responseCode: 201,
          data: {
            id: createNew._id
          },
        });
      }else{
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
        photos:checkPhoto
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
    // const { id, propertyType } = req.body;
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
      photo
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
      photo
    };
    const objectId = new ObjectId(id);
    const updated = await PropertyListing.findOneAndUpdate({ _id: objectId }, Data, {
      new: true,
    });
    var counter = 0;
    for (const photoEntry of photo) {
      counter++;
    }
    if(counter > 0){
      await Photos.deleteMany({ propertyListingId: objectId });
      for (const photoEntry of photo) {
        await Photos.create({ 
          propertyListingId: id,
          path: photoEntry.path 
        });
      }
    }
    
    if (!updated) {
      return res
        .status(404)
        .json({
          responseCode: 404,
          responseMessage: "Could not update property",
        });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Property updated successfully",
      data: {
        data: updated
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
          _idString: { $toString: "$_id" }
        }
      },
      {
        $lookup: {
          from: 'photos', // The name of the photos collection
          localField: '_idString', // The field from PropertyListing as string
          foreignField: 'propertyListingId', // The field from the photos collection that matches
          as: 'photos' // The name of the array field to be added to each document
        }
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
          createdAt: 1
        }
      }
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
      return res
        .status(404)
        .json({
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

module.exports = {
  createPropertyListing,
  editPropertyListing,
  updatePropertyListing,
  fetchPropertyListing,
  deletePropertyListing
};
