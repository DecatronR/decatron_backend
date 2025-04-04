const express = require("express");
const router = express.Router();
const { trackVisitor } = require("../controllers/trackController");

router.post("/", trackVisitor);

module.exports = router;
