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
    const updated = await PropertyType.findOneAndUpdate({ _id: id }, Data, {
      new: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({
          responseCode: 404,
          responseMessage: "Property Type not found",
        });
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
        .json({
          responseCode: 404,
          responseMessage: "Property Type not found",
        });
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
  createPropertyListing,
  editPropertyListing,
  updatePropertyType,
  fetchPropertyType,
  deletePropertyType,
};
