import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";

function ChatMessage({ sender, message, images = [], time }) {
  const isTypingMessage = message === "NeuralChat is typing...";
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch (error) {
      console.log("Copy failed", error);
    }
  };
  return (
    <div
      className={`message-wrapper ${
        sender === "user" ? "user-wrapper" : "bot-wrapper"
      }`}
    >
      <div
        className={`message-bubble ${
          sender === "user" ? "user-bubble" : "bot-bubble"
        } ${isTypingMessage ? "typing-bubble" : ""}`}
      >
        {sender === "bot" && !isTypingMessage && (
          <button
            className="copy-btn"
            onClick={copyMessage}
            title="Copy Message"
          >
            <Copy size={16} />
          </button>
        )}
        <div className="markdown-content">
          {sender === "user" && images.length > 0 && (
            <div className="message-images">
              {images.map((image, index) => {
                const imageUrl =
                  typeof image === "string" ? image : image.preview;

                return (
                  <img
                    key={imageUrl || index}
                    src={imageUrl}
                    alt={`Uploaded ${index + 1}`}
                    className="message-image"
                    loading="lazy"
                  />
                );
              })}
            </div>
          )}

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                if (match) {
                  return (
                    <div className="code-block-wrapper">
                      <button
                        className="code-copy-btn"
                        onClick={() =>
                          navigator.clipboard.writeText(codeString)
                        }
                      >
                        Copy
                      </button>

                      <pre className="custom-code-block">
                        <code>{codeString}</code>
                      </pre>
                    </div>
                  );
                }

                return <code className={className}>{children}</code>;
              },
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
}

export default ChatMessage;
