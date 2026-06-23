import { useNavigate } from "react-router-dom";

function Sidebar({
  conversations,
  activeChatId,
  setActiveChatId,
  onNewChat,
  onDeleteChat,
  onRenameChat,
}) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="sidebar">
      <div className="sidebar-logo">⚡ NeuralChat</div>

      <button className="new-chat-btn" onClick={onNewChat}>
        + New Chat
      </button>

      <div className="chat-history">
        {conversations.map((chat) => {
          const chatId = chat._id || chat.id;

          return (
            <div
              key={chatId}
              className={`chat-item ${activeChatId === chatId ? "active" : ""}`}
              onClick={() => setActiveChatId(chatId)}
            >
              <span className="chat-title">{chat.title}</span>

              <div className="chat-actions">
                <button
                  className="rename-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();

                    const newTitle = prompt(
                      "Enter new chat title:",
                      chat.title,
                    );

                    if (newTitle) {
                      onRenameChat(chatId, newTitle);
                    }
                  }}
                >
                  ✏
                </button>

                <button
                  className="delete-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chatId);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="user-card" onClick={() => navigate("/profile")}>
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar" className="sidebar-avatar" />
        ) : (
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="user-name">{user?.name}</div>

        <div className="user-subtitle"> ✓ Verified Neural User</div>

        <div className="identity-link">View Profile →</div>
      </div>
    </div>
  );
}

export default Sidebar;
