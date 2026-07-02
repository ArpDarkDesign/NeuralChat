import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/support`;

const submitSupportRequest = async (path, data) => {
  const response = await axios.post(`${API}${path}`, data);

  return response.data;
};

export const submitBugReport = (data) => submitSupportRequest("/bug", data);

export const submitFeatureRequest = (data) =>
  submitSupportRequest("/feature", data);

export const submitContactSupport = (data) =>
  submitSupportRequest("/contact", data);
