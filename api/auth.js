import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ============================================================
// 🌐 BASE URL
// ============================================================
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.40:8080/api"
    : "http://192.168.1.40:8080/api";

// ============================================================
// ⚙️ AXIOS INSTANCE
// ============================================================
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Automatically attach accessToken
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ============================================================
// 🔐 OTP AUTH FLOW
// ============================================================

// 1️⃣ Send OTP
export const sendOtp = async (email) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/otp/send`, { email });
    const sessionId = res.data?.data?.sessionId;
    if (sessionId) await AsyncStorage.setItem("sessionId", sessionId);
    return res.data;
  } catch (error) {
    console.error("Send OTP Error:", error.response?.data || error.message);
    return { status: "ERROR", message: "Failed to send OTP" };
  }
};

// 2️⃣ Verify OTP
export const verifyOtp = async (otp) => {
  try {
    const sessionId = await AsyncStorage.getItem("sessionId");
    if (!sessionId) throw new Error("Session ID missing. Please resend OTP.");

    const res = await axios.post(`${BASE_URL}/auth/otp/verify`, {
      sessionId,
      otp,
    });

    const tempToken = res.data?.data?.accessToken;
    if (tempToken) await AsyncStorage.setItem("tempToken", tempToken);

    return res.data;
  } catch (error) {
    //console.error("Verify OTP Error");
    return {
      status: "ERROR",
      message:
        error.response?.data?.message ||
        "OTP verification failed. Please try again.",
    };
  }
};

// 3️⃣ Select Role
export const selectRole = async (role) => {
  try {
    const tempToken = await AsyncStorage.getItem("tempToken");
    if (!tempToken)
      throw new Error("Temporary token missing. Please re-login.");

    const res = await axios.post(
      `${BASE_URL}/auth/otp/select-role`,
      { role },
      { headers: { Authorization: `Bearer ${tempToken}` } }
    );

    const { accessToken, refreshToken } = res.data?.data || {};
    if (accessToken && refreshToken) {
      await AsyncStorage.multiSet([
        ["accessToken", accessToken],
        ["refreshToken", refreshToken],
        ["userRole", role.toUpperCase()],
      ]);
      await AsyncStorage.removeItem("tempToken");
    }

    return res.data;
  } catch (error) {
    console.error("Select Role Error:", error.response?.data || error.message);
    return {
      status: "ERROR",
      message: error.response?.data?.message || "Failed to select role",
    };
  }
};

// ============================================================
// 👷 DOER APIs
// ============================================================
export const fetchDoerProfile = async () =>
  (await api.get("/doer/profile/get")).data;

export const updateDoerProfile = async (payload) =>
  (await api.put("/doer/profile/", payload)).data;

export const uploadDoerKyc = async (fileUri, docType) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (!token) throw new Error("JWT token missing. Please login again.");

  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    name: fileUri.split("/").pop(),
    type: "image/jpeg",
  });

  const res = await axios.post(
    `${BASE_URL}/doer/profile/doc/upload?docType=${encodeURIComponent(
      docType
    )}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// ============================================================
// 📦 POSTER APIs
// ============================================================
export const fetchPosterProfile = async () =>
  (await api.get("/poster/profile/get")).data;

export const updatePosterProfile = async (payload) =>
  (await api.put("/poster/profile/", payload)).data;

// ---- JOBS ----
export const createPosterJob = async (jobData) => {
  const payload = {
    title: jobData.title,
    description: jobData.description,
    categoryCode: Number(jobData.categoryCode),
    amountPaise: Number(jobData.amountPaise),
    deadline: jobData.deadline || new Date().toISOString(),
    addressId: Number(jobData.addressId),
  };
  const res = await api.post("/poster/jobs/create", payload);
  return res.data;
};

export const getPosterJobs = async () =>
  (await api.get("/poster/jobs/list")).data;

export const deletePosterJob = async (id) =>
  (await api.delete(`/poster/jobs/delete/${id}`)).data;

export const fetchCategories = async () =>
  (await api.get("/poster/jobs/all")).data;

// ---- KYC ----
export const uploadPosterKyc = async (docType, file) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (!token) throw new Error("Poster not logged in");

  const formData = new FormData();
  formData.append("docType", docType);
  formData.append("file", {
    uri: file.uri,
    type: file.type || "application/pdf",
    name: file.name || "document.pdf",
  });

  const res = await axios.post(
    `${BASE_URL}/poster/profile/doc/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// ============================================================
// 🚪 LOGOUT
// ============================================================
export const logout = async () => {
  await AsyncStorage.multiRemove([
    "accessToken",
    "refreshToken",
    "tempToken",
    "userRole",
    "sessionId",
    "posterProfile",
    "doerProfile",
  ]);

  return { status: "SUCCESS", message: "Logged out successfully" };
};

export default api;
