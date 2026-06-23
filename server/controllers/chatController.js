const Chat = require("../models/Chat");
const mongoose = require("mongoose");

const getChats = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("GET CHATS USER:", userId);
    const chats = await Chat.find({ userId }).sort({
      updatedAt: -1,
    });

    res.json(chats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({ userId });

    let totalMessages = 0;

    const activityMap = {};

    chats.forEach((chat) => {
      const userMessages = chat.messages.filter((msg) => msg.sender === "user");

      totalMessages += userMessages.length;

      const day = new Date(chat.updatedAt).toLocaleDateString("en-US", {
        weekday: "long",
      });

      activityMap[day] = (activityMap[day] || 0) + 1;
    });

    // Most active day

    let mostActiveDay = "None";
    let highestCount = 0;

    Object.entries(activityMap).forEach(([day, count]) => {
      if (count > highestCount) {
        highestCount = count;
        mostActiveDay = day;
      }
    });

    // Last chat
    const lastChat =
      chats.length > 0
        ? chats.reduce(
            (latest, chat) =>
              !latest || new Date(chat.updatedAt) > new Date(latest)
                ? chat.updatedAt
                : latest,
            null,
          )
        : null;

    // Streak

    const activeDates = new Set();

    chats.forEach((chat) => {
      activeDates.add(new Date(chat.updatedAt).toISOString().split("T")[0]);
    });

    let streak = 0;

    const current = new Date();
    current.setHours(0, 0, 0, 0);

    while (true) {
      const dateString = current.toISOString().split("T")[0];

      if (activeDates.has(dateString)) {
        streak++;
      } else {
        break;
      }

      current.setDate(current.getDate() - 1);
    }

    res.json({
      chats: chats.length,
      messages: totalMessages,
      mostActiveDay,
      lastChat,
      streak,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const saveChat = async (req, res) => {
  try {
    const { userId, chatId, title, messages } = req.body;
    console.log("SAVE REQUEST");
    console.log("chatId:", chatId);
    console.log("title:", title);

    let chat = null;

    if (chatId && mongoose.Types.ObjectId.isValid(chatId)) {
      chat = await Chat.findById(chatId);
    }

    if (chat) {
      chat.title = title;
      chat.messages = messages;

      await chat.save();
    } else {
      chat = await Chat.create({
        userId,
        title,
        messages,
      });
    }
    // console.log("CHAT SAVED:", chat);
    res.json(chat);
  } catch (error) {
    console.error("SAVE CHAT ERROR:");
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getChats,
  saveChat,
  deleteChat,
  getUserStats,
};
