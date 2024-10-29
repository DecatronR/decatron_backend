const nodemailer = require("nodemailer");

const inspectionScheduledClient = async (
  email,
  name,
  agentName,
  agentContact,
  propertyTitle,
  propertyDescription,
  propertyLocation,
  bookingDateTime,
  bookingId
) => {
  const frontendUrl = process.env.FRONTEND_URL;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Create a new Date object from the bookingDateTime
  const bookingDate = new Date(bookingDateTime);

  // Extract and format the date as MM/DD/YYYY
  const formattedDate = bookingDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Extract and format the time as hh:mm AM/PM
  const formattedTime = bookingDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const mailOptions = {
    from: "Decatron <no-reply@decatron.com.ng>",
    to: email,
    subject: "Inspection Successfully Scheduled",
    html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:logo" alt="Decatron Logo" style="max-width: 150px;" />
        </div>
            <h2 style="color: #5a47fb; text-align: center;">Inspection Scheduled Successfully</h2>
            <p style="font-size: 16px;">
              Hi <strong>${name}</strong>, <br /><br />
              We are pleased to inform you that your inspection has been successfully scheduled.
              <br /><br />
              <strong>Here are your inspection details:</strong>
            </p>
            
            <table style="width: 100%; font-size: 14px; margin-top: 10px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Agent Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${agentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Agent Contact:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${agentContact}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Property Title:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${propertyTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Property Description:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${propertyDescription}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Location:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${propertyLocation}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;"><strong>Time:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${formattedTime}</td>
              </tr>
            </table>
  
            <div style="text-align: center; margin-top: 30px;">
              <a href="${frontendUrl}/inspection/tracking/${bookingId}" 
                 style="background-color: #5a47fb; color: white; text-decoration: none; 
                 padding: 12px 30px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                 Start Tracking
              </a>
            </div>
  
            <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
              If you have any questions, feel free to <a href="mailto:support@decatron.com" style="color: #5a47fb; text-decoration: none;">contact us</a>.
            </p>
          </div>
  
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #888;">
            © 2024 Decatron. All Rights Reserved.
          </div>
        </div>
      `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  inspectionScheduledClient,
};
