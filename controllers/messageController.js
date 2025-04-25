const Message = require("../models/Message");
const { validationResult } = require("express-validator");

const fetchMessagesByContractId = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      responseCode: 400,
      responseMessage: errors.array(),
    });
  }

  try {
    const { contractId } = req.body;

    const messages = await Message.find({ contractId })
      .populate("from", "name") // Populate user name
      .populate("to", "name") // Populate user name
      .sort({ timestamp: 1 }); // Sort messages by timestamp (ascending)

    if (messages.length === 0) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: "No messages found for this contract.",
      });
    }

    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Messages fetched successfully.",
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      responseMessage: error.message,
    });
  }
};

module.exports = {
  fetchMessagesByContractId,
};
