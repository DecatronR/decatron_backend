const ManualPayment = require("../models/ManualPayment");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { contractId, accountName, accountNumber, bankName, amount } = req.body;

  // Fetch the attached user details from req.user.details
  if (!req.user || !req.user.details) {
    return res.status(401).json({
      responseMessage: "User not authenticated",
      responseCode: 401,
    });
  }

  const user = {
    id: req.user.details._id,
    email: req.user.details.email,
    name: req.user.details.name,
  };

  try {
    const newManualPayment = await ManualPayment.create({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      contractId,
      accountName,
      accountNumber,
      bankName,
      amount,
      status: "pending",
    });

    if (newManualPayment) {
      return res.status(201).json({
        responseMessage: "Manual payment logged successfully",
        responseCode: 201,
        data: newManualPayment,
      });
    } else {
      return res.status(400).send({
        responseMessage: "Could not log manual payment.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

module.exports = {
  create,
};
