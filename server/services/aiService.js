const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getAIResponseStream = async (message) => {
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
        content: message,
      },
    ],
    model: "llama-3.3-70b-versatile",
    stream: true,
  });

  return stream;
};

module.exports = {
  getAIResponseStream,
};