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

const app = express();

//CORS option for specifically port 3000,
//To use this CORS option pass it into the  app.use(cors()) like so app.use(cors(corsOptionns))

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://decatron-dashboard.vercel.app",
    ];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  credentials: true,
};

//Enabiling cors for all routes
app.use(cors(corsOptions));

// view engine setup
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
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // next(createError(404));
  next(
    res
      .status(404)
      .json({ responseCode: 404, responseMessage: "endpoint does not exist" })
  );
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
