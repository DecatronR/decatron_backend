const Agenda = require("agenda");
require("dotenv").config();

const mongoDbUri = process.env.MONGO_DB_URI;

const agenda = new Agenda({
  db: { address: mongoDbUri, collection: "agendaJobs" },
});

module.exports = agenda;
