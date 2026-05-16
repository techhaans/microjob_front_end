import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./ipconfig";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Fetch chat messages for a job
export const fetchChatMessages = async (jobId, page = 0, size = 50) => {
  try {
    const res = await api.get(`/jobs/${jobId}/chat/messages`, {
      params: { page, size },
    });
    return res.data?.data?.content ?? [];
  } catch (err) {
    console.error(
      "❌ fetchChatMessages error:",
      err.response?.status,
      err.message
    );
    if (err.response?.status === 403)
      throw new Error("You are not allowed to view this chat");
    throw err;
  }
};

// Send a chat message
export const sendChatMessage = async (jobId, messageText) => {
  try {
    const res = await api.post(`/jobs/${jobId}/chat/messages`, {
      body: messageText,
    });
    return res.data;
  } catch (err) {
    console.error(
      "❌ sendChatMessage error:",
      err.response?.status,
      err.message
    );
    if (err.response?.status === 403)
      throw new Error("You are not allowed to send messages in this chat");
    throw err;
  }
};

// Mark all messages as read
export const markAllMessagesRead = async (jobId) => {
  try {
    const res = await api.post(`/jobs/${jobId}/chat/read-all`);
    return res.data;
  } catch (err) {
    console.error("❌ markAllMessagesRead error:", err.message);
    throw err;
  }
};

// Get unread chat count
export const getUnreadChatCount = async () => {
  try {
    const res = await api.get("/chat/unread-count");
    return res.data?.data ?? 0;
  } catch (err) {
    console.error("❌ getUnreadChatCount error:", err.message);
    return 0;
  }
};
