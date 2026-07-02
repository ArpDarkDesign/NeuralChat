import axios from "axios";

// const API = "http://localhost:5000/api/chats";

const API = `${import.meta.env.VITE_API_URL}/api/chat`;

export const getChats = async (userId) => {
  const response = await axios.get(`${API}/${userId}`);

  return response.data;
};

export const getUserStats = async (userId) => {
  const response = await axios.get(`${API}/stats/${userId}`);

  return response.data;
};

export const saveChat = async (chat) => {
  const response = await axios.post(API, chat);

  return response.data;
};

export const deleteChat = async (chatId) => {
  await axios.delete(`${API}/${chatId}`);
};
