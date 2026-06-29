import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Download } from "lucide-react";
import { memo, useState } from "react";
import ImageGenerationCard from "./image/ImageLoadingCard";

const GeneratedImage = memo(function GeneratedImage({ src }) {
  const [status, setStatus] = useState("loading");

  const isLoaded = status === "loaded";
  const hasFailed = status === "failed";

  return (
    <div
      className={`generated-image-shell ${
        isLoaded ? "is-loaded" : "is-loading"
      } ${hasFailed ? "has-error" : ""}`}
    >
      {!hasFailed && (
        <div className="generated-image-loader" aria-hidden={isLoaded}>
          <ImageGenerationCard />
        </div>
      )}

      {hasFailed && (
        <div className="generated-image-error" role="status">
          Image could not be loaded.
        </div>
      )}

      <img
        src={src}
        alt="AI Generated"
        className="generated-image"
        loading="eager"
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("failed")}
      />
    </div>
  );
});

function ChatMessage({ sender, message, images = [], image, pdfs = [], time }) {
  const isTypingMessage = message === "NeuralChat is typing...";
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch (error) {
      console.log("Copy failed", error);
    }
  };

  const downloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error("Failed to download image.");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;

      link.download = `neuralchat-${Date.now()}.png`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
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

          {sender === "user" && pdfs.length > 0 && (
            <div className="pdf-preview-list">
              {pdfs.map((pdf, index) => (
                <div key={pdf.name + index} className="pdf-preview-card">
                  <div className="pdf-icon">📄</div>

                  <div className="pdf-info">
                    <div className="pdf-name">{pdf.name}</div>

                    <div className="pdf-size">
                      {(pdf.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sender === "bot" && image && (
            <div className="generated-image-container">
              <GeneratedImage key={image} src={image} />
              <button
                className="image-download-btn"
                onClick={() => downloadImage(image)}
                title="Download Image"
              >
                <Download size={18} />
              </button>
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
