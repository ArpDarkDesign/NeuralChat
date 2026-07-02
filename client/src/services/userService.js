import axios from "axios";

// const API = "http://localhost:5000/api/users";

const API = `${import.meta.env.VITE_API_URL}/api/user`;

export const uploadAvatar = async (userId, file) => {
  const formData = new FormData();

  formData.append("avatar", file);

  const res = await axios.post(`${API}/avatar/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const deleteAccount = async (userId) => {
  const res = await axios.delete(`${API}/delete/${userId}`);

  return res.data;
};
