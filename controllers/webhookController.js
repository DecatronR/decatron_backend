const PropertyRequest = require("../models/PropertyRequest");

// In-memory state store for demo (use Redis or DB for production)
const userStates = new Map();

// Helper: Send Twilio WhatsApp reply
const twilio = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'

async function sendWhatsAppReply(to, body) {
  return client.messages.create({
    from: twilioNumber,
    to,
    body,
  });
}

// Main webhook handler
const whatsappWebhook = async (req, res) => {
  const from = req.body.From; // e.g., 'whatsapp:+2348012345678'
  const body = (req.body.Body || "").trim();

  // Get user state
  let state = userStates.get(from) || "menu";

  if (/^(hi|hello)$/i.test(body)) {
    state = "menu";
  }

  if (state === "menu") {
    await sendWhatsAppReply(
      from,
      `Hi! Welcome to Decatron.\nTo make a property request, type 1.\nTo see all recent property requests, type 2.`
    );
    userStates.set(from, "awaiting_menu_selection");
    return res.sendStatus(200);
  }

  if (state === "awaiting_menu_selection") {
    if (body === "1") {
      await sendWhatsAppReply(
        from,
        `Please enter your property request in the following format:\n[Property Type], [Category], [Budget], [State], [LGA], [Neighbourhood], [Any notes]\nExample: Apartment, Rent, 5000000, Lagos, Ikeja, Ikeja GRA, 2-bedroom, close to mall`
      );
      userStates.set(from, "awaiting_request_details");
      return res.sendStatus(200);
    } else if (body === "2") {
      // Optionally, fetch and show recent requests (limit to 3 for brevity)
      const recent = await PropertyRequest.find({ source: "whatsapp" })
        .sort({ createdAt: -1 })
        .limit(3);
      if (recent.length === 0) {
        await sendWhatsAppReply(from, "No recent property requests found.");
      } else {
        const msg = recent
          .map(
            (r) =>
              `${r.propertyType}, ${r.category}, ₦${r.budget}, ${r.state}, ${r.lga}, ${r.neighbourhood}`
          )
          .join("\n");
        await sendWhatsAppReply(from, `Recent property requests:\n${msg}`);
      }
      userStates.set(from, "menu");
      return res.sendStatus(200);
    } else {
      await sendWhatsAppReply(
        from,
        "Invalid option. Please type 1 to make a request or 2 to see recent requests."
      );
      return res.sendStatus(200);
    }
  }

  if (state === "awaiting_request_details") {
    // Parse request details
    const parts = body.split(",").map((s) => s.trim());
    if (parts.length < 6) {
      await sendWhatsAppReply(
        from,
        "Invalid format. Please use the format: [Property Type], [Category], [Budget], [State], [LGA], [Neighbourhood], [Any notes]"
      );
      return res.sendStatus(200);
    }
    // Save to DB
    const [
      propertyType,
      category,
      budget,
      stateVal,
      lga,
      neighbourhood,
      ...noteArr
    ] = parts;
    const note = noteArr.join(", ");
    await PropertyRequest.create({
      propertyType,
      category,
      budget: Number(budget),
      state: stateVal,
      lga,
      neighbourhood,
      note,
      phone: from.replace("whatsapp:", ""),
      source: "whatsapp",
      status: "open",
    });
    await sendWhatsAppReply(
      from,
      `Thank you! Your request has been received. We'll share it with our large network of property developers, managers, and owners. You can follow up or see more properties at decatron.com.ng.`
    );
    userStates.set(from, "menu");
    return res.sendStatus(200);
  }

  // Fallback
  await sendWhatsAppReply(
    from,
    `Sorry, I didn't understand that. Please type 'Hello' to start.`
  );
  userStates.set(from, "menu");
  res.sendStatus(200);
};

module.exports = { whatsappWebhook };
