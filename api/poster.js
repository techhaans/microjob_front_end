
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// -------------------------------------------------------------
// 🔹 BASE CONFIG
// -------------------------------------------------------------
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.60.218:8080/api"
    : "http://192.168.60.218:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// -------------------------------------------------------------
// 🔹 Attach JWT Token Automatically
// -------------------------------------------------------------
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// -------------------------------------------------------------
// 🔹 OTP: Send + Verify (No token required)
// -------------------------------------------------------------
export const sendPosterOtp = async (phone) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/otp/poster-send`, {
      phone: phone.startsWith("+91") ? phone : `+91${phone}`,
    });
    return res.data;
  } catch (err) {
    return { status: "ERROR", message: err.response?.data?.message || "Failed to send OTP" };
  }
};

export const verifyPosterOtp = async (sessionId, otp) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/otp/poster/verify`, { sessionId, otp });
    if (res.data?.data?.token) {
      await AsyncStorage.setItem("authToken", res.data.data.token);
      await AsyncStorage.setItem("userRole", res.data.data.roleCode || "POSTER");
    }
    return res.data;
  } catch (err) {
    return { status: "ERROR", message: err.response?.data?.message || "OTP verification failed" };
  }
};

// -------------------------------------------------------------
// 🔹 Poster Profile APIs
// -------------------------------------------------------------
export const fetchPosterProfile = async () => (await api.get("/poster/profile/get")).data;

export const updatePosterProfile = async (body) =>
  (await api.put("/poster/profile/", body)).data;

// -------------------------------------------------------------
// 🔹 Address APIs
// -------------------------------------------------------------

// Get all addresses of poster
export const getPosterAddresses = async () =>
  (await api.get("/poster/profile/address/get")).data;

// Add a new address (POST)
export const addAddress = async (address) =>
  (await api.post("/poster/profile/address", address)).data;

// Update an existing address (PUT)
export const updateAddress = async (id, address) =>
  (await api.put(`/poster/profile/address/${id}`, address)).data;

// Delete an address (DELETE)
export const deleteAddress = async (id) =>
  (await api.delete(`/poster/profile/address/${id}`)).data;

// -------------------------------------------------------------
// 🔹 KYC APIs
// -------------------------------------------------------------
export const uploadPosterKyc = async (formData, docType) => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) return { status: "ERROR", message: "Please login again" };

  const res = await axios.post(
    `${BASE_URL}/poster/profile/kyc/upload?docType=${encodeURIComponent(docType)}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const getPosterKycHistory = async () =>
  (await api.get("/poster/profile/kyc/history")).data;

export const deletePosterKyc = async (id) =>
  (await api.delete(`/poster/profile/kyc/delete/${id}`)).data;

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
export const logoutPoster = async () => {
  await AsyncStorage.multiRemove(["authToken", "userRole"]);
  return { status: "SUCCESS" };
};

export default api;
