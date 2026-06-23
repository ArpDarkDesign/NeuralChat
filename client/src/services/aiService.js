export const sendMessageToAI = async (message, onChunk) => {
  const response = await fetch("http://localhost:5000/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  });

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
