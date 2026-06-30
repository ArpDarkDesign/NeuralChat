import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./FloatingChatButton.css";

const FloatingChatButton = () => {
  const navigate = useNavigate();

  return (
    <button
      className="floating-chat-button"
      onClick={() => navigate("/chat")}
      aria-label="Back to chat"
    >
      <MessageCircle size={20} />
      <span className="chat-text">Back to Chat</span>
    </button>
  );
};

export default FloatingChatButton;
