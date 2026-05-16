import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ---------------- Base URL ----------------
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.40:8080/api"
    : "http://192.168.1.40:8080/api";

// ---------------- Axios Instance ----------------
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------- Helper for Auth Token ----------------
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ---------------- Poster APIs ----------------

// 1️⃣ Fetch Poster Profile
export const fetchPosterProfile = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await api.get("/poster/profile", { headers });
    return res.data;
  } catch (err) {
    throw err;
  }
};

// 2️⃣ Fetch Jobs
export const fetchJobs = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await api.get("/poster/jobs", { headers });
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ---------------- Notifications ----------------

// 3️⃣ Fetch Notifications (with optional onlyUnread)
export const fetchNotifications = async (
  onlyUnread = false,
  page = 0,
  size = 20
) => {
  try {
    const headers = await getAuthHeaders();
    const res = await api.get(
      `/notifications/?onlyUnread=${onlyUnread}&page=${page}&size=${size}`,
      { headers }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

// 4️⃣ Fetch Unread Count
export const fetchUnreadCount = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await api.get("/notifications/unread-count", { headers });
    return res.data;
  } catch (err) {
    throw err;
  }
};

// 5️⃣ Mark Notification as Read
export const markNotificationRead = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const res = await api.post(`/notifications/${id}/read`, {}, { headers });
    return res.data;
  } catch (err) {
    throw err;
  }
};

// 6️⃣ Mark All Notifications as Read
export const markAllNotificationsRead = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await api.post("/notifications/read-all", {}, { headers });
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ---------------- Job Interests ----------------

// 7️⃣ Fetch Job Interests
export const fetchJobInterests = async (jobId) => {
  try {
    const headers = await getAuthHeaders();
    const res = await api.get(`/poster/jobs/${jobId}/interests`, { headers });
    return res.data;
  } catch (err) {
    throw err;
  }
};

// 8️⃣ Accept Job Interest
export const acceptJobInterest = async (jobId, interestId) => {
  try {
    const headers = await getAuthHeaders();
    const res = await api.post(
      `/poster/jobs/${jobId}/interests/${interestId}/accept`,
      {},
      { headers }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

// 9️⃣ Reject Job Interest
export const rejectJobInterest = async (jobId, interestId) => {
  try {
    const headers = await getAuthHeaders();
    const res = await api.post(
      `/poster/jobs/${jobId}/interests/${interestId}/reject`,
      {},
      { headers }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};
