const nodemailer = require("nodemailer");
const path = require("path");

const sendPropertyRequestNotification = async (
  email,
  name,
  propertyRequest
) => {
  const frontendUrl = process.env.FRONTEND_URL;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const logoPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "images",
    "logo.png"
  );

  const mailOptions = {
    from: "Decatron <no-reply@decatron.com.ng>",
    to: email,
    subject: "New Property Request on Decatron - Don't Miss This Lead!",
    html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:logo" alt="Decatron Logo" style="max-width: 150px;" />
          </div>
            <h2 style="color: #5a47fb; text-align: center;">New Property Request Alert!</h2>
            <p style="font-size: 16px;">
              Hi <strong>${name}</strong>, <br /><br />
              Hope you've been doing well. We just wanted to let you know that a new client recently requested a property type you typically handle — and we thought of you immediately.
            </p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #5a47fb;">
              <h3 style="color: #5a47fb; margin-top: 0;">Request Summary:</h3>
              <p><strong>Property Type:</strong> ${
                propertyRequest.propertyType
              }</p>
              <p><strong>Category:</strong> ${propertyRequest.category}</p>
              <p><strong>Location:</strong> ${propertyRequest.neighbourhood}, ${
      propertyRequest.lga
    }, ${propertyRequest.state}</p>
              <p><strong>Budget:</strong> ₦${
                propertyRequest.minBudget
                  ? propertyRequest.minBudget.toLocaleString() +
                    " - ₦" +
                    propertyRequest.maxBudget.toLocaleString()
                  : propertyRequest.maxBudget.toLocaleString()
              }</p>
              ${
                propertyRequest.note
                  ? `<p><strong>Additional Notes:</strong> ${propertyRequest.note}</p>`
                  : ""
              }
              <p><strong>Requester Type:</strong> ${
                propertyRequest.role === "buyer"
                  ? "Buyer/Renter"
                  : propertyRequest.role === "agent"
                  ? "Agent"
                  : propertyRequest.role === "owner"
                  ? "Owner"
                  : propertyRequest.role === "property-manager"
                  ? "Property Manager"
                  : propertyRequest.role
              }</p>
            </div>

            <p style="font-size: 16px;">
              If you have something that fits, you could quickly respond and close this deal.
              <br /><br />
              <strong>Quick heads-up:</strong> We're giving early partners like you exclusive access to priority requests like this during our pilot phase. The client will be notified of your listing immediately.
            </p>
  
            <div style="text-align: center; margin-top: 30px;">
              <a href=${frontendUrl}
                 style="background-color: #5a47fb; color: white; text-decoration: none; 
                 padding: 12px 30px; border-radius: 20px; font-size: 16px; font-weight: bold;">
                 List My Property Now
              </a>
            </div>
  
            <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
              Looking forward to reconnecting. <br />
              Warm regards, <br />
              Kolade & The Decatron Team
            </p>
          </div>
  
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #888;">
            © ${new Date().getFullYear()} Decatron. All Rights Reserved.
          </div>
        </div>
      `,
    attachments: [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "logo",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending property request notification email:", err);
  }
};

module.exports = {
  sendPropertyRequestNotification,
};
