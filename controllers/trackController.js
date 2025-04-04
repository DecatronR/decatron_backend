const Visitor = require("../models/Visitor.js");

exports.trackVisitor = async (req, res) => {
  try {
    const { ip, userAgent } = req.body;

    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";
    const device = parser.getDevice().type || "Desktop";

    console.log(
      `Visitor Info: IP - ${ip}, Browser - ${browser}, OS - ${os}, Device - ${device}`
    );

    await Visitor.create({ ip, browser, os, device });

    return res.status(200).json({ message: "Visitor tracked successfully" });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
