const Visitor = require("../models/visitorModel");
const UAParser = require("ua-parser-js");

exports.trackVisitor = async (req, res) => {
  try {
    const { ip, userAgent } = req.body;
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";
    const device = parser.getDevice().type || "Desktop";

    // Check if visitor already exists based on IP & browser
    let visitor = await Visitor.findOne({ ip, browser, os, device });

    if (visitor) {
      // Add new visit timestamp
      visitor.visits.push({ timestamp: new Date() });
      await visitor.save();
    } else {
      // Create new visitor entry
      visitor = await Visitor.create({
        ip,
        browser,
        os,
        device,
        visits: [{ timestamp: new Date() }],
      });
    }

    return res.status(200).json({ message: "Visitor tracked", visitor });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
