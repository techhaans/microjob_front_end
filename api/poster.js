// // src/api/poster.js
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Platform } from "react-native";

// const BASE_URL =
//   Platform.OS === "android"
//     ? "http://192.168.217.218:8080/api"
//     : "http://192.168.217.218:8080/api";

// const api = axios.create({
//   baseURL: BASE_URL,
//   timeout: 15000,
// });

// // Attach JWT automatically
// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("authToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // -------------------------------------------------------------
// // 🔹 Poster Profile APIs
// // -------------------------------------------------------------
// export const fetchPosterProfile = async () =>
//   (await api.get("/poster/profile/get")).data;

// export const updatePosterProfile = async (body) =>
//   (await api.put("/poster/profile/", body)).data;

// // -------------------------------------------------------------
// // 🔹 Address APIs
// // -------------------------------------------------------------
// export const getPosterAddresses = async () =>
//   (await api.get("/poster/profile/address/get")).data;

// export const addAddress = async (address) =>
//   (await api.post("/poster/profile/address", address)).data;

// export const updateAddress = async (id, address) =>
//   (await api.put(`/poster/profile/address/${id}`, address)).data;

// export const deleteAddress = async (id) =>
//   (await api.delete(`/poster/profile/address/${id}`)).data;

// // -------------------------------------------------------------
// // 🔹 KYC APIs
// // -------------------------------------------------------------

// export const uploadPosterKyc = async (docType, file) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("Poster not logged in");

//     if (!file || !file.uri) throw new Error("No file selected");

//     let fileUri = file.uri;
//     if (Platform.OS === "android" && !fileUri.startsWith("file://")) {
//       fileUri = "file://" + fileUri;
//     }

//     const formData = new FormData();
//     formData.append("docType", docType);
//     formData.append("file", {
//       uri: fileUri,
//       type: file.mimeType || file.type || "application/pdf",
//       name: file.name || "kyc_document.pdf",
//     });

//     const res = await axios.post(
//       `${BASE_URL}/poster/profile/doc/upload`,
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
//     console.error(
//       "❌ uploadPosterKyc Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message:
//         err.response?.data?.message ||
//         err.message ||
//         "Failed to upload KYC document",
//     };
//   }
// };
// export const getPosterKycHistory = async () => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("Poster not logged in");

//     const res = await axios.get(`${BASE_URL}/poster/profile/kyc/history`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ getPosterKycHistory Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to fetch KYC history",
//     };
//   }
// };

// export const deletePosterKyc = async (id) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("Poster not logged in");

//     const res = await axios.delete(`${BASE_URL}/poster/profile/kyc/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ deletePosterKyc Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to delete KYC document",
//     };
//   }
// };

// // -------------------------------------------------------------
// // 🔹 Poster Phone OTP Verification
// // -------------------------------------------------------------
// export const sendPosterPhoneOtp = async () => {
//   try {
//     const res = await api.post("/poster/profile/phone/send-otp");
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ sendPosterPhoneOtp Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to send OTP",
//     };
//   }
// };

// export const verifyPosterPhoneOtp = async (sessionId, otp) => {
//   try {
//     const res = await api.post("/poster/profile/phone/verify", {
//       sessionId,
//       otp,
//     });
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ verifyPosterPhoneOtp Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "OTP verification failed",
//     };
//   }
// };

// // -------------------------------------------------------------
// // 🔹 Poster Jobs APIs
// // -------------------------------------------------------------
// export const createPosterJob = async (jobData) => {
//   try {
//     const payload = {
//       title: jobData.title,
//       description: jobData.description,
//       categoryCode: Number(jobData.categoryCode),
//       amountPaise: Number(jobData.amountPaise),
//       deadline: jobData.deadline || new Date().toISOString(),
//       addressId: Number(jobData.addressId),
//     };
//     const res = await api.post("/poster/jobs/create", payload);
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ createPosterJob Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to create job",
//     };
//   }
// };

// export const getPosterJobs = async () => {
//   try {
//     const res = await api.get("/poster/jobs/list");
//     return res.data;
//   } catch (err) {
//     console.error("❌ getPosterJobs Error:", err.response?.data || err.message);
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to fetch jobs",
//     };
//   }
// };

// export const deletePosterJob = async (jobId) => {
//   try {
//     const res = await api.delete(`/poster/jobs/delete/${jobId}`);
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ deletePosterJob Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to delete job",
//     };
//   }
// };

// // -------------------------------------------------------------
// // 🔹 Logout Poster
// // -------------------------------------------------------------
// export const logoutPoster = async () => {
//   try {
//     await AsyncStorage.multiRemove(["authToken", "posterProfile", "userRole"]);
//     return { status: "SUCCESS", message: "Logout successful" };
//   } catch (err) {
//     console.error("❌ logoutPoster Error:", err);
//     return { status: "ERROR", message: "Logout failed" };
//   }
// };

// // src/api/poster.js
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Platform } from "react-native";

// const BASE_URL =
//   Platform.OS === "android"
//     ? "http://192.168.217.218:8080/api"
//     : "http://192.168.217.218:8080/api";

// const api = axios.create({
//   baseURL: BASE_URL,
//   timeout: 15000,
// });

// // Attach JWT automatically
// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("authToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // -------------------------------------------------------------
// // 🔹 Poster Profile APIs
// // -------------------------------------------------------------
// export const fetchPosterProfile = async () =>
//   (await api.get("/poster/profile/get")).data;
// export const updatePosterProfile = async (body) =>
//   (await api.put("/poster/profile/", body)).data;

// // -------------------------------------------------------------
// // 🔹 Address APIs
// // -------------------------------------------------------------
// export const getPosterAddresses = async () =>
//   (await api.get("/poster/profile/address/get")).data;
// export const addAddress = async (address) =>
//   (await api.post("/poster/profile/address", address)).data;
// export const updateAddress = async (id, address) =>
//   (await api.put(`/poster/profile/address/${id}`, address)).data;
// export const deleteAddress = async (id) =>
//   (await api.delete(`/poster/profile/address/${id}`)).data;

// // -------------------------------------------------------------
// // 🔹 KYC APIs
// // -------------------------------------------------------------
// export const uploadPosterKyc = async (docType, file) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("Poster not logged in");
//     if (!file || !file.uri) throw new Error("No file selected");

//     let fileUri = file.uri;
//     if (Platform.OS === "android" && !fileUri.startsWith("file://")) {
//       fileUri = "file://" + fileUri;
//     }

//     const formData = new FormData();
//     formData.append("docType", docType);
//     formData.append("file", {
//       uri: fileUri,
//       type: file.mimeType || file.type || "application/pdf",
//       name: file.name || "kyc_document.pdf",
//     });

//     const res = await axios.post(
//       `${BASE_URL}/poster/profile/doc/upload`,
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
//     console.error(
//       "❌ uploadPosterKyc Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message:
//         err.response?.data?.message ||
//         err.message ||
//         "Failed to upload KYC document",
//     };
//   }
// };

// export const getPosterKycHistory = async () => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("Poster not logged in");
//     const res = await axios.get(`${BASE_URL}/poster/profile/kyc/history`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ getPosterKycHistory Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to fetch KYC history",
//     };
//   }
// };

// export const deletePosterKyc = async (id) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("Poster not logged in");
//     const res = await axios.delete(`${BASE_URL}/poster/profile/kyc/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ deletePosterKyc Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to delete KYC document",
//     };
//   }
// };

// // -------------------------------------------------------------
// // 🔹 Poster Phone OTP Verification
// // -------------------------------------------------------------
// export const sendPosterPhoneOtp = async () => {
//   try {
//     const res = await api.post("/poster/profile/phone/send-otp");
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ sendPosterPhoneOtp Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to send OTP",
//     };
//   }
// };

// export const verifyPosterPhoneOtp = async (sessionId, otp) => {
//   try {
//     const res = await api.post("/poster/profile/phone/verify", {
//       sessionId,
//       otp,
//     });
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ verifyPosterPhoneOtp Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "OTP verification failed",
//     };
//   }
// };

// // -------------------------------------------------------------
// // 🔹 Poster Jobs APIs
// // -------------------------------------------------------------
// export const createPosterJob = async (jobData) => {
//   try {
//     const payload = {
//       title: jobData.title,
//       description: jobData.description,
//       categoryCode: Number(jobData.categoryCode),
//       amountPaise: Number(jobData.amountPaise),
//       deadline: jobData.deadline || new Date().toISOString(),
//       addressId: Number(jobData.addressId),
//     };
//     const res = await api.post("/poster/jobs/create", payload);
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ createPosterJob Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to create job",
//     };
//   }
// };

// export const fetchCategories = async () => {
//   try {
//     const res = await api.get("/poster/jobs/all");
//     return res.data; // data: [{code, name}, ...]
//   } catch (err) {
//     console.error(
//       "❌ fetchCategories Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to fetch categories",
//     };
//   }
// };

// export const getPosterJobs = async () => {
//   try {
//     const res = await api.get("/poster/jobs/list");
//     return res.data;
//   } catch (err) {
//     console.error("❌ getPosterJobs Error:", err.response?.data || err.message);
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to fetch jobs",
//     };
//   }
// };

// export const deletePosterJob = async (jobId) => {
//   try {
//     const res = await api.delete(`/poster/jobs/delete/${jobId}`);
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ deletePosterJob Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to delete job",
//     };
//   }
// };
// export const fetchPosterAddresses = async () => {
//   try {
//      const res = await api.get("/poster/profile/address/get");
//     return res.data;
//   } catch (err) {
//     console.error("Address Fetch Error:", err);
//     throw err;
//   }
// };

// // -------------------------------------------------------------
// // 🔹 Logout Poster
// // -------------------------------------------------------------
// export const logoutPoster = async () => {
//   try {
//     await AsyncStorage.multiRemove(["authToken", "posterProfile", "userRole"]);
//     return { status: "SUCCESS", message: "Logout successful" };
//   } catch (err) {
//     console.error("❌ logoutPoster Error:", err);
//     return { status: "ERROR", message: "Logout failed" };
//   }
// };

// // src/api/poster.js
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Platform } from "react-native";

// const BASE_URL =
//   Platform.OS === "android"
//     ? "http://192.168.217.218:8080/api"
//     : "http://192.168.217.218:8080/api";

// // Axios instance
// const api = axios.create({
//   baseURL: BASE_URL,
//   timeout: 15000,
// });

// // Automatically attach JWT
// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("authToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // ==========================
// // Poster Profile APIs
// // ==========================
// export const fetchPosterProfile = async () =>
//   (await api.get("/poster/profile/get")).data;
// export const updatePosterProfile = async (body) =>
//   (await api.put("/poster/profile/", body)).data;

// // ==========================
// // Address APIs
// // ==========================

// export const addAddress = async (address) =>
//   (await api.post("/poster/profile/address", address)).data;
// export const updateAddress = async (id, address) =>
//   (await api.put(`/poster/profile/address/${id}`, address)).data;
// export const deleteAddress = async (id) =>
//   (await api.delete(`/poster/profile/address/${id}`)).data;
// // ==========================
// // Address APIs
// // ==========================
// export const fetchPosterAddresses = async () => {
//   try {
//     const token = await AsyncStorage.getItem("authToken"); // use your correct token key
//     const res = await api.get("/poster/profile/address/get", {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     // assuming backend returns { status: "SUCCESS", data: [...] }
//     if (res.data?.status === "SUCCESS") {
//       return res.data; // contains status and data
//     } else {
//       console.warn("No addresses found");
//       return { status: "SUCCESS", data: [] }; // empty array fallback
//     }
//   } catch (err) {
//     console.error("[Fetch Addresses Error]", err);
//     return { status: "ERROR", data: [], message: err.message };
//   }
// };

// // ==========================
// // KYC APIs
// // ==========================
// export const uploadPosterKyc = async (docType, file) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("Poster not logged in");
//     if (!file?.uri) throw new Error("No file selected");

//     let fileUri = file.uri;
//     if (Platform.OS === "android" && !fileUri.startsWith("file://"))
//       fileUri = "file://" + fileUri;

//     const formData = new FormData();
//     formData.append("docType", docType);
//     formData.append("file", {
//       uri: fileUri,
//       type: file.mimeType || file.type || "application/pdf",
//       name: file.name || "kyc_document.pdf",
//     });

//     const res = await axios.post(
//       `${BASE_URL}/poster/profile/doc/upload`,
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
//     console.error(
//       "❌ uploadPosterKyc Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message:
//         err.response?.data?.message || err.message || "Failed to upload KYC",
//     };
//   }
// };

// export const getPosterKycHistory = async () => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("Poster not logged in");
//     const res = await axios.get(`${BASE_URL}/poster/profile/kyc/history`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ getPosterKycHistory Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to fetch KYC history",
//     };
//   }
// };

// export const deletePosterKyc = async (id) => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) throw new Error("Poster not logged in");
//     const res = await axios.delete(`${BASE_URL}/poster/profile/kyc/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ deletePosterKyc Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to delete KYC document",
//     };
//   }
// };

// // ==========================
// // Poster Phone OTP
// // ==========================
// export const sendPosterPhoneOtp = async () => {
//   try {
//     const res = await api.post("/poster/profile/phone/send-otp");
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ sendPosterPhoneOtp Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to send OTP",
//     };
//   }
// };

// export const verifyPosterPhoneOtp = async (sessionId, otp) => {
//   try {
//     const res = await api.post("/poster/profile/phone/verify", {
//       sessionId,
//       otp,
//     });
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ verifyPosterPhoneOtp Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "OTP verification failed",
//     };
//   }
// };

// // ==========================
// // Poster Jobs
// // ==========================
// export const createPosterJob = async (jobData) => {
//   try {
//     const payload = {
//       title: jobData.title,
//       description: jobData.description,
//       categoryCode: Number(jobData.categoryCode),
//       amountPaise: Number(jobData.amountPaise),
//       deadline: jobData.deadline || new Date().toISOString(),
//       addressId: Number(jobData.addressId),
//     };
//     return (await api.post("/poster/jobs/create", payload)).data;
//   } catch (err) {
//     console.error(
//       "❌ createPosterJob Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to create job",
//     };
//   }
// };

// export const getPosterJobs = async () => {
//   try {
//     return (await api.get("/poster/jobs/list")).data;
//   } catch (err) {
//     console.error("❌ getPosterJobs Error:", err.response?.data || err.message);
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to fetch jobs",
//     };
//   }
// };

// export const deletePosterJob = async (jobId) => {
//   try {
//     return (await api.delete(`/poster/jobs/delete/${jobId}`)).data;
//   } catch (err) {
//     console.error(
//       "❌ deletePosterJob Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to delete job",
//     };
//   }
// };

// export const fetchCategories = async () => {
//   try {
//     return (await api.get("/poster/jobs/all")).data;
//   } catch (err) {
//     console.error(
//       "❌ fetchCategories Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to fetch categories",
//     };
//   }
// };
// // Update a Poster job (partial updates supported)
// export const updatePosterJob = async (jobId, updateData) => {
//   try {
//     // jobId: integer, updateData: { title?, description?, categoryCode?, amountPaise?, deadLine?, addressId? }
//     const res = await api.patch(`/poster/jobs/update/${jobId}`, updateData);
//     return res.data; // Expecting { status, message, data }
//   } catch (err) {
//     console.error(
//       "❌ updatePosterJob Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to update job",
//     };
//   }
// };
// // ✅ Combined save function (auto add or update)
// export const savePosterAddress = async (address) => {
//   try {
//     if (address.id) {
//       // Update existing address
//       return await updateAddress(address.id, address);
//     } else {
//       // Create new address
//       return await addAddress(address);
//     }
//   } catch (err) {
//     console.error(
//       "❌ savePosterAddress Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to save address",
//     };
//   }
// };

// // ==========================
// // Logout Poster
// // ==========================
// export const logoutPoster = async () => {
//   try {
//     await AsyncStorage.multiRemove(["authToken", "posterProfile", "userRole"]);
//     return { status: "SUCCESS", message: "Logout successful" };
//   } catch (err) {
//     console.error("❌ logoutPoster Error:", err);
//     return { status: "ERROR", message: "Logout failed" };
//   }
// };

// export default api;

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.217.218:8080/api"
    : "http://192.168.217.218:8080/api";

// ----------------- Axios Instance -----------------
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Automatically attach JWT token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ----------------- Poster Profile APIs -----------------
export const fetchPosterProfile = async () => {
  try {
    const res = await api.get("/poster/profile/get");
    return res.data;
  } catch (err) {
    console.error(
      "❌ fetchPosterProfile Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to fetch profile",
    };
  }
};

export const updatePosterProfile = async (body) => {
  try {
    const res = await api.put("/poster/profile/", body);
    return res.data;
  } catch (err) {
    console.error(
      "❌ updatePosterProfile Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to update profile",
    };
  }
};

// ----------------- Address APIs -----------------
export const addAddress = async (address) => {
  try {
    const res = await api.post("/poster/profile/address", address);
    return res.data;
  } catch (err) {
    console.error("❌ addAddress Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to add address",
    };
  }
};

export const updateAddress = async (id, address) => {
  try {
    const res = await api.put(`/poster/profile/address/${id}`, address);
    return res.data;
  } catch (err) {
    console.error("❌ updateAddress Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to update address",
    };
  }
};

export const deleteAddress = async (id) => {
  try {
    const res = await api.delete(`/poster/profile/address/${id}`);
    return res.data;
  } catch (err) {
    console.error("❌ deleteAddress Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to delete address",
    };
  }
};

export const fetchPosterAddresses = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const res = await api.get("/poster/profile/address/get", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data?.status === "SUCCESS") return res.data;
    else return { status: "SUCCESS", data: [] };
  } catch (err) {
    //console.error("❌ fetchPosterAddresses Error:", err);
    //return { status: "ERROR", data: [], message: err.message };
  }
};

// Combined save: auto add or update
export const savePosterAddress = async (address) => {
  try {
    if (address.id) return await updateAddress(address.id, address);
    else return await addAddress(address);
  } catch (err) {
    console.error("❌ savePosterAddress Error:", err);
    return {
      status: "ERROR",
      message: err.message || "Failed to save address",
    };
  }
};

// ----------------- KYC APIs -----------------
export const uploadPosterKyc = async (docType, file) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("Poster not logged in");
    if (!file?.uri) throw new Error("No file selected");

    let fileUri = file.uri;
    if (Platform.OS === "android" && !fileUri.startsWith("file://"))
      fileUri = "file://" + fileUri;

    const formData = new FormData();
    formData.append("docType", docType);
    formData.append("file", {
      uri: fileUri,
      type: file.mimeType || file.type || "application/pdf",
      name: file.name || "kyc_document.pdf",
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
  } catch (err) {
    console.error(
      "❌ uploadPosterKyc Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message:
        err.response?.data?.message || err.message || "Failed to upload KYC",
    };
  }
};

export const getPosterKycHistory = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const res = await axios.get(`${BASE_URL}/poster/profile/kyc/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error(
      "❌ getPosterKycHistory Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to fetch KYC history",
    };
  }
};

export const deletePosterKyc = async (id) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const res = await axios.delete(`${BASE_URL}/poster/profile/kyc/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error(
      "❌ deletePosterKyc Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to delete KYC document",
    };
  }
};

// ----------------- Poster Phone OTP -----------------
export const sendPosterPhoneOtp = async () => {
  try {
    const res = await api.post("/poster/profile/phone/send-otp");
    return res.data;
  } catch (err) {
    console.error(
      "❌ sendPosterPhoneOtp Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to send OTP",
    };
  }
};

export const verifyPosterPhoneOtp = async (sessionId, otp) => {
  try {
    const res = await api.post("/poster/profile/phone/verify", {
      sessionId,
      otp,
    });
    return res.data;
  } catch (err) {
    console.error(
      "❌ verifyPosterPhoneOtp Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "OTP verification failed",
    };
  }
};

// ----------------- Poster Jobs -----------------
export const createPosterJob = async (jobData) => {
  try {
    // Validate and convert fields
    const amountInRs = parseInt(jobData.amountInRs, 10);
    if (isNaN(amountInRs) || amountInRs <= 0) {
      return { status: "ERROR", message: "Invalid amountInRs" };
    }

    const payload = {
      title: jobData.title?.trim(),
      description: jobData.description?.trim(),
      categoryCode: jobData.categoryCode, // send string if backend expects string
      amountInRs,
      deadline: jobData.deadline || new Date().toISOString(),
      addressId:
        jobData.jobType === "PHYSICAL" ? Number(jobData.addressId) : null,
      jobType: jobData.jobType || "PHYSICAL",
    };

    console.log("Payload to backend:", payload);

    const res = await api.post("/poster/jobs/create", payload);
    return res.data;
  } catch (err) {
    console.error(
      "❌ createPosterJob Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to create job",
    };
  }
};
export const getPosterJobs = async (
  page = 0,
  size = 10,
  status = "POSTED",
  sortFields = ["createdAt"],
  sortDirections = ["asc"]
) => {
  try {
    const res = await api.get("/poster/jobs/list", {
      params: { page, size, status, sortFields, sortDirections },
      headers: { Accept: "application/json" },
    });

    if (!res.data) {
      return { status: "ERROR", data: [], message: "No data returned from server" };
    }

    return {
      status: "SUCCESS",
      data: res.data.content || [],
      page: res.data.page,
      size: res.data.size,
      totalPages: res.data.totalPages,
      last: res.data.last,
      message: res.data.message,
      messageCode: res.data.messageCode,
    };
  } catch (err) {
    console.error("❌ getPosterJobs Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      data: [],
      message: err.response?.data?.message || err.message || "Failed to fetch poster jobs",
    };
  }
};


export const updatePosterJob = async (jobId, updateData) => {
  try {
    const res = await api.patch(`/poster/jobs/update/${jobId}`, updateData);
    return res.data;
  } catch (err) {
    console.error(
      "❌ updatePosterJob Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to update job",
    };
  }
};

export const deletePosterJob = async (jobId) => {
  try {
    const res = await api.delete(`/poster/jobs/delete/${jobId}`);
    return res.data;
  } catch (err) {
    console.error(
      "❌ deletePosterJob Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to delete job",
    };
  }
};

// ----------------- Categories -----------------
export const fetchCategories = async () => {
  try {
    const res = await api.get("/poster/jobs/categories");
    return res.data;
  } catch (err) {
    console.error(
      "❌ fetchCategories Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to fetch categories",
    };
  }
};

// ----------------- Logout -----------------
export const logoutPoster = async () => {
  try {
    await AsyncStorage.multiRemove(["authToken", "posterProfile", "userRole"]);
    return { status: "SUCCESS", message: "Logout successful" };
  } catch (err) {
    console.error("❌ logoutPoster Error:", err);
    return { status: "ERROR", message: "Logout failed" };
  }
};

export default api;
