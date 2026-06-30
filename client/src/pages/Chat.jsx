import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import "./Chat.css";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import TypingIndicator from "../components/TypingIndicator";
import { generateChatTitle, sendMessageToAI } from "../services/aiService";
import { getChats, saveChat, deleteChat } from "../services/chatService";
import { getStoredChatThemeId } from "../theme/chatThemes";

const TEMP_ID_PREFIX = "temp-";
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const currentTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const createWelcomeMessages = (user) => [
  {
    sender: "system",
    text: `Good Evening, ${user?.name || "User"} 👋`,
  },
  {
    sender: "system",
    text: "What would you like to build today?",
  },
];

const createLocalId = () =>
  `${TEMP_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isPersistedId = (id) =>
  typeof id === "string" && OBJECT_ID_PATTERN.test(id);

const isTemporaryId = (id) =>
  typeof id === "string" && id.startsWith(TEMP_ID_PREFIX);

const getChatKey = (chat) =>
  chat?.localId || chat?.clientTempId || chat?._id || chat?.id;

const isMatchingChat = (chat, chatId) =>
  getChatKey(chat) === chatId ||
  chat?._id === chatId ||
  chat?.id === chatId ||
  chat?.clientTempId === chatId;

const normalizeChat = (chat) => ({
  ...chat,
  localId: getChatKey(chat) || createLocalId(),
  messages: Array.isArray(chat.messages) ? chat.messages : [],
});

const hasUserMessages = (chat) =>
  chat.messages.some((msg) => msg.sender === "user");

const hasLocalImageUrls = (chat) =>
  chat.messages.some((msg) =>
    (msg.images || []).some(
      (image) => typeof image === "string" && image.startsWith("blob:"),
    ),
  );

const signatureForSnapshot = ({ title, messages }) =>
  JSON.stringify({ title, messages });

function Chat() {
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);

  const [chatTheme, setChatTheme] = useState(getStoredChatThemeId);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const [currentUser] = useState(JSON.parse(localStorage.getItem("user")));
  const welcomeMessages = createWelcomeMessages(currentUser);

  const createBlankChat = () =>
    normalizeChat({
      _id: createLocalId(),
      title: "New Chat",
      messages: welcomeMessages,
    });

  const [conversations, setConversations] = useState(() => {
    const initialChat = createBlankChat();
    return [initialChat];
  });
  const [activeChatId, setActiveChatId] = useState(() =>
    getChatKey(conversations[0]),
  );
  const [isTyping, setIsTyping] = useState(false);

  const newChatIdsRef = useRef(new Set([activeChatId]));
  const firstUserMessagesRef = useRef(new Map());
  const titleAttemptedChatIdsRef = useRef(new Set());
  const manuallyRenamedChatIdsRef = useRef(new Set());
  const saveRegistryRef = useRef(new Map());

  const activeConversation = conversations.find((chat) =>
    isMatchingChat(chat, activeChatId),
  );

  const ensureSaveState = (chatKey) => {
    if (!saveRegistryRef.current.has(chatKey)) {
      saveRegistryRef.current.set(chatKey, {
        serverId: null,
        timer: null,
        inFlight: false,
        queuedSnapshot: null,
        lastScheduledSignature: null,
        lastSavedSignature: null,
      });
    }

    return saveRegistryRef.current.get(chatKey);
  };

  const buildSaveSnapshot = (chat) => {
    const chatKey = getChatKey(chat);
    const saveState = ensureSaveState(chatKey);
    const persistedId = isPersistedId(chat._id) ? chat._id : saveState.serverId;
    const clientTempId =
      chat.clientTempId || (isTemporaryId(chat._id) ? chat._id : chatKey);

    return {
      localId: chatKey,
      chatId: persistedId || null,
      clientTempId,
      userId: currentUser.id,
      title: chat.title,
      messages: chat.messages,
    };
  };

  const persistSnapshot = async (chatKey, snapshot) => {
    const saveState = ensureSaveState(chatKey);

    if (saveState.inFlight) {
      saveState.queuedSnapshot = snapshot;
      return;
    }

    saveState.inFlight = true;
    let snapshotToSave = snapshot;

    try {
      while (snapshotToSave) {
        saveState.queuedSnapshot = null;

        const savedChat = await saveChat({
          ...snapshotToSave,
          chatId: saveState.serverId || snapshotToSave.chatId || undefined,
        });
        const currentSnapshot = snapshotToSave;

        saveState.serverId = savedChat._id;
        saveState.lastSavedSignature = signatureForSnapshot(currentSnapshot);
        setConversations((prev) =>
          prev.map((chat) =>
            getChatKey(chat) === chatKey
              ? {
                  ...chat,
                  _id: savedChat._id,
                  clientTempId: currentSnapshot.clientTempId,
                  updatedAt: savedChat.updatedAt,
                }
              : chat,
          ),
        );

        snapshotToSave = saveState.queuedSnapshot
          ? {
              ...saveState.queuedSnapshot,
              chatId: savedChat._id,
            }
          : null;
      }
    } catch (error) {
      saveState.lastScheduledSignature = null;
      console.error("Chat autosave failed:", error);
    } finally {
      saveState.inFlight = false;
    }
  };

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

            const chatKey = getChatKey(chat);
            const wasManuallyRenamed =
              manuallyRenamedChatIdsRef.current.has(chatId) ||
              manuallyRenamedChatIdsRef.current.has(chatKey) ||
              manuallyRenamedChatIdsRef.current.has(chat._id) ||
              manuallyRenamedChatIdsRef.current.has(chat.clientTempId);

            if (wasManuallyRenamed) return chat;

            return {
              ...chat,
              title: generatedTitle,
            };
          }),
        );
      }
    } catch (error) {
      console.error("Title generation failed:", error);
    }
  };

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

    const imageBlobUrls = images
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));

    const pdfFiles = images.filter((file) => file.type === "application/pdf");

    const botMessageId = `${currentChatId}-${createLocalId()}-bot`;

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
              images: imageBlobUrls,
              pdfs: pdfFiles.map((file) => ({
                name: file.name,
                size: file.size,
              })),
              time: currentTime(),
            },
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

    try {
      const history =
        activeConversation?.messages
          ?.filter(
            (msg) =>
              (msg.sender === "user" || msg.sender === "bot") &&
              msg.text?.trim(),
          )
          .map((msg) => ({
            sender: msg.sender,
            text: msg.text,
            images: msg.images || [],
          })) || [];

      const finalResponse = await sendMessageToAI(
        message,
        history,
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
        },
        images,
        (cloudinaryUrls) => {
          imageBlobUrls.forEach((url) => URL.revokeObjectURL(url));

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

      if (typeof finalResponse === "object" && finalResponse.type === "image") {
        setConversations((prev) =>
          prev.map((chat) => {
            if (!isMatchingChat(chat, currentChatId)) return chat;

            return {
              ...chat,
              messages: chat.messages.map((msg) =>
                msg.id === botMessageId
                  ? {
                      ...msg,
                      text: "",
                      image: finalResponse.imageUrl,
                    }
                  : msg,
              ),
            };
          }),
        );

        return true;
      }

      generateTitleForChat(currentChatId, "AI Generated Image");

      return true;
    } catch (error) {
      console.error(error);
      imageBlobUrls.forEach((url) => URL.revokeObjectURL(url));

      setConversations((prev) =>
        prev.map((chat) => {
          if (!isMatchingChat(chat, currentChatId)) return chat;

          return {
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === botMessageId
                ? {
                    ...msg,
                    text: "Sorry, something went wrong.",
                  }
                : msg,
            ),
          };
        }),
      );

      return false;
    } finally {
      setIsTyping(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleNewChat = () => {
    const reusableEmptyChat = conversations.find(
      (chat) => !hasUserMessages(chat) && chat.title === "New Chat",
    );

    if (reusableEmptyChat) {
      setActiveChatId(getChatKey(reusableEmptyChat));
      return;
    }

    const newChat = createBlankChat();
    const newChatId = getChatKey(newChat);

    newChatIdsRef.current.add(newChatId);
    setConversations((prev) => [newChat, ...prev]);
    setActiveChatId(newChatId);
  };

  const handleDeleteChat = async (chatId) => {
    if (conversations.length === 1) return;

    const chatToDelete = conversations.find((chat) =>
      isMatchingChat(chat, chatId),
    );
    const chatKey = getChatKey(chatToDelete);
    const saveState = saveRegistryRef.current.get(chatKey);
    const persistedId = isPersistedId(chatToDelete?._id)
      ? chatToDelete._id
      : saveState?.serverId;

    if (saveState?.timer) {
      clearTimeout(saveState.timer);
    }

    saveRegistryRef.current.delete(chatKey);

    if (persistedId) {
      try {
        await deleteChat(persistedId);
      } catch (error) {
        console.error(error);
      }
    }

    setConversations((prev) => {
      const updatedChats = prev.filter((chat) => !isMatchingChat(chat, chatId));

      if (isMatchingChat(chatToDelete, activeChatId)) {
        const nextChat = updatedChats[0];

        if (nextChat) {
          setActiveChatId(getChatKey(nextChat));
        }
      }

      return updatedChats;
    });
  };

  const handleRenameChat = (chatId, newTitle) => {
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) return;

    setConversations((prev) =>
      prev.map((chat) => {
        if (!isMatchingChat(chat, chatId)) return chat;

        const chatKey = getChatKey(chat);

        manuallyRenamedChatIdsRef.current.add(chatId);
        manuallyRenamedChatIdsRef.current.add(chatKey);

        if (chat.clientTempId) {
          manuallyRenamedChatIdsRef.current.add(chat.clientTempId);
        }

        return {
          ...chat,
          title: trimmedTitle,
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
    const container = messagesAreaRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom < 150) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [activeConversation?.messages]);

  useEffect(() => {
    const container = messagesAreaRef.current;

    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      console.log({
        scrollTop: container.scrollTop,
        distanceFromBottom,
      });

      setShowScrollButton(distanceFromBottom > 180);
    };

    container.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const loadChats = async () => {
      if (!currentUser) return;

      try {
        const chats = await getChats(currentUser.id);

        if (chats.length > 0) {
          const normalizedChats = chats.map(normalizeChat);
          setConversations(normalizedChats);
          setActiveChatId(getChatKey(normalizedChats[0]));
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadChats();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    conversations.forEach((chat) => {
      if (!hasUserMessages(chat)) return;
      if (hasLocalImageUrls(chat)) return;

      const chatKey = getChatKey(chat);
      const saveState = ensureSaveState(chatKey);
      const snapshot = buildSaveSnapshot(chat);
      const signature = signatureForSnapshot(snapshot);

      if (
        signature === saveState.lastSavedSignature ||
        signature === saveState.lastScheduledSignature
      ) {
        return;
      }

      saveState.lastScheduledSignature = signature;

      if (saveState.timer) {
        clearTimeout(saveState.timer);
      }

      saveState.timer = setTimeout(() => {
        persistSnapshot(chatKey, snapshot);
      }, 500);
    });
    // saveRegistryRef owns save sequencing, so these helpers must read the
    // current render snapshot without rearming timers for function identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, currentUser]);

  useEffect(
    () => () => {
      saveRegistryRef.current.forEach((saveState) => {
        if (saveState.timer) {
          clearTimeout(saveState.timer);
        }
      });
    },
    [],
  );
  console.log("showScrollButton:", showScrollButton);
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

        <div className="messages-area" ref={messagesAreaRef}>
          {activeConversation?.messages.map((msg, index) => (
            <ChatMessage
              key={msg.id || index}
              sender={msg.sender}
              message={msg.text}
              images={msg.images}
              image={msg.image}
              pdfs={msg.pdfs}
              time={msg.time}
            />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef}></div>
        </div>

        <ChatInput onSend={handleSend} />

<div className="chat-disclaimer">
  <span>
    NeuralChat can make mistakes. Verify important information..
  </span>
</div>


      </div>

      {showScrollButton && (
        <button
          className="scroll-bottom-btn"
          onClick={scrollToBottom}
          aria-label="Scroll to latest message"
        >
          <ChevronDown size={20} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}

export default Chat;
