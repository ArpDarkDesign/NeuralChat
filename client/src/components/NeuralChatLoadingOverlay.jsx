import { useEffect, useState } from "react";
import "../pages/Login.css";

const COLD_START_NOTICE_DELAY = 15000;
const PATIENCE_NOTICE_DELAY = 30000;

function NeuralChatLoadingOverlay({
  label,
  heading = "NeuralChat",
  title,
  messages,
  footer,
}) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [showColdStartNotice, setShowColdStartNotice] = useState(false);
  const [showPatienceNotice, setShowPatienceNotice] = useState(false);

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

  useEffect(() => {
    const coldStartTimer = setTimeout(() => {
      setShowColdStartNotice(true);
    }, COLD_START_NOTICE_DELAY);

    const patienceTimer = setTimeout(() => {
      setShowPatienceNotice(true);
    }, PATIENCE_NOTICE_DELAY);

    return () => {
      clearTimeout(coldStartTimer);
      clearTimeout(patienceTimer);
    };
  }, []);

  return (
    <div
      className="login-loading-overlay"
      role="status"
      aria-live="polite"
      aria-atomic="true"
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
        <div
          className={`loading-reassurance${
            showColdStartNotice ? " visible" : ""
          }`}
          aria-live="polite"
        >
          <div className="loading-reassurance-card">
            <div className="loading-reassurance-icon" aria-hidden="true">
              ⚡
            </div>
            <div>
              <h3>Why is this taking a little longer?</h3>
              <p>
                NeuralChat is currently hosted on Render&apos;s free tier. After
                periods of inactivity the server automatically goes to sleep.
                The first request may take up to a minute while it wakes up.
              </p>
              <p>Your conversations are completely safe.</p>
            </div>
          </div>
          <div
            className={`loading-reassurance-card patience${
              showPatienceNotice ? " visible" : ""
            }`}
          >
            <div className="loading-reassurance-icon" aria-hidden="true">
              💜
            </div>
            <div>
              <h3>Thanks for waiting.</h3>
              <p>
                The first request is always the slowest. Once connected,
                NeuralChat responds much faster.
              </p>
            </div>
          </div>
          <p className="loading-reassurance-footer">
            This only happens after periods of inactivity.
          </p>
        </div>
        {footer}
      </div>
    </div>
  );
}

export default NeuralChatLoadingOverlay;
