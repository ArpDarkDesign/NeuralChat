import { useEffect, useState } from "react";
import "../pages/Login.css";

function NeuralChatLoadingOverlay({
  label,
  heading = "NeuralChat",
  title,
  messages,
  footer,
}) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const statusTimer = setInterval(() => {
      setStatusIndex((currentIndex) =>
        currentIndex === messages.length - 1 ? 0 : currentIndex + 1,
      );
    }, 2500);

    return () => {
      clearInterval(statusTimer);
    };
  }, [messages.length]);

  return (
    <div
      className="login-loading-overlay"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="login-loading-panel">
        <div className="loading-logo" aria-hidden="true">
          ⚡
        </div>
        <h2>{heading}</h2>
        <p className="loading-title">{title}</p>
        <p key={statusIndex} className="loading-status" aria-live="polite">
          {messages[statusIndex]}
        </p>
        <div className="loading-progress" aria-hidden="true">
          <span></span>
        </div>
        {footer}
      </div>
    </div>
  );
}

export default NeuralChatLoadingOverlay;
