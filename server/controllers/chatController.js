const Chat = require("../models/Chat");
const mongoose = require("mongoose");

const getChats = async (req, res) => {
  try {
    const { userId } = req.params;
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

    let mostActiveDay = "None";
    let highestCount = 0;

    Object.entries(activityMap).forEach(([day, count]) => {
      if (count > highestCount) {
        highestCount = count;
        mostActiveDay = day;
      }
    });

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

const sanitizeMessages = (messages = []) =>
  messages.map((msg) => ({
    sender: msg.sender,
    text: msg.text,
    time: msg.time,

    image:
      typeof msg.image === "string" && /^https?:\/\//.test(msg.image)
        ? msg.image
        : null,

    images: (msg.images || []).filter(
      (url) => typeof url === "string" && /^https?:\/\//.test(url),
    ),

    pdfs: (msg.pdfs || []).map((pdf) => ({
      name: pdf.name,
      size: pdf.size,
    })),
  }));

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const saveChat = async (req, res) => {
  try {
    const { userId, chatId, clientTempId, title, messages } = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({
        message: "A valid userId is required.",
      });
    }

    const sanitizedMessages = sanitizeMessages(messages);
    const safeTitle =
      typeof title === "string" && title.trim() ? title.trim() : "New Chat";
    const safeClientTempId =
      typeof clientTempId === "string" && clientTempId.trim()
        ? clientTempId.trim()
        : null;

    let chat = null;

    if (chatId && isValidObjectId(chatId)) {
      chat = await Chat.findOne({
        _id: chatId,
        userId,
      });
    }

    if (!chat && safeClientTempId) {
      chat = await Chat.findOne({
        userId,
        clientTempId: safeClientTempId,
      });
    }

    if (chat) {
      chat.title = safeTitle;
      chat.messages = sanitizedMessages;

      if (safeClientTempId && !chat.clientTempId) {
        chat.clientTempId = safeClientTempId;
      }

      await chat.save();
    } else {
      chat = await Chat.create({
        userId,
        clientTempId: safeClientTempId,
        title: safeTitle,
        messages: sanitizedMessages,
      });
    }

    res.json(chat);
  } catch (error) {
    console.error("SAVE CHAT ERROR:");
    console.error(error);

    if (error.code === 11000 && req.body.clientTempId) {
      const chat = await Chat.findOne({
        userId: req.body.userId,
        clientTempId: req.body.clientTempId,
      });

      if (chat) {
        chat.title =
          typeof req.body.title === "string" && req.body.title.trim()
            ? req.body.title.trim()
            : "New Chat";
        chat.messages = sanitizeMessages(req.body.messages);

        await chat.save();

        return res.json(chat);
      }
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteChat = async (req, res) => {
  try {
    if (isValidObjectId(req.params.id)) {
      await Chat.findByIdAndDelete(req.params.id);
    }

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
