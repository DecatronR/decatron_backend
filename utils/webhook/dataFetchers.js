const State = require("../../models/State");
const LGA = require("../../models/LGA");
const PropertyUsage = require("../../models/PropertyUsage");
const PropertyType = require("../../models/PropertyType");
const ListingType = require("../../models/ListingType");

// Dynamic data fetching functions
async function getStates() {
  try {
    const states = await State.find().select("state slug").sort("state");
    return states.map((state) => state.state);
  } catch (error) {
    console.error("Error fetching states:", error);
    return ["Abuja", "Lagos"]; // Fallback to hardcoded values
  }
}

async function getLGAsByState(stateName) {
  try {
    // First find the state to get its ObjectId
    const state = await State.findOne({ state: stateName });
    if (!state) {
      console.error(`State not found: ${stateName}`);
      return [];
    }

    console.log(
      `Found state: ${stateName}, ID: ${state._id}, Slug: ${state.slug}`
    );

    // Find LGAs for this state using the state's ObjectId
    // Try both ObjectId and string representation
    const lgas = await LGA.find({
      $or: [{ stateId: state._id.toString() }, { stateId: state._id }],
    })
      .select("lga slug stateId")
      .sort("lga");

    console.log(
      `Found ${lgas.length} LGAs for state ${stateName}:`,
      lgas.map((l) => ({ lga: l.lga, stateId: l.stateId }))
    );

    return lgas.map((lga) => lga.lga);
  } catch (error) {
    console.error("Error fetching LGAs:", error);
    return []; // Return empty array as fallback
  }
}

async function getPropertyUsages() {
  try {
    const usages = await PropertyUsage.find()
      .select("propertyUsage slug")
      .sort("propertyUsage");
    return usages.map((usage) => usage.propertyUsage);
  } catch (error) {
    console.error("Error fetching property usages:", error);
    return ["Residential", "Office Space", "Warehouse", "Shop"]; // Fallback
  }
}

async function getPropertyTypes() {
  try {
    const types = await PropertyType.find()
      .select("propertyType slug")
      .sort("propertyType");
    return types.map((type) => type.propertyType);
  } catch (error) {
    console.error("Error fetching property types:", error);
    return [
      "Fully Detached Duplex",
      "Semi Detached Duplex",
      "Terrace Duplex",
      "Fully Detached Bungalow",
      "Semi Detached Bungalow",
      "Apartment",
      "Mall/Plaza",
      "Villa",
      "Estate Land",
      "Non-Estate Land",
      "Self Contain",
      "Hall",
      "Flat",
      "Shop",
    ]; // Fallback
  }
}

async function getPropertyCategories() {
  try {
    const categories = await ListingType.find()
      .select("listingType slug")
      .sort("listingType");
    return categories.map((category) => category.listingType);
  } catch (error) {
    console.error("Error fetching property categories:", error);
    return ["Rent", "Sale", "Shortlet"]; // Fallback
  }
}

module.exports = {
  getStates,
  getLGAsByState,
  getPropertyUsages,
  getPropertyTypes,
  getPropertyCategories,
};
