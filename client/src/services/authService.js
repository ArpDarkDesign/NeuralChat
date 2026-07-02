import axios from "axios";

// const API_URL = "http://localhost:5000/api/auth";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export const loginUser = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);

  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });

  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await axios.post(`${API_URL}/reset-password/${token}`, {
    password,
  });

  return response.data;
};
