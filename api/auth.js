// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const BASE_URL = "http://192.168.156.218:8080/api/auth/otp";

// /* -------------------- Send OTP -------------------- */
// export const sendOtp = async (email) => {
//   try {
//     const res = await axios.post(`${BASE_URL}/send`, { email });
//     const sessionId = res.data.data?.sessionId;
//     if (sessionId) await AsyncStorage.setItem("tempSessionId", sessionId);
//     return res.data;
//   } catch (err) {
//     return { status: "ERROR", message: err.response?.data?.message || "Failed to send OTP" };
//   }
// };

// /* -------------------- Verify OTP -------------------- */
// export const verifyOtp = async (otp) => {
//   try {
//     const sessionId = await AsyncStorage.getItem("tempSessionId");
//     if (!sessionId) throw new Error("Session ID missing. Please resend OTP.");

//     const res = await axios.post(`${BASE_URL}/verify`, { sessionId, otp });
//     const tempToken = res.data.data?.accessToken;

//     if (tempToken) await AsyncStorage.setItem("tempToken", tempToken);
//     return { status: res.data.status, message: res.data.message, tempToken };
//   } catch (err) {
//     return { status: "ERROR", message: err.response?.data?.message || err.message || "OTP verification failed" };
//   }
// };

// /* -------------------- Select Role -------------------- */
// export const selectRole = async (role) => {
//   try {
//     const tempToken = await AsyncStorage.getItem("tempToken");
//     if (!tempToken) throw new Error("Temporary token missing. Please re-login.");

//     const res = await axios.post(
//       `${BASE_URL}/select-role`,
//       { role },
//       { headers: { Authorization: `Bearer ${tempToken}` } }
//     );

//     const { accessToken, refreshToken } = res.data.data;
//     if (accessToken && refreshToken) {
//       // Save permanent tokens
//       await AsyncStorage.multiSet([
//         ["authToken", accessToken],
//         ["refreshToken", refreshToken],
//         ["userRole", role],
//       ]);
//       // Remove temp token and sessionId
//       await AsyncStorage.removeItem("tempToken");
//       await AsyncStorage.removeItem("tempSessionId");
//     }

//     return res.data;
//   } catch (err) {
//     return { status: "ERROR", message: err.response?.data?.message || err.message || "Role selection failed" };
//   }
// };

// /* -------------------- Logout -------------------- */
// export const logout = async () => {
//   await AsyncStorage.multiRemove(["authToken", "refreshToken", "userRole", "tempToken", "tempSessionId"]);
// };
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const BASE_URL = "http://192.168.156.218:8080/api/auth/otp"; // Replace with your backend URL

// // -------------------- SEND OTP --------------------
// export const sendOtp = async (email) => {
//   try {
//     const res = await axios.post(`${BASE_URL}/send`, { email });
//     const { sessionId } = res.data?.data || {};

//     if (sessionId) {
//       await AsyncStorage.setItem("sessionId", sessionId);
//     }

//     return res.data;
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     return {
//       status: "ERROR",
//       message: error.response?.data?.message || "Failed to send OTP",
//     };
//   }
// };

// // -------------------- VERIFY OTP --------------------
// export const verifyOtp = async (otp) => {
//   try {
//     const sessionId = await AsyncStorage.getItem("sessionId");
//     if (!sessionId) throw new Error("Session ID missing. Please resend OTP.");

//     const res = await axios.post(`${BASE_URL}/verify`, { sessionId, otp });

//     const tempToken = res.data?.data?.tempToken;
//     if (tempToken) {
//       await AsyncStorage.setItem("tempToken", tempToken);
//     }

//     return res.data;
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     return {
//       status: "ERROR",
//       message: error.response?.data?.message || "Failed to verify OTP",
//     };
//   }
// };

// // -------------------- SELECT ROLE --------------------
// export const selectRole = async (role) => {
//   try {
//     const tempToken = await AsyncStorage.getItem("tempToken");
//     if (!tempToken)
//       throw new Error("Temporary token missing. Please re-login.");

//     const res = await axios.post(
//       `${BASE_URL}/select-role`,
//       { role },
//       { headers: { Authorization: `Bearer ${tempToken}` } }
//     );

//     const { accessToken, refreshToken } = res.data?.data || {};
//     if (accessToken && refreshToken) {
//       await AsyncStorage.multiSet([
//         ["authToken", accessToken],
//         ["refreshToken", refreshToken],
//         ["userRole", role],
//       ]);
//       await AsyncStorage.removeItem("tempToken");
//     }

//     return res.data;
//   } catch (error) {
//     console.error("Error selecting role:", error);
//     return {
//       status: "ERROR",
//       message: error.response?.data?.message || "Failed to select role",
//     };
//   }
// };

// // -------------------- REFRESH TOKEN --------------------
// export const refreshAccessToken = async () => {
//   try {
//     const refreshToken = await AsyncStorage.getItem("refreshToken");
//     if (!refreshToken) throw new Error("No refresh token found.");

//     const res = await axios.post(`${BASE_URL}/refresh`, { refreshToken });
//     const { accessToken } = res.data?.data || {};

//     if (accessToken) {
//       await AsyncStorage.setItem("authToken", accessToken);
//     }

//     return res.data;
//   } catch (error) {
//     console.error("Error refreshing token:", error);
//     return {
//       status: "ERROR",
//       message: error.response?.data?.message || "Failed to refresh token",
//     };
//   }
// };










// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const BASE_URL = "http://192.168.156.218:8080/api/auth/otp"; // ✅ Backend OTP APIs

// // 1️⃣ Send OTP
// export const sendOtp = async (email) => {
//   try {
//     const res = await axios.post(`${BASE_URL}/send`, { email });
//     const sessionId = res.data?.data?.sessionId;

//     if (sessionId) {
//       await AsyncStorage.setItem("sessionId", sessionId);
//     }

//     return res.data;
//   } catch (error) {
//     console.error("[API] Send OTP Error:", error?.response?.data || error);
//     return { status: "ERROR", message: "Failed to send OTP" };
//   }
// };

// // 2️⃣ Verify OTP
// export const verifyOtp = async (otp) => {
//   try {
//     const sessionId = await AsyncStorage.getItem("sessionId");
//     if (!sessionId) throw new Error("Session ID missing. Please resend OTP.");

//     const res = await axios.post(`${BASE_URL}/verify`, { otp, sessionId });
//     const tempToken = res.data?.data?.tempToken;

//     if (tempToken) {
//       await AsyncStorage.setItem("tempToken", tempToken); // ✅ Save temp token for role selection
//     }

//     return res.data;
//   } catch (error) {
//     console.error("[API] Verify OTP Error:", error?.response?.data || error);
//     return {
//       status: "ERROR",
//       message: error.response?.data?.message || error.message || "Failed to verify OTP",
//     };
//   }
// };

// // 3️⃣ Select Role
// export const selectRole = async (role) => {
//   try {
//     const tempToken = await AsyncStorage.getItem("tempToken");
//     if (!tempToken) throw new Error("Temporary token missing. Please re-login.");

//     const res = await axios.post(
//       `${BASE_URL}/select-role`,
//       { role },
//       { headers: { Authorization: `Bearer ${tempToken}` } }
//     );

//     const { accessToken, refreshToken } = res.data?.data || {};
//     if (accessToken && refreshToken) {
//       // ✅ Save permanent tokens
//       await AsyncStorage.multiSet([
//         ["accessToken", accessToken],
//         ["refreshToken", refreshToken],
//         ["userRole", role],
//       ]);
//       await AsyncStorage.removeItem("tempToken"); // ✅ Remove temp token
//     }

//     return res.data;
//   } catch (error) {
//     console.error("[API] Select Role Error:", error?.response?.data || error);
//     return {
//       status: "ERROR",
//       message: error.response?.data?.message || error.message || "Failed to select role",
//     };
//   }
// };

// // 4️⃣ Refresh Access Token
// export const refreshAccessToken = async () => {
//   try {
//     const refreshToken = await AsyncStorage.getItem("refreshToken");
//     if (!refreshToken) throw new Error("Refresh token missing. Please login again.");

//     const res = await axios.post(`${BASE_URL}/refresh`, { refreshToken });
//     const newAccessToken = res.data?.data?.accessToken;

//     if (newAccessToken) {
//       await AsyncStorage.setItem("accessToken", newAccessToken);
//       console.log("[TOKEN] Access token refreshed");
//     }

//     return res.data;
//   } catch (error) {
//     console.error("[API] Refresh Token Error:", error?.response?.data || error);
//     return { status: "ERROR", message: error.message || "Failed to refresh access token" };
//   }
// };
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const BASE_URL = "http://192.168.156.218:8080/api/auth/otp";

// // 1️⃣ Send OTP
// export const sendOtp = async (email) => {
//   try {
//     const res = await axios.post(`${BASE_URL}/send`, { email });
//     const sessionId = res.data?.data?.sessionId;

//     if (sessionId) {
//       await AsyncStorage.setItem("sessionId", sessionId);
//     }

//     return res.data;
//   } catch (error) {
//     console.error("Send OTP Error:", error);
//     return { status: "ERROR", message: "Failed to send OTP" };
//   }
// };

// // 2️⃣ Verify OTP
// export const verifyOtp = async (otp) => {
//   try {
//     const sessionId = await AsyncStorage.getItem("sessionId");
//     if (!sessionId) throw new Error("Session ID missing. Please resend OTP.");

//     const res = await axios.post(`${BASE_URL}/verify`, { sessionId, otp });
//     const tempToken = res.data?.data?.accessToken; // save as tempToken

//     if (tempToken) {
//       await AsyncStorage.setItem("tempToken", tempToken);
//     }

//     return res.data;
//   } catch (error) {
//     console.error("Verify OTP Error:", error);
//     return {
//       status: "ERROR",
//       message: error.response?.data?.message || "Failed to verify OTP",
//     };
//   }
// };

// // 3️⃣ Select Role
// export const selectRole = async (role) => {
//   try {
//     const tempToken = await AsyncStorage.getItem("tempToken");
//     if (!tempToken) throw new Error("Temporary token missing. Please re-login.");

//     const res = await axios.post(
//       `${BASE_URL}/select-role`,
//       { role },
//       { headers: { Authorization: `Bearer ${tempToken}` } }
//     );

//     const { accessToken, refreshToken } = res.data?.data || {};
//     if (accessToken && refreshToken) {
//       await AsyncStorage.multiSet([
//         ["accessToken", accessToken],
//         ["refreshToken", refreshToken],
//         ["userRole", role],
//       ]);

//       await AsyncStorage.removeItem("tempToken"); // remove tempToken after role selected
//     }

//     return res.data;
//   } catch (error) {
//     console.error("Select Role Error:", error);
//     return {
//       status: "ERROR",
//       message: error.response?.data?.message || "Failed to select role",
//     };
//   }
// };



import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ============================================================
// 🌐 Base URL
// ============================================================
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.156.218:8080/api"
    : "http://192.168.156.218:8080/api";

// ============================================================
// 🧩 Axios instance
// ============================================================
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Automatically attach stored token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ============================================================
// 🔐 OTP FLOW (Send / Verify / Role Select)
// ============================================================

export const sendOtp = async (email) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/otp/send`, { email });
    const sessionId = res.data?.data?.sessionId;
    if (sessionId) await AsyncStorage.setItem("sessionId", sessionId);
    return res.data;
  } catch (error) {
    console.error("Send OTP Error:", error);
    return { status: "ERROR", message: "Failed to send OTP" };
  }
};

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
    console.error("Verify OTP Error:", error);
    return {
      status: "ERROR",
      message: error.response?.data?.message || "Failed to verify OTP",
    };
  }
};

export const selectRole = async (role) => {
  try {
    const tempToken = await AsyncStorage.getItem("tempToken");
    if (!tempToken) throw new Error("Temporary token missing. Please re-login.");

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
export const fetchDoerProfile = async () => (await api.get("/doer/profile/get")).data;

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
};

// ============================================================
// 📦 POSTER APIs
// ============================================================
export const fetchPosterProfile = async () =>
  (await api.get("/poster/profile/get")).data;

export const updatePosterProfile = async (payload) =>
  (await api.put("/poster/profile/", payload)).data;

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

export const getPosterJobs = async () => (await api.get("/poster/jobs/list")).data;

// ============================================================
// 🚪 LOGOUT
// ============================================================
export const logout = async () => {
  await AsyncStorage.multiRemove([
    "accessToken",
    "refreshToken",
    "userRole",
    "sessionId",
  ]);
  return { status: "SUCCESS", message: "Logged out successfully" };
};

export default api;
