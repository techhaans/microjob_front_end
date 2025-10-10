
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ✅ Base URL (your backend IP)
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.60.218:8080/api"
    : "http://192.168.60.218:8080/api";

// ✅ Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ✅ Attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ============================================================
// 🔐 AUTH (OTP LOGIN FLOW)
// ============================================================

// ✅ Send OTP
export const sendDoerOtp = async (phone) => {
  const formatted = phone.startsWith("+") ? phone : "+91" + phone;
  const res = await api.post("/auth/otp/doer-send", { phone: formatted });
  return res.data;
};

// ✅ Verify OTP + Save JWT
export const verifyDoerOtp = async (sessionId, otp) => {
  const res = await api.post("/auth/otp/doer/verify", { sessionId, otp });
  const data = res.data?.data;

  if (data?.token) {
    await AsyncStorage.setItem("authToken", data.token);
    if (data.roleCode) await AsyncStorage.setItem("userRole", data.roleCode);
  }

  return res.data;
};

// ============================================================
// 👤 PROFILE
// ============================================================

export const fetchDoerProfile = async () => {
  const res = await api.get("/doer/profile/get");
  return res.data;
};

export const updateDoerProfile = async (payload) => {
  const res = await api.put("/doer/profile/", payload);
  return res.data;
};

// ============================================================
// 🪪 KYC UPLOAD (JWT Protected)
// ============================================================

export const uploadDoerKyc = async (fileUri, docType) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("JWT token missing. Please login again.");

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileUri.split("/").pop(),
      type: "image/jpeg", // or "application/pdf"
    });

    const res = await axios.post(
      `${BASE_URL}/doer/profile/doc/upload?docType=${encodeURIComponent(docType)}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error("KYC Upload Error:", err.response?.data || err.message);
    throw err;
  }
};

// ============================================================
// 🚪 LOGOUT
// ============================================================

export const logoutDoer = async () => {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("userRole");
};

export default api;
