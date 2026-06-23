export const CHAT_THEME_STORAGE_KEY = "neuralchat.chatTheme";

export const CHAT_THEMES = [
  {
    id: "neural-dark",
    name: "Neural Dark",
    icon: "🌌",
    description: "Premium AI aesthetic",
    swatches: ["#8b5cf6", "#3b82f6", "#060b1a"],
  },
  {
    id: "matrix-core",
    name: "Matrix Core",
    icon: "🟢",
    description: "Green neon command flow",
    swatches: ["#00ff88", "#00b368", "#020603"],
  },
  {
    id: "quantum-violet",
    name: "Quantum Violet",
    icon: "🟣",
    description: "Elegant research lab depth",
    swatches: ["#c084fc", "#7c3aed", "#11051f"],
  },
  {
    id: "crimson-protocol",
    name: "Crimson Protocol",
    icon: "🔴",
    description: "Security command center",
    swatches: ["#fb7185", "#dc2626", "#160408"],
  },
  {
    id: "arctic-intelligence",
    name: "Arctic Intelligence",
    icon: "🔵",
    description: "Clean futuristic assistant",
    swatches: ["#67e8f9", "#2563eb", "#03111f"],
  },
  {
    id: "solar-nexus",
    name: "Solar Nexus",
    icon: "🟠",
    description: "Gold energy interface",
    swatches: ["#fbbf24", "#f97316", "#170d03"],
  },
];

export const DEFAULT_CHAT_THEME_ID = CHAT_THEMES[0].id;

export const getStoredChatThemeId = () => {
  const storedTheme = localStorage.getItem(CHAT_THEME_STORAGE_KEY);

  return CHAT_THEMES.some((theme) => theme.id === storedTheme)
    ? storedTheme
    : DEFAULT_CHAT_THEME_ID;
};

export const getChatThemeById = (themeId) =>
  CHAT_THEMES.find((theme) => theme.id === themeId) || CHAT_THEMES[0];
