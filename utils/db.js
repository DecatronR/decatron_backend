const mongoose = require("mongoose");
// const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://ezekialafolabi11:GDxEcRBBdGrL6BJ2@cluster0.xglip.mongodb.net/", { })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

// require("dotenv").config();
// const mongoDbUri = process.env.MONGO_DB_URI;
// mongoose
//   .connect(mongoDbUri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to DB"))
//   .catch((err) => console.log(err));
