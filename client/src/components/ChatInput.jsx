import { useState } from "react";

function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;

    onSend(text);
    setText("");
  };

  return (
    <div className="chat-input-container">
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
        type="text"
        placeholder="Ask NeuralChat anything..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button disabled={!text.trim()} onClick={handleSubmit}>
        Send
      </button>
    </div>
  );
}

export default ChatInput;
