const { getAIResponseStream } = require("../services/aiService");
const { uploadImages } = require("../utils/cloudinary");

const { generateImage } = require("../services/imageService");

const IMAGE_URLS_MARKER = "\x00NEURALCHAT_IMAGE_URLS:";

const isImageRequest = (message = "") => {
  const text = message.toLowerCase();

  if (
    text.includes("chat title") ||
    text.includes("conversation below") ||
    text.includes("return only the title") ||
    text.includes("assistant:")
  ) {
    return false;
  }

  return (
    /(generate|create|draw|paint|render|design|illustrate|make)/.test(text) &&
    /(image|picture|photo|art|illustration|logo|icon|wallpaper|portrait|avatar)/.test(
      text,
    )
  );
};

const chatWithAI = async (req, res) => {
  try {
    let { message, history = [] } = req.body;

    const wantsImage = isImageRequest(message);

    if (typeof history === "string") {
      try {
        history = JSON.parse(history);
      } catch {
        history = [];
      }
    }

    history = Array.isArray(history) ? history : [];

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

    if (wantsImage) {
      const imageUrl = await generateImage(message);

      return res.json({
        type: "image",
        imageUrl,
      });
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const uploadPromise =
      images.length > 0
        ? uploadImages(images).then((imageUrls) => {
            if (imageUrls.length > 0 && !res.writableEnded) {
              res.write(`${IMAGE_URLS_MARKER}${JSON.stringify(imageUrls)}`);
            }

            return imageUrls;
          })
        : null;

    const stream = await getAIResponseStream(message, history, images);

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || "";

      if (content) {
        res.write(content);
      }
    }

    if (uploadPromise) {
      try {
        await uploadPromise;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
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
