const SubscriptionPlan = require("../models/SubscriptionPlan");
const { validationResult } = require("express-validator");
const { formatRoleId } = require("../utils/helpers");
const { ObjectId } = require("mongodb");

const create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { plan, period } = req.body;
  try {
    const existing = await SubscriptionPlan.findOne({ plan });
    if (existing) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "Plan with the same name already exists",
      });
    }
    const newRecord = await SubscriptionPlan.create({
      plan,
      period,
    });
    if (newRecord) {
      return res.status(201).json({
        responseMessage: "Plan created successfully",
        responseCode: 201,
        data: newRecord,
      });
    } else {
      return res.status(400).send({
        responseMessage: "Plan creation failed.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { id } = req.body;
    const objId = new ObjectId(id);
    const existing = await SubscriptionPlan.findById({ _id: objId });
    if (!existing) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Plan not in our records",
      });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await SubscriptionPlan.findByIdAndDelete({ _id: objId });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Subscription Plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const fetch = async (req, res) => {
  try {
    // const users = await User.find();
    const getRecords = await SubscriptionPlan.find().select(
      "plan period createdAt"
    );
    res.json(getRecords);
  } catch (getRecords) {
    res.status(500).json({ responseMessage: error.message });
  }
};
module.exports = {
  create,
  deleteRecord,
  fetch,
};
