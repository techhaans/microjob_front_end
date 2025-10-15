// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const BASE_URL = "http://192.168.45.218:8080/api";

// // 1️⃣ Send OTP
// export const sendOtp = async (email) => {
//   console.log("[API] Sending OTP to:", email);
//   try {
//     const res = await axios.post(`${BASE_URL}/auth/otp/doer-send`, { email });
//     console.log("[API] OTP Sent Response:", res.data);
//     await AsyncStorage.setItem("tempSessionId", res.data.data.sessionId);
//     return res.data;
//   } catch (err) {
//     console.log("[API] OTP Send Error:", err.response?.data || err.message);
//     return { status: "ERROR", message: err.response?.data?.message || "Failed to send OTP" };
//   }
// };

// // 2️⃣ Verify OTP
// export const verifyOtp = async (sessionId, otp) => {
//   console.log("[API] Verifying OTP:", otp, "for session:", sessionId);
//   try {
//     const res = await axios.post(`${BASE_URL}/auth/otp/verify-otp`, { sessionId, otp });
//     console.log("[API] OTP Verified Response:", res.data);
//     const tempToken = res.data?.data?.token;
//     if (tempToken) await AsyncStorage.setItem("tempToken", tempToken);
//     return res.data;
//   } catch (err) {
//     console.log("[API] OTP Verify Error:", err.response?.data || err.message);
//     return { status: "ERROR", message: err.response?.data?.message || "OTP verification failed" };
//   }
// };

// // 3️⃣ Select Role
// export const selectRole = async (role) => {
//   const tempToken = await AsyncStorage.getItem("tempToken");
//   console.log("[API] Selecting role:", role, "with tempToken:", tempToken);
//   if (!tempToken) return { status: "ERROR", message: "Temporary token missing" };

//   try {
//     const res = await axios.post(
//       `${BASE_URL}/auth/otp/select-role`,
//       { role },
//       { headers: { Authorization: `Bearer ${tempToken}` } }
//     );
//     console.log("[API] Role Selection Response:", res.data);

//     if (res.data?.data?.token) {
//       await AsyncStorage.setItem("authToken", res.data.data.token);
//       await AsyncStorage.setItem("userRole", role);
//       await AsyncStorage.removeItem("tempToken");
//     }

//     return res.data;
//   } catch (err) {
//     console.log("[API] Role Selection Error:", err.response?.data || err.message);
//     return { status: "ERROR", message: err.response?.data?.message || "Role selection failed" };
//   }
// };

// // 4️⃣ Fetch Doer Profile
// export const fetchDoerProfile = async () => {
//   const token = await AsyncStorage.getItem("authToken");
//   console.log("[API] Fetching Doer profile with token:", token);
//   try {
//     const res = await axios.get(`${BASE_URL}/doer/profile/get`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     console.log("[API] Doer Profile Response:", res.data);
//     return res.data;
//   } catch (err) {
//     console.log("[API] Doer Profile Error:", err.response?.data || err.message);
//     return { status: "ERROR", message: err.response?.data?.message || "Failed to fetch profile" };
//   }
// };

// // 5️⃣ Fetch Poster Profile
// export const fetchPosterProfile = async () => {
//   const token = await AsyncStorage.getItem("authToken");
//   console.log("[API] Fetching Poster profile with token:", token);
//   try {
//     const res = await axios.get(`${BASE_URL}/poster/profile/get`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     console.log("[API] Poster Profile Response:", res.data);
//     return res.data;
//   } catch (err) {
//     console.log("[API] Poster Profile Error:", err.response?.data || err.message);
//     return { status: "ERROR", message: err.response?.data?.message || "Failed to fetch profile" };
//   }
// };

// // 6️⃣ Logout
// export const logout = async () => {
//   console.log("[API] Logging out...");
//   await AsyncStorage.removeItem("authToken");
//   await AsyncStorage.removeItem("userRole");
//   await AsyncStorage.removeItem("tempToken");
//   await AsyncStorage.removeItem("tempSessionId");
// };
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const BASE_URL = "http://192.168.156.218:8080/api";

// /* -------------------------------------------------------------------------- */
// /* 1️⃣ Send OTP */
// /* -------------------------------------------------------------------------- */
// export const sendOtp = async (email) => {
//   console.log("[API] Sending OTP to:", email);
//   try {
//     const res = await axios.post(`${BASE_URL}/auth/otp/send`, { email }); // updated endpoint name
//     console.log("[API] OTP Sent Response:", res.data);
//     await AsyncStorage.setItem("tempSessionId", res.data.data.sessionId);
//     return res.data;
//   } catch (err) {
//     console.log("[API] OTP Send Error:", err.response?.data || err.message);
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to send OTP",
//     };
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 2️⃣ Verify OTP */
// /* -------------------------------------------------------------------------- */
// export const verifyOtp = async (sessionId, otp) => {
//   console.log("[API] Verifying OTP:", otp, "for session:", sessionId);
//   try {
//     const res = await axios.post(`${BASE_URL}/auth/otp/verify`, { sessionId, otp });
//     console.log("[API] OTP Verified Response:", res.data);

//     const tempAccessToken = res.data?.data?.accessToken;
//     if (tempAccessToken) {
//       await AsyncStorage.setItem("tempToken", tempAccessToken);
//     }

//     return res.data;
//   } catch (err) {
//     console.log("[API] OTP Verify Error:", err.response?.data || err.message);
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "OTP verification failed",
//     };
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 3️⃣ Select Role (returns Access + Refresh Tokens) */
// /* -------------------------------------------------------------------------- */
// export const selectRole = async (role) => {
//   const tempToken = await AsyncStorage.getItem("tempToken");
//   console.log("[API] Selecting role:", role, "with tempToken:", tempToken);
//   if (!tempToken) return { status: "ERROR", message: "Temporary token missing" };

//   try {
//     const res = await axios.post(
//       `${BASE_URL}/auth/otp/select-role`,
//       { role },
//       { headers: { Authorization: `Bearer ${tempToken}` } }
//     );
//     console.log("[API] Role Selection Response:", res.data);

//     const { accessToken, refreshToken } = res.data.data;

//     if (accessToken && refreshToken) {
//       await AsyncStorage.setItem("authToken", accessToken);
//       await AsyncStorage.setItem("refreshToken", refreshToken);
//       await AsyncStorage.setItem("userRole", role);
//       await AsyncStorage.removeItem("tempToken");
//     }

//     return res.data;
//   } catch (err) {
//     console.log("[API] Role Selection Error:", err.response?.data || err.message);
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Role selection failed",
//     };
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 4️⃣ Refresh Access Token */
// /* -------------------------------------------------------------------------- */
// export const refreshAccessToken = async () => {
//   const refreshToken = await AsyncStorage.getItem("refreshToken");
//   if (!refreshToken) {
//     console.log("[API] ❌ No refresh token found.");
//     return null;
//   }

//   try {
//     console.log("[API] Refreshing access token...");
//     const res = await axios.post(`${BASE_URL}/auth/otp/refresh`, { refreshToken });
//     const newAccessToken = res.data?.data?.accessToken;

//     if (newAccessToken) {
//       await AsyncStorage.setItem("authToken", newAccessToken);
//       console.log("[API] ✅ Access token refreshed.");
//       return newAccessToken;
//     } else {
//       console.log("[API] ⚠️ No access token received from refresh.");
//       return null;
//     }
//   } catch (err) {
//     console.log("[API] Refresh Token Error:", err.response?.data || err.message);
//     await logout(); // clear all tokens if refresh fails
//     return null;
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 5️⃣ Fetch Doer Profile (with auto-refresh if expired) */
// /* -------------------------------------------------------------------------- */
// export const fetchDoerProfile = async () => {
//   let token = await AsyncStorage.getItem("authToken");
//   console.log("[API] Fetching Doer profile with token:", token);

//   try {
//     const res = await axios.get(`${BASE_URL}/doer/profile/get`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     console.log("[API] Doer Profile Response:", res.data);
//     return res.data;
//   } catch (err) {
//     if (err.response?.status === 401) {
//       console.log("[API] Access token expired, refreshing...");
//       const newToken = await refreshAccessToken();
//       if (newToken) {
//         return fetchDoerProfile(); // retry
//       }
//     }
//     console.log("[API] Doer Profile Error:", err.response?.data || err.message);
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to fetch profile",
//     };
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 6️⃣ Fetch Poster Profile (with auto-refresh if expired) */
// /* -------------------------------------------------------------------------- */
// export const fetchPosterProfile = async () => {
//   let token = await AsyncStorage.getItem("authToken");
//   console.log("[API] Fetching Poster profile with token:", token);

//   try {
//     const res = await axios.get(`${BASE_URL}/poster/profile/get`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     console.log("[API] Poster Profile Response:", res.data);
//     return res.data;
//   } catch (err) {
//     if (err.response?.status === 401) {
//       console.log("[API] Access token expired, refreshing...");
//       const newToken = await refreshAccessToken();
//       if (newToken) {
//         return fetchPosterProfile(); // retry
//       }
//     }
//     console.log("[API] Poster Profile Error:", err.response?.data || err.message);
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to fetch profile",
//     };
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 7️⃣ Logout */
// /* -------------------------------------------------------------------------- */
// export const logout = async () => {
//   console.log("[API] Logging out...");
//   await AsyncStorage.multiRemove([
//     "authToken",
//     "refreshToken",
//     "userRole",
//     "tempToken",
//     "tempSessionId",
//   ]);
// };
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.156.218:8080/api";

/* -------------------------------------------------------------------------- */
/* 1️⃣ Send OTP */
/* -------------------------------------------------------------------------- */
export const sendOtp = async (email) => {
  console.log("[API] Sending OTP to:", email);
  try {
    const res = await axios.post(`${BASE_URL}/auth/otp/send`, { email });
    const sessionId = res.data.data?.sessionId;
    if (sessionId) await AsyncStorage.setItem("tempSessionId", sessionId);
    return res.data;
  } catch (err) {
    console.log("[API] OTP Send Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to send OTP",
    };
  }
};

/* -------------------------------------------------------------------------- */
/* 2️⃣ Verify OTP */
/* -------------------------------------------------------------------------- */
export const verifyOtp = async (sessionId, otp) => {
  console.log("[API] Verifying OTP:", otp, "for session:", sessionId);
  try {
    const res = await axios.post(`${BASE_URL}/auth/otp/verify`, { sessionId, otp });
    const tempToken = res.data?.data?.accessToken;
    if (tempToken) await AsyncStorage.setItem("tempToken", tempToken);
    return res.data;
  } catch (err) {
    console.log("[API] OTP Verify Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "OTP verification failed",
    };
  }
};

/* -------------------------------------------------------------------------- */
/* 3️⃣ Select Role */
/* -------------------------------------------------------------------------- */
export const selectRole = async (role) => {
  const tempToken = await AsyncStorage.getItem("tempToken");
  if (!tempToken)
    return { status: "ERROR", message: "Temporary token missing. Please re-login." };

  try {
    const res = await axios.post(
      `${BASE_URL}/auth/otp/select-role`,
      { role },
      { headers: { Authorization: `Bearer ${tempToken}` } }
    );

    const { accessToken, refreshToken } = res.data.data;
    if (accessToken && refreshToken) {
      await AsyncStorage.multiSet([
        ["authToken", accessToken],
        ["refreshToken", refreshToken],
        ["userRole", role],
      ]);
      await AsyncStorage.removeItem("tempToken");
    }

    return res.data;
  } catch (err) {
    console.log("[API] Role Selection Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Role selection failed",
    };
  }
};

/* -------------------------------------------------------------------------- */
/* 4️⃣ Refresh Token */
/* -------------------------------------------------------------------------- */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token available");

    const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
      refreshToken,
    });

    const newAccessToken = res.data?.data?.accessToken;
    if (newAccessToken) {
      await AsyncStorage.setItem("authToken", newAccessToken);
      console.log("[API] Access token refreshed successfully");
      return newAccessToken;
    } else {
      throw new Error("Invalid refresh response");
    }
  } catch (err) {
    console.log("[API] Refresh Token Error:", err.response?.data || err.message);
    await AsyncStorage.multiRemove(["authToken", "refreshToken"]);
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/* 5️⃣ Logout */
/* -------------------------------------------------------------------------- */
export const logout = async () => {
  console.log("[API] Logging out...");
  await AsyncStorage.multiRemove([
    "authToken",
    "refreshToken",
    "userRole",
    "tempToken",
    "tempSessionId",
  ]);
};
