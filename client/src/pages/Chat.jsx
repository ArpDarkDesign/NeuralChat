import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import "./Chat.css";
import { useState, useEffect, useRef } from "react";
import TypingIndicator from "../components/TypingIndicator";
import { sendMessageToAI } from "../services/aiService";
import { getChats, saveChat, deleteChat } from "../services/chatService";

const currentTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

function Chat() {
  const messagesEndRef = useRef(null);

  const [currentUser] = useState(JSON.parse(localStorage.getItem("user")));

  const welcomeMessages = [
    {
      sender: "system",
      text: `Good Evening, ${currentUser?.name || "User"} 👋`,
    },
    {
      sender: "system",
      text: "What would you like to build today?",
    },
  ];

  const initialChat = {
    id: 1,
    title: "New Chat",
    messages: welcomeMessages,
  };

  const [conversations, setConversations] = useState([initialChat]);
  const [activeChatId, setActiveChatId] = useState(initialChat.id);

  const [isTyping, setIsTyping] = useState(false);

  const activeConversation = conversations.find(
    (chat) => chat.id === activeChatId || chat._id === activeChatId,
  );

  const handleSend = async (text) => {
    const message = text.trim();
    const currentChatId = activeChatId;

    if (!message) return;

    setConversations((prev) =>
      prev.map((chat) => {
        if ((chat._id || chat.id) !== currentChatId) return chat;

        const updatedTitle =
          chat.title === "New Chat"
            ? message.length > 25
              ? message.slice(0, 25) + "..."
              : message
            : chat.title;

        return {
          ...chat,
          title: updatedTitle,
          messages: [
            ...chat.messages,
            {
              sender: "user",
              text: message,
              time: currentTime(),
            },
          ],
        };
      }),
    );

    const botMessageId = Date.now();

    setConversations((prev) =>
      prev.map((chat) => {
        if ((chat._id || chat.id) !== currentChatId) return chat;

        return {
          ...chat,
          messages: [
            ...chat.messages,
            {
              id: botMessageId,
              sender: "bot",
              text: "",
              time: currentTime(),
            },
          ],
        };
      }),
    );

    try {
      await sendMessageToAI(message, (streamedText) => {
        setConversations((prev) =>
          prev.map((chat) => {
            if ((chat._id || chat.id) !== currentChatId) return chat;

            return {
              ...chat,
              messages: chat.messages.map((msg) =>
                msg.id === botMessageId
                  ? {
                      ...msg,
                      text: streamedText,
                    }
                  : msg,
              ),
            };
          }),
        );
      });
    } catch (error) {
      console.error(error);

      setConversations((prev) =>
        prev.map((chat) => {
          if ((chat._id || chat.id) !== currentChatId) return chat;

          return {
            ...chat,
            messages: [
              ...chat.messages,
              {
                sender: "bot",
                text: "Sorry, something went wrong.",
                time: currentTime(),
              },
            ],
          };
        }),
      );
    }

    setIsTyping(false);
  };

  const handleNewChat = () => {
    const newChat = {
      _id: `temp-${Date.now()}`,
      title: "New Chat",
      messages: welcomeMessages,
    };
    setConversations((prev) => [newChat, ...prev]);

    setActiveChatId(newChat._id);
  };

  const handleDeleteChat = async (chatId) => {
    if (conversations.length === 1) return;

    try {
      await deleteChat(chatId);
    } catch (error) {
      console.error(error);
    }

    const updatedChats = conversations.filter(
      (chat) => (chat._id || chat.id) !== chatId,
    );

    if (activeChatId === chatId) {
      const nextChat = updatedChats[0];

      if (nextChat) {
        setActiveChatId(nextChat._id || nextChat.id);
      }
    }

    setConversations(updatedChats);
  };
  const handleRenameChat = (chatId, newTitle) => {
    if (!newTitle.trim()) return;

    setConversations((prev) =>
      prev.map((chat) =>
        (chat._id || chat.id) === chatId
          ? {
              ...chat,
              title: newTitle,
            }
          : chat,
      ),
    );
  };

  useEffect(() => {
    const container = document.querySelector(".messages-area");

    if (!container) return;

    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      150;

    if (nearBottom) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [activeConversation?.messages]);

  useEffect(() => {
    const loadChats = async () => {
      if (!currentUser) return;

      try {
        const chats = await getChats(currentUser.id);
        // console.log("LOADED CHATS:", chats);

        if (chats.length > 0) {
          setConversations(chats);
          setActiveChatId(chats[0]._id);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    if (!activeConversation) return;
    if (!currentUser) return;
    if (!activeConversation.messages.some((msg) => msg.sender === "user")) {
      return;
    }

    const timer = setTimeout(() => {
      saveChat({
        chatId: activeConversation._id?.startsWith?.("temp-")
          ? null
          : activeConversation._id,
        userId: currentUser.id,
        title: activeConversation.title,
        messages: activeConversation.messages,
      })
        .then((savedChat) => {
          if (
            activeConversation._id &&
            activeConversation._id.startsWith("temp-")
          ) {
            setConversations((prev) =>
              prev.map((chat) =>
                chat._id === activeConversation._id ? savedChat : chat,
              ),
            );

            setActiveChatId(savedChat._id);
          }
        })

        .catch(console.error);
    }, 500);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.messages]);

  return (
    <div className="chat-page">
      <Sidebar
        conversations={conversations}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />

      <div className="chat-main">
        <Navbar />

        <div className="messages-area">
          {activeConversation?.messages.map((msg, index) => (
            <ChatMessage
              key={msg.id || index}
              sender={msg.sender}
              message={msg.text}
              time={msg.time}
            />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef}></div>
        </div>

        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}

export default Chat;
