import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ✅ Base URL (your backend IP)
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.97.218:8080/api"
    : "http://192.168.97.218:8080/api";

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

// // ✅ Verify OTP + Save JWT
// export const verifyDoerOtp = async (sessionId, otp) => {
//   const res = await api.post("/auth/otp/doer/verify", { sessionId, otp });
//   const data = res.data?.data;

//   if (data?.token) {
//     await AsyncStorage.setItem("authToken", data.token);
//     if (data.roleCode) await AsyncStorage.setItem("userRole", data.roleCode);
//   }

//   return res.data;
// };

export const verifyDoerPhoneOtp = async (sessionId, otp) => {
  const res = await api.post("/doer/profile/phone/verify", {
    sessionId: String(sessionId),
    otp: String(otp),
  });

  return res.data;
};

// ============================================================
// 👤 PROFILE
// ============================================================

export const fetchDoerProfile = async () => {
  const res = await api.get("/doer/profile/get");
  return res.data;
};

// export const updateDoerProfile = async (payload) => {
//   const res = await api.put("/doer/profile/", payload);
//   return res.data;
// };
export const updateDoerProfile = async (payload) => {
  try {
    console.log("🚀 Sending update payload:", payload);

    const res = await api.put("/doer/profile/", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Update Response:", res.data);
    return res.data;
  } catch (error) {
    console.log("❌ Update Error:", error.response?.data || error);
    throw error;
  }
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
  } catch (err) {
    console.error("KYC Upload Error:", err.response?.data || err.message);
    throw err;
  }
};

// ============================================================
// 🧰 FETCH DOER CATEGORIES (SKILLS)
// ============================================================

export const fetchDoerCategories = async () => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) throw new Error("Token not found");

  const res = await api.get("/doer/jobs/categories", {
    headers: {
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    },
  });

  return res.data;
};

// // ✅ Fetch Available Jobs
// export const fetchAvailableJobs = async (page = 0, size = 20) => {
//   const res = await api.get("/doer/jobs/available", {
//     params: { page, size },
//   });
//   return res.data;
// };
// ✅ Fetch Available Jobs (with GPS + Radius)
export const fetchAvailableJobs = async (
  lat,
  lon,
  radius = 5000, // meters
  page = 0,
  size = 20,
  sort = ["createdAt,desc"]
) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("Auth token missing");

    const headers = { Authorization: `Bearer ${token}` };

    const params = { lat, lon, radius, page, size, sort };

    // ❌ old: `${BASE_URL}/api/doer/jobs/available`
    // ✅ fixed:
    const { data } = await axios.get(`${BASE_URL}/doer/jobs/available`, {
      headers,
      params,
    });

    return data;
  } catch (err) {
    console.warn(
      "⚠️ Fetch Available Jobs Error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

// ============================================================
// 📱 PHONE VERIFICATION (AFTER PROFILE SAVE)
// ============================================================

// ✅ Send OTP to registered phone
export const sendPhoneOtp = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("JWT token missing. Please login again.");

    const res = await axios.post(
      `${BASE_URL}/doer/profile/phone/send-otp`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return res.data; // expect { data: { message, sessionId, expiryMin } }
  } catch (err) {
    console.error("Send Phone OTP Error:", err.response?.data || err.message);
    return (
      err.response?.data || {
        status: "ERROR",
        message: "Network error while sending OTP",
      }
    );
  }
};

// export const verifyPhoneOtp = async (sessionId, otp) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("JWT token missing. Please login again.");

//     const res = await axios.post(
//       `${BASE_URL}/doer/profile/phone/verify`,
//       {
//         sessionId: String(sessionId),
//         otp: String(otp),
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     return res.data;
//   } catch (err) {
//     return (
//       err.response?.data || {
//         status: "ERROR",
//         message: "Network error while verifying OTP",
//       }
//     );
//   }
// };
export const verifyPhoneOtp = async (sessionId, otp) => {
  try {
    const response = await api.post("/doer/profile/phone/verify", {
      sessionId: sessionId,
      otp: otp,
    });
    return response.data;
  } catch (error) {
    console.error("verifyPhoneOtp error:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ============================================================
// 🪪 FETCH KYC STATUS (NEW)
// ============================================================

export const fetchKycStatus = async (userId) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("JWT token missing. Please login again.");

    const res = await axios.get(`${BASE_URL}/doer/profile/kyc-status`, {
      params: { userId },
      headers: { Authorization: `Bearer ${token}` },
    });

    // Expected response: { status: "SUCCESS", data: { status: "pending|verified|failed", reason: "..." } }
    return res.data;
  } catch (err) {
    console.error("Fetch KYC Status Error:", err.response?.data || err.message);
    return { status: "ERROR", message: "Failed to fetch KYC status" };
  }
};
// // Accept a job
// export const acceptJob = async (jobId) => {
//   try {
//     const res = await api.post(`/doer/jobs/accept/${jobId}`);
//     return res.data; // { status, message, data, timestamp }
//   } catch (err) {
//     console.warn("Accept Job Error:", err.message || err);
//     return { status: "ERROR", message: "Failed to accept job" };
//   }
// };
// ✅ Accept Job — FIXED ✅
export const acceptJob = async (jobId) => {
  try {
    const res = await api.post(`/doer/jobs/accept/${jobId}`);
    return res.data; // returns ApiResponse (data, message, status, timestamp)
  } catch (error) {
    console.log("❌ Accept Job Error:", error.response?.data || error.message);
    throw error;
  }
};
// ✅ Current Jobs
export const fetchCurrentJobs = async () => {
  const res = await api.get("/doer/jobs/current");
  return res.data;
};
// ✅ Fetch Job History
// ✅ Fetch Job History (fixed)
export const fetchJobHistory = async (
  page = 0,
  size = 10,
  sort = ["createdAt,desc"]
) => {
  const token = await AsyncStorage.getItem("authToken");
  const headers = { Authorization: `Bearer ${token}` };
  const params = { page, size, sort };

  // ✅ FIXED: removed duplicate /api
  const { data } = await axios.get(`${BASE_URL}/doer/jobs/history`, {
    headers,
    params,
  });

  return data?.data?.content || [];
};

// ============================================================
// 🚪 LOGOUT
// ============================================================

export const logoutDoer = async () => {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("userRole");
};
