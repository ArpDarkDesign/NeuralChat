const Groq = require("groq-sdk");
const sharp = require("sharp");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getAIResponseStream = async (message, images = []) => {
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
      ? // images.length > 0
        [
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

  const stream = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
You are NeuralChat.

Always format responses using proper Markdown.

Rules:
- Use # and ## for headings.
- Use bullet points when needed.
- Wrap inline code in backticks.
- Wrap code examples in triple backticks.
- Include language names for code blocks.
`,
      },
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
