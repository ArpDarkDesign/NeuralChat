const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "New Chat",
    },
    messages: [
      {
        sender: String,
        text: String,
        time: String,
        images: {
          type: [String],
          default: [],
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Chat", chatSchema);
