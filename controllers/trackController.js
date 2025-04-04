// Optional: Import model if you're saving to a DB
// const Visitor = require('../models/Visitor');

exports.trackVisitor = async (req, res) => {
  try {
    const { ip, userAgent } = req.body;

    console.log(`Visitor Info: IP - ${ip}, User Agent - ${userAgent}`);

    // Example: Save to DB if using a model
    // await Visitor.create({ ip, userAgent });

    return res.status(200).json({ message: "Visitor tracked successfully" });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
