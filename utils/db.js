const mongoose = require("mongoose");
require("dotenv").config();

const mongoDbUri = process.env.MONGO_DB_URI;

mongoose
  .connect(mongoDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));
