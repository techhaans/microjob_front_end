// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Platform } from "react-native";

// // ✅ Base URL (your backend IP)
// const BASE_URL =
//   Platform.OS === "android"
//     ? "http://192.168.156.218:8080/api"
//     : "http://192.168.156.218:8080/api";

// // ✅ Axios instance
// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { "Content-Type": "application/json" },
//   timeout: 15000,
// });

// // ✅ Attach token automatically
// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("authToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // ============================================================
// // 🔐 AUTH (OTP LOGIN FLOW)
// // ============================================================

// // ✅ Send OTP
// export const sendDoerOtp = async (phone) => {
//   const formatted = phone.startsWith("+") ? phone : "+91" + phone;
//   const res = await api.post("/auth/otp/doer-send", { phone: formatted });
//   return res.data;
// };

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

// // ============================================================
// // 👤 PROFILE
// // ============================================================

// export const fetchDoerProfile = async () => {
//   const res = await api.get("/doer/profile/get");
//   return res.data;
// };

// export const updateDoerProfile = async (payload) => {
//   const res = await api.put("/doer/profile/", payload);
//   return res.data;
// };

// // ============================================================
// // 🪪 KYC UPLOAD (JWT Protected)
// // ============================================================

// export const uploadDoerKyc = async (fileUri, docType) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("JWT token missing. Please login again.");

//     const formData = new FormData();
//     formData.append("file", {
//       uri: fileUri,
//       name: fileUri.split("/").pop(),
//       type: "image/jpeg", // or "application/pdf"
//     });

//     const res = await axios.post(
//       `${BASE_URL}/doer/profile/doc/upload?docType=${encodeURIComponent(docType)}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return res.data;
//   } catch (err) {
//     console.error("KYC Upload Error:", err.response?.data || err.message);
//     throw err;
//   }
// };
// // ============================================================
// // 📱 PHONE VERIFICATION (AFTER PROFILE SAVE)
// // ============================================================

// // ✅ Send OTP to registered phone (no body required)
// export const sendPhoneOtp = async () => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("JWT token missing. Please login again.");

//     const res = await axios.post(
//       `${BASE_URL}/doer/profile/phone/send-otp`,
//       {}, // no body required
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return res.data; // expect { data: { message, sessionId, expiryMin } }
//   } catch (err) {
//     console.error("Send Phone OTP Error:", err.response?.data || err.message);
//     return (
//       err.response?.data || {
//         status: "ERROR",
//         message: "Network error while sending OTP",
//       }
//     );
//   }
// };

// // ✅ Verify phone OTP (body: { sessionId, otp })
// export const verifyPhoneOtp = async (sessionId, otp) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("JWT token missing. Please login again.");

//     const res = await axios.post(
//       `${BASE_URL}/doer/profile/phone/verify`,
//       { sessionId, otp },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return res.data; // expect { data, message, status }
//   } catch (err) {
//     console.error("Verify Phone OTP Error:", err.response?.data || err.message);
//     return (
//       err.response?.data || {
//         status: "ERROR",
//         message: "Network error while verifying OTP",
//       }
//     );
//   }
// };

// // ============================================================
// // 🚪 LOGOUT
// // ============================================================

// export const logoutDoer = async () => {
//   await AsyncStorage.removeItem("authToken");
//   await AsyncStorage.removeItem("userRole");
// };

// // export default api;
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Platform } from "react-native";

// // ✅ Base URL (your backend IP)
// const BASE_URL =
//   Platform.OS === "android"
//     ? "http://192.168.156.218:8080/api"
//     : "http://192.168.156.218:8080/api";

// // ✅ Axios instance
// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { "Content-Type": "application/json" },
//   timeout: 15000,
// });

// // ✅ Attach token automatically
// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("authToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // ============================================================
// // 🔐 AUTH (OTP LOGIN FLOW)
// // ============================================================

// // ✅ Send OTP
// export const sendDoerOtp = async (phone) => {
//   const formatted = phone.startsWith("+") ? phone : "+91" + phone;
//   const res = await api.post("/auth/otp/doer-send", { phone: formatted });
//   return res.data;
// };

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

// // ============================================================
// // 👤 PROFILE
// // ============================================================

// export const fetchDoerProfile = async () => {
//   const res = await api.get("/doer/profile/get");
//   return res.data;
// };

// export const updateDoerProfile = async (payload) => {
//   const res = await api.put("/doer/profile/", payload);
//   return res.data;
// };

// // ============================================================
// // 🪪 KYC UPLOAD (JWT Protected)
// // ============================================================

// export const uploadDoerKyc = async (fileUri, docType) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("JWT token missing. Please login again.");

//     const formData = new FormData();
//     formData.append("file", {
//       uri: fileUri,
//       name: fileUri.split("/").pop(),
//       type: "image/jpeg", // or "application/pdf"
//     });

//     const res = await axios.post(
//       `${BASE_URL}/doer/profile/doc/upload?docType=${encodeURIComponent(docType)}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return res.data;
//   } catch (err) {
//     console.error("KYC Upload Error:", err.response?.data || err.message);
//     throw err;
//   }
// };

// // ============================================================
// // 📱 PHONE VERIFICATION (AFTER PROFILE SAVE)
// // ============================================================

// // ✅ Send OTP to registered phone
// export const sendPhoneOtp = async () => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("JWT token missing. Please login again.");

//     const res = await axios.post(
//       `${BASE_URL}/doer/profile/phone/send-otp`,
//       {},
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     return res.data; // expect { data: { message, sessionId, expiryMin } }
//   } catch (err) {
//     console.error("Send Phone OTP Error:", err.response?.data || err.message);
//     return (
//       err.response?.data || {
//         status: "ERROR",
//         message: "Network error while sending OTP",
//       }
//     );
//   }
// };

// // ✅ Verify phone OTP
// export const verifyPhoneOtp = async (sessionId, otp) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("JWT token missing. Please login again.");

//     const res = await axios.post(
//       `${BASE_URL}/doer/profile/phone/verify`,
//       { sessionId, otp },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     return res.data;
//   } catch (err) {
//     console.error("Verify Phone OTP Error:", err.response?.data || err.message);
//     return (
//       err.response?.data || {
//         status: "ERROR",
//         message: "Network error while verifying OTP",
//       }
//     );
//   }
// };

// // ============================================================
// // 🪪 FETCH KYC STATUS (NEW)
// // ============================================================

// export const fetchKycStatus = async (userId) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("JWT token missing. Please login again.");

//     const res = await axios.get(`${BASE_URL}/doer/profile/kyc-status`, {
//       params: { userId },
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     // Expected response: { status: "SUCCESS", data: { status: "pending|verified|failed", reason: "..." } }
//     return res.data;
//   } catch (err) {
//     console.error("Fetch KYC Status Error:", err.response?.data || err.message);
//     return { status: "ERROR", message: "Failed to fetch KYC status" };
//   }
// };

// // ============================================================
// // 🚪 LOGOUT
// // ============================================================

// export const logoutDoer = async () => {
//   await AsyncStorage.removeItem("authToken");
//   await AsyncStorage.removeItem("userRole");
// };

// export default api;

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ✅ Base URL (your backend IP)
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.156.218:8080/api"
    : "http://192.168.156.218:8080/api";

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

// ✅ Verify phone OTP
export const verifyPhoneOtp = async (sessionId, otp) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("JWT token missing. Please login again.");

    const res = await axios.post(
      `${BASE_URL}/doer/profile/phone/verify`,
      { sessionId, otp },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return res.data;
  } catch (err) {
    console.error("Verify Phone OTP Error:", err.response?.data || err.message);
    return (
      err.response?.data || {
        status: "ERROR",
        message: "Network error while verifying OTP",
      }
    );
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

// ============================================================
// 🚪 LOGOUT
// ============================================================

export const logoutDoer = async () => {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("userRole");
};

export default api;
