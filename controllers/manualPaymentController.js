const ManualPayment = require("../models/ManualPayment");
const { validationResult } = require("express-validator");
const { getIO } = require("../utils/socket");

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

const getManualPayments = async (req, res) => {
  try {
    const payments = await ManualPayment.find().sort({ createdAt: -1 });

    return res.status(200).json({
      responseMessage: "Manual payments fetched successfully",
      responseCode: 200,
      data: payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      responseMessage: `Error fetching manual payments: ${error.message}`,
      responseCode: 500,
    });
  }
};

const getByContractId = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      responseCode: 400,
      responseMessage: errors.array(),
    });
  }

  const { contractId } = req.body;

  try {
    const payments = await ManualPayment.find({ contractId });

    if (payments.length === 0) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "No manual payments found for this contract",
      });
    }

    res.status(200).json({
      responseCode: 200,
      responseMessage: "Manual payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      responseCode: 500,
      responseMessage: `${error.message}`,
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      responseCode: 400,
      responseMessage: errors.array(),
    });
  }

  const { paymentId, status } = req.body;

  try {
    const payment = await ManualPayment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Payment record not found",
      });
    }

    payment.status = status;
    await payment.save();

    const io = getIO();

    console.log("Payment status changed:", payment.status);
    if (payment.status === "confirmed" || payment.status === "failed") {
      const eventPayload = {
        contractId: payment.contractId,
        paymentId: payment._id.toString(),
        status: payment.status,
      };

      io.to(payment.contractId).emit("paymentStatusChanged", eventPayload);
      io.to(payment.paymentId).emit("paymentStatusChanged", eventPayload);
    }
    console.log("paymentId to emit:", payment._id.toString());
    console.log("contractId to emit:", payment.contractId);

    console.log("Payment status changed:", payment.status);

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Payment status updated successfully",
      data: payment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      responseCode: 500,
      responseMessage: `Server error: ${error.message}`,
    });
  }
};

const getPaymentById = async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await ManualPayment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "Payment record not found",
      });
    }

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      responseCode: 500,
      responseMessage: `Server error: ${error.message}`,
    });
  }
};

module.exports = {
  create,
  getManualPayments,
  getByContractId,
  updatePaymentStatus,
  getPaymentById,
};
