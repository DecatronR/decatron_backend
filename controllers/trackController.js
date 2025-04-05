const axios = require("axios");
const Visitor = require("../models/Visitor");
const UAParser = require("ua-parser-js");
const { sendWhatsAppNotification } = require("../utils/helpers");

exports.trackVisitor = async (req, res) => {
  // Function to get geolocation info from IP

  console.log("IPINFO API KEY: ", process.env.IPINFO_API_KEY);
  const getGeolocationFromIp = async (ip) => {
    try {
      const response = await axios.get(
        `https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_API_KEY}`
      );
      console.log("IPInfo API Response:", response.data);
      const { country, region } = response.data; // Extract country and region from the response
      console.log("Country: ", country, "Region: ", region);
      return { country, region };
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      return { country: "Unknown", region: "Unknown" }; // Default to unknown if there's an error
    }
  };

  try {
    const { ip, visitorId, notify, userAgent } = req.body;

    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";
    const device = parser.getDevice().type || "Desktop";
    console.log("IP address: ", ip);
    const { country, region } = await getGeolocationFromIp(ip);
    let visitor = await Visitor.findOne({ visitorId });

    if (visitor) {
      visitor.visits.push({ timestamp: new Date(), country, region });
      await visitor.save();
    } else {
      visitor = await Visitor.create({
        visitorId,
        browser,
        os,
        device,
        visits: [
          {
            timestamp: new Date(),
            country,
            region,
          },
        ],
      });
    }

    // Notify only if frontend says "yes"
    if (notify) {
      await sendWhatsAppNotification({
        visitorId,
        browser,
        os,
        device,
        timestamp: new Date(),
        country,
        region,
      });
    }

    return res.status(200).json({ message: "Visitor tracked", visitor });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
