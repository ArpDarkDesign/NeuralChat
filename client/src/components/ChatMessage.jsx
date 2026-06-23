import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";
// import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
// import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function ChatMessage({ sender, message, time }) {
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // code({ inline, className, children, ...props }) {
              //   const match = /language-(\w+)/.exec(className || "");
              //   const codeString = String(children).replace(/\n$/, "");

              //   if (!inline && match) {
              //     return (
              //       <div className="code-block-wrapper">
              //         <button
              //           className="code-copy-btn"
              //           onClick={() =>
              //             navigator.clipboard.writeText(codeString)
              //           }
              //         >
              //           Copy
              //         </button>

              //         <SyntaxHighlighter
              //           style={oneDark}
              //           language={match[1]}
              //           {...props}
              //         >
              //           {codeString}
              //         </SyntaxHighlighter>
              //       </div>
              //     );
              //   }

              //   return (
              //     <code className={className} {...props}>
              //       {children}
              //     </code>
              //   );
              // },

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
