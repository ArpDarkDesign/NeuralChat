const express = require("express");

const router = express.Router();

const {
  getChats,
  saveChat,
  deleteChat,
  getUserStats,
} = require("../controllers/chatController");

router.get("/:userId", getChats);
router.get("/stats/:userId", getUserStats);
router.post("/", saveChat);

router.delete("/:id", deleteChat);

module.exports = router;