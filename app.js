const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
require("./utils/db");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const roleRouter = require("./routes/role");
const propertyListingRouter = require("./routes/propertyListing");
const listingTypeRouter = require("./routes/listingType");
const propertyTypeRouter = require("./routes/propertyType");
const propertyUsageRouter = require("./routes/propertyUsage");
const propertyConditionRouter = require("./routes/propertyCondition");
const stateRouter = require("./routes/state");
const lgaRouter = require("./routes/lga");
const favoriteRouter = require("./routes/favorite");
const myScheduleRouter = require("./routes/mySchedule");
const reviewRouter = require("./routes/review");
const bookingRouter = require("./routes/booking");
const agencyRequestRouter = require("./routes/agencyRequest");
const paymentRouter = require("./routes/payment");
const trackRouter = require("./routes/track");
const notificationRouter = require("./routes/notification");
const contractRouter = require("./routes/contract");
const messageRouter = require("./routes/message");
const apiRouter = require("./routes/api");
const eSignatureRouter = require("./routes/api");

const app = express();

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://decatron-dashboard.vercel.app",
      "https://decatron360.vercel.app",
      "https://www.decatron.com.ng",
    ];
    // Allow requests from Postman (without an origin)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  credentials: true,
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/role", roleRouter);
app.use("/propertyListing", propertyListingRouter);
app.use("/listingType", listingTypeRouter);
app.use("/propertyType", propertyTypeRouter);
app.use("/state", stateRouter);
app.use("/lga", lgaRouter);
app.use("/propertyUsage", propertyUsageRouter);
app.use("/propertyCondition", propertyConditionRouter);
app.use("/favorite", favoriteRouter);
app.use("/mySchedule", myScheduleRouter);
app.use("/review", reviewRouter);
app.use("/booking", bookingRouter);
app.use("/agencyRequest", agencyRequestRouter);
app.use("/payment", paymentRouter);
app.use("/track", trackRouter);
app.use("/notification", notificationRouter);
app.use("/contract", contractRouter);
app.use("/message", messageRouter);
app.use("/api", apiRouter);
app.use("/eSignature", eSignatureRouter);

// catch 404 and send response directly (Option 1)

app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

app.use(function (req, res) {
  res.status(404).json({
    responseCode: 404,
    responseMessage: "Endpoint does not exist",
  });
});

// error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error response
  res.status(err.status || 500).json({
    responseCode: err.status || 500,
    responseMessage: err.message || "Unknown error occurred",
  });
});

module.exports = app;
