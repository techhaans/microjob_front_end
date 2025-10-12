

// export default api;
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// -------------------------------------------------------------
// 🔹 BASE CONFIG
// -------------------------------------------------------------
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.45.218:8080/api"
    : "http://192.168.45.218:8080/api";

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
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to send OTP",
    };
  }
};

export const verifyPosterOtp = async (sessionId, otp) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/otp/poster/verify`, {
      sessionId,
      otp,
    });
    if (res.data?.data?.token) {
      await AsyncStorage.setItem("authToken", res.data.data.token);
      await AsyncStorage.setItem(
        "userRole",
        res.data.data.roleCode || "POSTER"
      );
    }
    return res.data;
  } catch (err) {
    return {
      status: "ERROR",
      message: err.response?.data?.message || "OTP verification failed",
    };
  }
};

// -------------------------------------------------------------
// 🔹 Poster Profile APIs
// -------------------------------------------------------------
export const fetchPosterProfile = async () =>
  (await api.get("/poster/profile/get")).data;

export const updatePosterProfile = async (body) =>
  (await api.put("/poster/profile/", body)).data;

// -------------------------------------------------------------
// 🔹 Address APIs
// -------------------------------------------------------------
export const getPosterAddresses = async () =>
  (await api.get("/poster/profile/address/get")).data;

export const addAddress = async (address) =>
  (await api.post("/poster/profile/address", address)).data;

export const updateAddress = async (id, address) =>
  (await api.put(`/poster/profile/address/${id}`, address)).data;

export const deleteAddress = async (id) =>
  (await api.delete(`/poster/profile/address/${id}`)).data;

// -------------------------------------------------------------
// 🔹 KYC APIs
// -------------------------------------------------------------
export const uploadPosterKyc = async (formData, docType) => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) return { status: "ERROR", message: "Please login again" };

  const res = await axios.post(
    `${BASE_URL}/poster/profile/kyc/upload?docType=${encodeURIComponent(
      docType
    )}`,
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
// 🔹 Poster Job APIs ✅
// -------------------------------------------------------------
export const createPosterJob = async (jobData) => {
  try {
    const res = await api.post("/poster/jobs/create", jobData); // ✅ fixed path
    return res.data;
  } catch (err) {
    console.error("❌ Job Create Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to create job",
    };
  }
};

export const getPosterJobs = async () => {
  try {
    const res = await api.get("/poster/jobs/list"); // ✅
    return res.data;
  } catch (err) {
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to fetch jobs",
    };
  }
};

export const deletePosterJob = async (jobId) => {
  try {
    const res = await api.delete(`/poster/jobs/delete/${jobId}`); // ✅
    return res.data;
  } catch (err) {
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to delete job",
    };
  }
};
export const logoutPoster = async () => {
  try {
    // Optional: Call API logout endpoint (if available)
    // await api.post("/auth/logout");

    // Remove local session data
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("posterProfile");
    await AsyncStorage.removeItem("userRole");

    return { status: "SUCCESS", message: "Logout successful" };
  } catch (err) {
    console.error("❌ Logout Error:", err);
    return { status: "ERROR", message: "Logout failed" };
  }
};
