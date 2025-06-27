const PropertyRequest = require("../models/PropertyRequest");

// Create a new property request
const createPropertyRequest = async (req, res) => {
  try {
    const data = req.body;
    const request = await PropertyRequest.create(data);
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Fetch all property requests with filtering, sorting, and pagination
const getAllPropertyRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
      ...filters
    } = req.query;
    const sort = { [sortBy]: order === "asc" ? 1 : -1 };
    // Only allow filtering by known fields
    const allowedFilters = [
      "status",
      "state",
      "lga",
      "neighbourhood",
      "category",
      "propertyType",
      "propertyUsage",
      "source",
      "userId",
      "phone",
      "role",
    ];
    const query = {};
    for (const key of allowedFilters) {
      if (filters[key]) query[key] = filters[key];
    }
    const requests = await PropertyRequest.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await PropertyRequest.countDocuments(query);
    res.json({ requests, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch property requests by userId
const getPropertyRequestsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await PropertyRequest.find({ userId }).sort({
      createdAt: -1,
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch property requests by phone
const getPropertyRequestsByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const requests = await PropertyRequest.find({ phone }).sort({
      createdAt: -1,
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a property request by id
const updatePropertyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    data.updatedAt = new Date();
    const request = await PropertyRequest.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!request) {
      return res.status(404).json({ error: "Property request not found" });
    }
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createPropertyRequest,
  getAllPropertyRequests,
  getPropertyRequestsByUser,
  getPropertyRequestsByPhone,
  updatePropertyRequest,
};
