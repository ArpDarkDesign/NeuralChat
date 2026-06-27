const generateImage = async (prompt) => {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required.");
  }

  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

  return imageUrl;
};

module.exports = {
  generateImage,
};