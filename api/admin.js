// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const BASE_URL = "http://192.168.60.218:8080/api";

// // Axios instance
// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { "Content-Type": "application/json" },
// });

// // ----------------- SUPER ADMIN -----------------

// export const loginSuperAdmin = async (email, password) => {
//   const res = await api.post("/auth/admin/login", { email, password });
//   if (res.status === 200) {
//     await AsyncStorage.setItem("superAdminToken", res.data.data.token);
//   }
//   return res.data;
// };

// export const fetchPendingAdmins = async () => {
//   const token = await AsyncStorage.getItem("superAdminToken");
//   return api.get("/superadmin/admins/pending", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

// export const approveAdmin = async (adminId) => {
//   const token = await AsyncStorage.getItem("superAdminToken");
//   return api.post(
//     `/superadmin/admin/${adminId}/approve`,
//     {},
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
// };

// export const rejectAdmin = async (adminId) => {
//   const token = await AsyncStorage.getItem("superAdminToken");
//   return api.post(
//     `/superadmin/admin/${adminId}/reject`,
//     {},
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
// };

// export const fetchAllDoers = async () => {
//   const token = await AsyncStorage.getItem("superAdminToken");
//   return api.get("/superadmin/doers", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

// // ----------------- ADMIN -----------------

// // ✅ Admin registration requires Super Admin token
// export const registerAdmin = async (payload) => {
//   const superAdminToken = await AsyncStorage.getItem("superAdminToken");
//   if (!superAdminToken) throw new Error("Super Admin must login first");
//   return api.post("/auth/admin/register", payload, {
//     headers: { Authorization: `Bearer ${superAdminToken}` },
//   });
// };

// // ✅ Admin login works independently
// export const loginAdmin = async (email, password) => {
//   const res = await api.post("/auth/admin/login", { email, password });
//   if (res.status === 200) {
//     await AsyncStorage.setItem("adminToken", res.data.data.token);
//   }
//   return res.data;
// };

// // ----------------- ADMIN KYC -----------------

// export const fetchPendingKyc = async () => {
//   const token = await AsyncStorage.getItem("adminToken");
//   return api.get("/admin/kyc/pending", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

// export const approveKyc = async (id) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   return api.post(
//     `/admin/kyc/${id}/approve`,
//     {},
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
// };

// export const rejectKyc = async (id) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   return api.post(
//     `/admin/kyc/${id}/reject`,
//     {},
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
// };

// export const downloadKycFile = async (id) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   return api.get(`/admin/kyc/file/${id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//     responseType: "blob",
//   });
// };

// export default api;

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.156.218:8080/api";

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// --------------------------------------------------
// 🔹 Interceptor for Auto Token Refresh
// --------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// --------------------------------------------------
// 🔹 1. Send OTP
// --------------------------------------------------
export const sendOtp = async (email) => {
  console.log("[API] Sending OTP to:", email);
  const res = await api.post("/auth/otp/send", { email });
  console.log("[API RESPONSE] sendOtp:", res.data);
  return res.data;
};

// --------------------------------------------------
// 🔹 2. Verify OTP
// --------------------------------------------------
export const verifyOtp = async (sessionId, otp) => {
  console.log("[API] Verifying OTP:", otp, "for session:", sessionId);
  const res = await api.post("/auth/otp/verify", { sessionId, otp });

  if (res.data?.data?.accessToken) {
    await AsyncStorage.setItem("accessToken", res.data.data.accessToken);
  }
  if (res.data?.data?.refreshToken) {
    await AsyncStorage.setItem("refreshToken", res.data.data.refreshToken);
  }

  console.log("[API RESPONSE] verifyOtp:", res.data);
  return res.data;
};

// --------------------------------------------------
// 🔹 3. Select Role (Doer / Poster)
// --------------------------------------------------
export const selectRole = async (role) => {
  const token = await AsyncStorage.getItem("accessToken");
  console.log("[API] Selecting Role:", role);

  const res = await api.post(
    "/auth/role/select",
    { role },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log("[API RESPONSE] selectRole:", res.data);
  return res.data;
};

// --------------------------------------------------
// 🔹 4. Refresh Access Token
// --------------------------------------------------
export const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.log("[API] No refresh token found, cannot refresh access token.");
    return null;
  }

  try {
    console.log("[API] Refreshing Access Token...");
    const res = await api.post("/auth/refresh", { refreshToken });

    if (res.data?.data?.accessToken) {
      await AsyncStorage.setItem("accessToken", res.data.data.accessToken);
      console.log("[API] Access token refreshed successfully.");
      return res.data.data.accessToken;
    }
  } catch (err) {
    console.log("[API] Refresh token failed:", err.message);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
  }

  return null;
};

// --------------------------------------------------
// 🔹 5. Logout (optional utility)
// --------------------------------------------------
export const logout = async () => {
  await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
  console.log("[API] Logged out and cleared tokens");
};

export default api;
