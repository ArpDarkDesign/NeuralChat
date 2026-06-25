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

  const imageUrlsHeader = response.headers.get("X-Image-Urls");
  const imageUrls = imageUrlsHeader ? JSON.parse(imageUrlsHeader) : [];

  if (imageUrls.length > 0 && onImageUrls) {
    onImageUrls(imageUrls);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value);

    fullResponse += chunk;

    onChunk(fullResponse);
  }

  return fullResponse;
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
