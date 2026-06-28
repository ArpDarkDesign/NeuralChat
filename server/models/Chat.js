const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clientTempId: {
      type: String,
      default: null,
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
        image: {
          type: String,
          default: null,
        },
        images: {
          type: [String],
          default: [],
        },
        pdfs: [
          {
            name: String,
            size: Number,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  },
);

chatSchema.index(
  { userId: 1, clientTempId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      clientTempId: {
        $type: "string",
      },
    },
  },
);

module.exports = mongoose.model("Chat", chatSchema);
