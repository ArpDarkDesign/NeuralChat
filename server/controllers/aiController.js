const { getAIResponseStream } = require("../services/aiService");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const images = req.files || [];
    const allowedImageTypes = new Set([
      "image/png",
      "image/jpeg",
      "image/webp",
    ]);

    if (images.some((image) => !allowedImageTypes.has(image.mimetype))) {
      return res.status(400).json({
        message: "Only PNG, JPG, JPEG, and WebP images are supported.",
      });
    }

    const stream = await getAIResponseStream(message, images);

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || "";

      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error(error);

    if (!res.headersSent) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
};

module.exports = {
  chatWithAI,
};
