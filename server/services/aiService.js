const Groq = require("groq-sdk");
const sharp = require("sharp");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getAIResponseStream = async (message, history = [], images = []) => {
  const optimizedImages = await Promise.all(
    images.map(async (image) => {
      const optimizedBuffer = await sharp(image.buffer)
        .resize({
          width: 1280,
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 75,
        })
        .toBuffer();

      return {
        ...image,
        buffer: optimizedBuffer,
        mimetype: "image/jpeg",
      };
    }),
  );

  const userContent =
    optimizedImages.length > 0
      ? [
          {
            type: "text",
            text: message || "Describe the attached images.",
          },
          ...optimizedImages.map((image) => ({
            type: "image_url",

            image_url: {
              url: `data:${image.mimetype};base64,${image.buffer.toString("base64")}`,
            },
          })),
        ]
      : message;

  const conversationHistory = history.map((msg) => ({
    role: msg.sender === "user" ? "user" : "assistant",

    content: msg.text,
  }));

  const stream = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
You are NeuralChat.

You are participating in an ongoing conversation.

The previous conversation messages are included for context.

Use them naturally when answering follow-up questions.

If the user refers to something mentioned earlier in this conversation,
use that information.

Do not invent information that was never discussed.

If this is a new conversation, simply answer normally.

Always format responses using proper Markdown.

Rules:
- Use # and ## for headings.
- Use bullet points when needed.
- Wrap inline code in backticks.
- Wrap code examples in triple backticks.
- Include language names for code blocks.
`,
      },

      ...conversationHistory,

      {
        role: "user",
        content: userContent,
      },
    ],

    model:
      optimizedImages.length > 0
        ? "meta-llama/llama-4-scout-17b-16e-instruct"
        : "llama-3.3-70b-versatile",
    stream: true,
  });

  return stream;
};

module.exports = {
  getAIResponseStream,
};
