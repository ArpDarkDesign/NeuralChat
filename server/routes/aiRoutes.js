const express = require("express");

const router = express.Router();

const { chatWithAI } = require("../controllers/aiController");
const upload = require("../middleware/upload");

router.post("/chat", upload.array("files", 5), chatWithAI);

module.exports = router;
