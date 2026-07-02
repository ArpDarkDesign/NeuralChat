const IMAGE_URLS_MARKER = "\x00NEURALCHAT_IMAGE_URLS:";

const API_URL = import.meta.env.VITE_API_URL;

const parseStreamContent = (fullResponse) => {
  const markerIndex = fullResponse.indexOf(IMAGE_URLS_MARKER);

  if (markerIndex === -1) {
    return { displayText: fullResponse, imageUrls: null };
  }

  const jsonStart = markerIndex + IMAGE_URLS_MARKER.length;
  const jsonEnd = fullResponse.indexOf("]", jsonStart);

  if (jsonEnd === -1) {
    return {
      displayText: fullResponse.slice(0, markerIndex),
      imageUrls: null,
    };
  }

  const imageUrlsJson = fullResponse.slice(jsonStart, jsonEnd + 1);
  const displayText =
    fullResponse.slice(0, markerIndex) + fullResponse.slice(jsonEnd + 1);

  try {
    const imageUrls = JSON.parse(imageUrlsJson);
    return { displayText, imageUrls };
  } catch {
    return { displayText, imageUrls: null };
  }
};

export const sendMessageToAI = async (
  message,
  history,
  onChunk,
  images = [],
  onImageUrls,
) => {
  const body =
    images.length > 0
      ? (() => {
          const formData = new FormData();
          formData.append("message", message);
          images.forEach((image) => formData.append("files", image));
          return formData;
        })()
      : JSON.stringify({ message, history });

  const response = await fetch(`${API_URL}/api/ai/chat`, {
    method: "POST",
    headers:
      images.length > 0 ? undefined : { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    throw new Error((await response.text()) || "AI request failed");
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const parsed = await response.json();

    if (parsed.type === "image") {
      return parsed;
    }

    if (parsed.type === "app-info") {
      onChunk(parsed.response);
      return parsed.response;
    }
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

  try {
    const parsed = JSON.parse(fullResponse);

    if (parsed.type === "image") {
      return parsed;
    }

    if (parsed.type === "app-info") {
      return parsed.response;
    }
  } catch {
    // not JSON
  }

  const { displayText, imageUrls } = parseStreamContent(fullResponse);

  onChunk(displayText);

  if (imageUrls?.length > 0 && onImageUrls && !imageUrlsDelivered) {
    onImageUrls(imageUrls);
  }

  return displayText;
};

export const generateChatTitle = async (userMessage, aiResponse) => {
  if (typeof aiResponse === "object" && aiResponse?.type === "image") {
    const words = userMessage.trim().split(/\s+/).slice(0, 5);

    return words.join(" ");
  }

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

  const response = await sendMessageToAI(prompt, [], () => {}, []);

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
