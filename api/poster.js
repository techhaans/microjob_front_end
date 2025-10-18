// api/poster.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// -------------------------------------------------------------
// 🔹 BASE CONFIG
// -------------------------------------------------------------
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.156.218:8080/api"
    : "http://192.168.156.218:8080/api";

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
// 🔹 OTP APIs (Send + Verify)
// -------------------------------------------------------------
export const sendPosterOtp = async (emailOrPhone) => {
  try {
    // Allow sending either phone or email (depending on your backend)
    const isEmail = emailOrPhone.includes("@");
    const payload = isEmail
      ? { email: emailOrPhone }
      : {
          phone: emailOrPhone.startsWith("+91")
            ? emailOrPhone
            : `+91${emailOrPhone}`,
        };

    const res = await axios.post(`${BASE_URL}/auth/otp/poster-send`, payload);

    return {
      status: res.data?.status || "SUCCESS",
      message: res.data?.message || "OTP sent successfully",
      data: res.data?.data || {},
    };
  } catch (err) {
    console.error("❌ OTP Send Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to send OTP",
    };
  }
};
//
export const verifyPosterOtp = async (sessionId, otp) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/otp/poster/verify`, {
      //
      sessionId,
      otp,
    });

    // If token is provided after verification, save it
    if (res.data?.data?.token) {
      await AsyncStorage.setItem("authToken", res.data.data.token);
    }
    if (res.data?.data?.roleCode) {
      await AsyncStorage.setItem("userRole", res.data.data.roleCode);
    }

    return {
      status: res.data?.status || "SUCCESS",
      message: res.data?.message || "OTP verified successfully",
      data: res.data?.data || {},
    };
  } catch (err) {
    console.error("❌ OTP Verify Error:", err.response?.data || err.message);
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
export const uploadPosterKyc = async (fileUri, docType) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("JWT token missing. Please login again.");

    // Detect MIME type dynamically
    let fileType = "application/octet-stream"; // default
    if (fileUri.endsWith(".pdf")) fileType = "application/pdf";
    else if (fileUri.endsWith(".jpg") || fileUri.endsWith(".jpeg"))
      fileType = "image/jpeg";
    else if (fileUri.endsWith(".png")) fileType = "image/png";

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileUri.split("/").pop(),
      type: fileType,
    });

    const res = await axios.post(
      `${BASE_URL}/poster/profile/doc/upload?docType=${encodeURIComponent(
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

    return res.data; // { status, message, data, timestamp }
  } catch (err) {
    console.error("KYC Upload Error:", err.response?.data || err.message);
    throw err;
  }
};

export const getPosterJobs = async () => {
  try {
    const res = await api.get("/poster/jobs/list");
    return res.data;
  } catch (err) {
    console.error("❌ Get Jobs Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to fetch jobs",
    };
  }
};

export const deletePosterJob = async (jobId) => {
  try {
    const res = await api.delete(`/poster/jobs/delete/${jobId}`);
    return res.data;
  } catch (err) {
    console.error("❌ Delete Job Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to delete job",
    };
  }
}; // -------------------------------------------------------------
// 🔹 Poster Phone OTP Verification
// -------------------------------------------------------------

/**
 * Send OTP to poster's registered phone number
 * POST /poster/profile/phone/send-otp
 * No parameters required
 */
export const sendPosterPhoneOtp = async () => {
  try {
    const res = await api.post("/poster/profile/phone/send-otp");
    return {
      status: res.data?.status || "SUCCESS",
      message: res.data?.message || "OTP sent successfully",
      data: res.data?.data || {}, // data includes { sessionId, message, expiryMin }
      timestamp: res.data?.timestamp || new Date().toISOString(),
    };
  } catch (err) {
    console.error(
      "❌ Send Poster Phone OTP Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to send OTP",
    };
  }
};

/**
 * Verify OTP for poster's phone number
 * POST /poster/profile/phone/verify
 * Request body: { sessionId: string, otp: string }
 */
export const verifyPosterPhoneOtp = async (sessionId, otp) => {
  try {
    const res = await api.post("/poster/profile/phone/verify", {
      sessionId,
      otp,
    });

    return {
      status: res.data?.status || "SUCCESS",
      message: res.data?.message || "Phone verified successfully",
      data: res.data?.data || "", // usually a string
      timestamp: res.data?.timestamp || new Date().toISOString(),
    };
  } catch (err) {
    console.error(
      "❌ Verify Poster Phone OTP Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "OTP verification failed",
    };
  }
};

// ----------------- Poster Job Creation -----------------
export const createPosterJob = async (jobData) => {
  try {
    // Ensure payload matches backend schema
    const payload = {
      title: jobData.title,
      description: jobData.description,
      categoryCode: Number(jobData.categoryCode),
      amountPaise: Number(jobData.amountPaise),
      deadline: jobData.deadline || new Date().toISOString(),
      addressId: Number(jobData.addressId),
    };

    const res = await api.post("/poster/jobs/create", payload);

    return {
      status: res.data?.status || "SUCCESS",
      message: res.data?.message || "Job created successfully",
      data: res.data?.data || {},
    };
  } catch (err) {
    console.error("❌ Job Creation Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to create job",
    };
  }
};

// -------------------------------------------------------------
// 🔹 Logout Poster
// -------------------------------------------------------------
export const logoutPoster = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("posterProfile");
    await AsyncStorage.removeItem("userRole");

    return { status: "SUCCESS", message: "Logout successful" };
  } catch (err) {
    console.error("❌ Logout Error:", err);
    return { status: "ERROR", message: "Logout failed" };
  }
};
