const APP_KNOWLEDGE = [
  {
    patterns: [
      /who (made|created|built|developed) (this app|neuralchat)/i,
      /who is the developer/i,
      /who made you/i,
    ],
    response: `NeuralChat was created by Arp as a full-stack AI assistant project. It combines conversational AI, image generation, image understanding, PDF analysis, and persistent chat history into a single application.`,
  },

  {
    patterns: [
      /what is neuralchat/i,
      /tell me about (this app|neuralchat)/i,
      /what is this app/i,
    ],
    response: `NeuralChat is a multimodal AI assistant built by Arp. It allows users to chat with AI, generate images, analyze uploaded images, understand PDF documents, and maintain persistent conversations.`,
  },

  {
    patterns: [
      /what can you do/i,
      /what are your features/i,
      /what can neuralchat do/i,
    ],
    response: `I can help with a wide variety of tasks, including:

- Answering questions
- Explaining programming concepts and debugging code
- Generating AI images
- Analyzing uploaded images
- Understanding and summarizing PDF documents
- Writing, brainstorming, and editing content
- Continuing conversations with context`,
  },

  {
    patterns: [/which ai model/i, /what model are you/i, /what ai powers you/i],
    response: `NeuralChat uses Groq-hosted Llama models for conversational AI. Image generation is powered by Pollinations AI, while PDF understanding is performed by extracting the document text and analyzing it with the language model.`,
  },
];

const getAppInfoResponse = (message = "") => {
  for (const item of APP_KNOWLEDGE) {
    if (item.patterns.some((pattern) => pattern.test(message))) {
      return item.response;
    }
  }

  return null;
};

module.exports = {
  getAppInfoResponse,
};
