import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import "./Chat.css";
import { useState, useEffect, useRef } from "react";
import TypingIndicator from "../components/TypingIndicator";
import { generateChatTitle, sendMessageToAI } from "../services/aiService";
import { getChats, saveChat, deleteChat } from "../services/chatService";
import { getStoredChatThemeId } from "../theme/chatThemes";

const currentTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const isMatchingChat = (chat, chatId) =>
  chat._id === chatId || chat.id === chatId || chat.clientTempId === chatId;

function Chat() {
  const messagesEndRef = useRef(null);
  const [chatTheme, setChatTheme] = useState(getStoredChatThemeId);

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
  const newChatIdsRef = useRef(new Set([initialChat.id]));
  const firstUserMessagesRef = useRef(new Map());
  const titleAttemptedChatIdsRef = useRef(new Set());
  const manuallyRenamedChatIdsRef = useRef(new Set());

  const [isTyping, setIsTyping] = useState(false);

  const generateTitleForChat = async (chatId, aiResponse) => {
    if (!aiResponse.trim()) return;
    if (!newChatIdsRef.current.has(chatId)) return;
    if (titleAttemptedChatIdsRef.current.has(chatId)) return;

    titleAttemptedChatIdsRef.current.add(chatId);

    try {
      const generatedTitle = await generateChatTitle(
        firstUserMessagesRef.current.get(chatId),
        aiResponse,
      );

      if (generatedTitle) {
        setConversations((prev) =>
          prev.map((chat) => {
            if (!isMatchingChat(chat, chatId)) return chat;

            const wasManuallyRenamed =
              manuallyRenamedChatIdsRef.current.has(chatId) ||
              manuallyRenamedChatIdsRef.current.has(chat._id) ||
              manuallyRenamedChatIdsRef.current.has(chat.clientTempId);

            if (wasManuallyRenamed) return chat;

            return {
              ...chat,
              title: generatedTitle,
              messages: [...chat.messages],
            };
          }),
        );
      }
    } catch (error) {
      console.error("Title generation failed:", error);
    }
  };

  const activeConversation = conversations.find(
    (chat) => chat.id === activeChatId || chat._id === activeChatId,
  );

  const handleSend = async (text, images = []) => {
    const message = text.trim();
    const displayedMessage =
      message ||
      `Attached ${images.length} image${images.length === 1 ? "" : "s"}`;
    const currentChatId = activeChatId;

    if (!message && images.length === 0) return false;

    if (
      newChatIdsRef.current.has(currentChatId) &&
      !firstUserMessagesRef.current.has(currentChatId)
    ) {
      firstUserMessagesRef.current.set(currentChatId, displayedMessage);
    }

    const blobUrls = images.map((file) => URL.createObjectURL(file));

    setConversations((prev) =>
      prev.map((chat) => {
        if (!isMatchingChat(chat, currentChatId)) return chat;

        const updatedTitle =
          chat.title === "New Chat"
            ? displayedMessage.length > 25
              ? displayedMessage.slice(0, 25) + "..."
              : displayedMessage
            : chat.title;

        return {
          ...chat,
          title: updatedTitle,

          messages: [
            ...chat.messages,
            {
              sender: "user",
              text: displayedMessage,
              images: blobUrls,
              time: currentTime(),
            },
          ],
        };
      }),
    );

    const botMessageId = Date.now();

    setConversations((prev) =>
      prev.map((chat) => {
        if (!isMatchingChat(chat, currentChatId)) return chat;

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

    setIsTyping(true);

    let typingHideTimer = null;

    (async () => {
      const finishStreamingUi = (aiResponse) => {
        generateTitleForChat(currentChatId, aiResponse);
      };

      try {
        await sendMessageToAI(
          message,
          (streamedText) => {
            setConversations((prev) =>
              prev.map((chat) => {
                if (!isMatchingChat(chat, currentChatId)) return chat;

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

            if (streamedText.length > 0) {
              setIsTyping(false);
            }

            if (typingHideTimer) clearTimeout(typingHideTimer);
            typingHideTimer = setTimeout(() => {
              finishStreamingUi(streamedText);
            }, 400);
          },
          images,
          (cloudinaryUrls) => {
            blobUrls.forEach((url) => URL.revokeObjectURL(url));

            setConversations((prev) =>
              prev.map((chat) => {
                if (!isMatchingChat(chat, currentChatId)) return chat;

                const messages = [...chat.messages];

                for (let i = messages.length - 1; i >= 0; i--) {
                  if (messages[i].sender === "user") {
                    messages[i] = {
                      ...messages[i],
                      images: cloudinaryUrls,
                    };
                    break;
                  }
                }

                return {
                  ...chat,
                  messages,
                };
              }),
            );
          },
        );
      } catch (error) {
        console.error(error);

        setConversations((prev) =>
          prev.map((chat) => {
            if (!isMatchingChat(chat, currentChatId)) return chat;

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
      } finally {
        if (typingHideTimer) clearTimeout(typingHideTimer);
        setIsTyping(false);
      }
    })();

    return true;
  };

  const handleNewChat = () => {
    const newChat = {
      _id: `temp-${Date.now()}`,
      title: "New Chat",
      messages: welcomeMessages,
    };
    newChatIdsRef.current.add(newChat._id);
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
      prev.map((chat) => {
        if ((chat._id || chat.id) !== chatId) return chat;

        manuallyRenamedChatIdsRef.current.add(chatId);

        if (chat.clientTempId) {
          manuallyRenamedChatIdsRef.current.add(chat.clientTempId);
        }

        return {
          ...chat,
          title: newTitle,
        };
      }),
    );
  };

  useEffect(() => {
    document.body.dataset.chatTheme = chatTheme;

    return () => {
      delete document.body.dataset.chatTheme;
    };
  }, [chatTheme]);

  useEffect(() => {
    const syncTheme = () => setChatTheme(getStoredChatThemeId());

    window.addEventListener("storage", syncTheme);
    window.addEventListener("focus", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("focus", syncTheme);
    };
  }, []);

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
                chat._id === activeConversation._id
                  ? {
                      ...chat,
                      _id: savedChat._id,
                      clientTempId: activeConversation._id,
                    }
                  : chat,
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
    <div className={`chat-page chat-theme-${chatTheme}`}>
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
              images={msg.images}
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
