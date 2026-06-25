const IMAGE_URLS_MARKER = "\x00NEURALCHAT_IMAGE_URLS:";
const IMAGE_URLS_PATTERN = /\x00NEURALCHAT_IMAGE_URLS:\[[^\]]*\]/;

const parseStreamContent = (fullResponse) => {
  const match = fullResponse.match(/\x00NEURALCHAT_IMAGE_URLS:(\[[^\]]*\])/);

  if (!match) {
    return { displayText: fullResponse, imageUrls: null };
  }

  const displayText = fullResponse.replace(IMAGE_URLS_PATTERN, "");

  try {
    const imageUrls = JSON.parse(match[1]);
    return { displayText, imageUrls };
  } catch {
    return { displayText, imageUrls: null };
  }
};

export const sendMessageToAI = async (
  message,
  onChunk,
  images = [],
  onImageUrls,
) => {
  const body =
    images.length > 0
      ? (() => {
          const formData = new FormData();
          formData.append("message", message);
          images.forEach((image) => formData.append("images", image));
          return formData;
        })()
      : JSON.stringify({ message });

  const response = await fetch("http://localhost:5000/api/ai/chat", {
    method: "POST",
    headers:
      images.length > 0 ? undefined : { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    throw new Error((await response.text()) || "AI request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullResponse = "";
  let imageUrlsDelivered = false;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    fullResponse += decoder.decode(value, { stream: true });

    const { displayText, imageUrls } = parseStreamContent(fullResponse);

    onChunk(displayText);

    if (imageUrls?.length > 0 && onImageUrls && !imageUrlsDelivered) {
      onImageUrls(imageUrls);
      imageUrlsDelivered = true;
    }
  }

  fullResponse += decoder.decode();
  const { displayText, imageUrls } = parseStreamContent(fullResponse);

  onChunk(displayText);

  if (imageUrls?.length > 0 && onImageUrls && !imageUrlsDelivered) {
    onImageUrls(imageUrls);
  }

  return displayText;
};

export const generateChatTitle = async (userMessage, aiResponse) => {
  const prompt = `
Create a concise, professional chat title using the conversation below.

Rules:
- Return only the title.
- Use 2 to 5 words.
- Do not use quotes.
- Do not use punctuation at the start or end.

User: ${userMessage}
Assistant: ${aiResponse}
`;

  const response = await sendMessageToAI(prompt, () => {});
  const cleanedTitle = response
    .trim()
    .split("\n")[0]
    .replace(/^[\s"'`*_#\-–—:;,.!?()[\]{}]+/, "")
    .replace(/[\s"'`*_#\-–—:;,.!?()[\]{}]+$/, "")
    .trim();

  if (!cleanedTitle) return null;

  const words = cleanedTitle.split(/\s+/).slice(0, 5);

  if (words.length === 1) {
    words.push("Overview");
  }

  return words.join(" ");
};
