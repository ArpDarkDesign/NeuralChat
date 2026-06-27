import axios from "axios";

const API = "http://localhost:5000/api/chats";

export const getChats = async (userId) => {
  const response = await axios.get(`${API}/${userId}`);

  return response.data;
};

export const getUserStats = async (userId) => {
  const response = await axios.get(`${API}/stats/${userId}`);

  return response.data;
};

export const saveChat = async (chat) => {
  console.log("saveChat() called");
  console.log(JSON.stringify(chat, null, 2));

  const response = await axios.post(API, chat);

  return response.data;
};

export const deleteChat = async (chatId) => {
  await axios.delete(`${API}/${chatId}`);
};
