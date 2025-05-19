const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const frontendUrl = process.env.FRONTEND_URL;

const generateReceipt = async (payment) => {
  const doc = new PDFDocument({ margin: 50 });
  const receiptPath = path.join(
    __dirname,
    `../receipts/receipt-${payment._id}.pdf`
  );

  doc.pipe(fs.createWriteStream(receiptPath));

  // Logo
  const logoPath = path.join(__dirname, "../public/assets/images/logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 100 });
  }

  // Title
  doc
    .fontSize(24)
    .fillColor("#5a47fb")
    .text("Payment Receipt", { align: "center" })
    .moveDown();

  // Draw line separator
  doc.moveTo(50, 120).lineTo(550, 120).stroke("#e0e0e0").moveDown();

  // Payment details section
  doc.fontSize(14).fillColor("#333").text(`Receipt ID: ${payment._id}`);
  doc.text(`Name: ${payment.userName}`);
  doc.text(`Email: ${payment.userEmail}`);
  doc.text(`Amount Paid: ₦${payment.amount.toLocaleString()}`);
  doc.text(`Bank Name: ${payment.bankName}`);
  doc.text(`Account Name: ${payment.accountName}`);
  doc.text(`Account Number: ${payment.accountNumber}`);
  doc.text(`Contract ID: ${payment.contractId}`);
  doc.text(`Payment Status: ${payment.status}`);
  doc.text(`Date: ${new Date(payment.updatedAt).toLocaleString()}`);

  doc.moveDown(2);

  // Draw another line
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e0e0e0").moveDown();

  // QR Code title
  doc
    .fontSize(14)
    .fillColor("#5a47fb")
    .text("Scan to Verify Receipt", { align: "center" })
    .moveDown(0.5);

  // Generate QR Code
  const qrText = `${frontendUrl}/verify-receipt/${payment._id}`;
  const qrImageData = await QRCode.toDataURL(qrText);

  doc.image(qrImageData, (doc.page.width - 150) / 2, doc.y, {
    fit: [150, 150],
    align: "center",
  });

  // Footer
  doc
    .moveDown(2)
    .fontSize(10)
    .fillColor("#999")
    .text(`© ${new Date().getFullYear()} Decatron. All rights reserved.`, {
      align: "center",
    });

  doc.end();

  return receiptPath;
};

module.exports = generateReceipt;
