// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const BASE_URL = "http://192.168.156.218:8080/api";

// // Axios instance
// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { "Content-Type": "application/json" },
// });

// // ----------------- SUPER ADMIN -----------------

// // Super Admin login
// export const loginSuperAdmin = async (email, password) => {
//   const res = await api.post("/auth/admin/login", { email, password });
//   if (res.status === 200 && res.data?.data?.token) {
//     await AsyncStorage.setItem("superAdminToken", res.data.data.token);
//   }
//   return res.data;
// };

// // Fetch pending admins
// export const fetchPendingAdmins = async () => {
//   const token = await AsyncStorage.getItem("superAdminToken");
//   return api.get("/superadmin/admins/pending", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

// // Approve admin
// export const approveAdmin = async (adminId) => {
//   const token = await AsyncStorage.getItem("superAdminToken");
//   return api.post(
//     `/superadmin/admin/${adminId}/approve`,
//     {},
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
// };

// // Reject admin
// export const rejectAdmin = async (adminId) => {
//   const token = await AsyncStorage.getItem("superAdminToken");
//   return api.post(
//     `/superadmin/admin/${adminId}/reject`,
//     {},
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
// };

// // Fetch all doers (super admin)
// export const fetchAllDoers = async (page = 0, size = 10) => {
//   const token = await AsyncStorage.getItem("superAdminToken");
//   return api.get(`/superadmin/doers?page=${page}&size=${size}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

// // ----------------- ADMIN -----------------

// // Admin registration (requires Super Admin token)
// export const registerAdmin = async (payload) => {
//   const superAdminToken = await AsyncStorage.getItem("superAdminToken");
//   if (!superAdminToken) throw new Error("Super Admin must login first");
//   return api.post("/auth/admin/register", payload, {
//     headers: { Authorization: `Bearer ${superAdminToken}` },
//   });
// };

// // Admin login
// export const loginAdmin = async (email, password) => {
//   const res = await api.post("/auth/admin/login", { email, password });
//   if (res.status === 200 && res.data?.data?.token) {
//     await AsyncStorage.setItem("adminToken", res.data.data.token);
//   }
//   return res.data;
// };

// // ----------------- ADMIN KYC -----------------

// // Fetch pending KYC
// export const fetchPendingKyc = async (
//   page = 0,
//   size = 20,
//   sort = ["createdAt,DESC"]
// ) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   const sortQuery = sort.map((s) => `sort=${s}`).join("&");
//   return api.get(`/admin/kyc/pending?page=${page}&size=${size}&${sortQuery}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

// // Approve KYC
// export const approveKyc = async (id) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   return api.post(
//     `/admin/kyc/approve/${id}`,
//     {},
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
// };

// // Reject KYC with optional reason
// export const rejectKyc = async (id, reason = "") => {
//   const token = await AsyncStorage.getItem("adminToken");
//   const url = reason
//     ? `/admin/kyc/reject/${id}?reason=${encodeURIComponent(reason)}`
//     : `/admin/kyc/reject/${id}`;
//   return api.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
// };

// // Download KYC file
// export const downloadKycFile = async (id) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   return api.get(`/admin/kyc/file/${id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//     responseType: "blob",
//   });
// };

// // Fetch all posters
// export const fetchAllPosters = async (
//   page = 0,
//   size = 10,
//   sort = ["createdAt,asc"]
// ) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   const sortQuery = sort.map((s) => `sort=${s}`).join("&");
//   return api.get(
//     `/admin/kyc/all_posters?page=${page}&size=${size}&${sortQuery}`,
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
// };

// // Fetch all doers (admin)
// export const fetchAllDoersAdmin = async (
//   page = 0,
//   size = 10,
//   sort = ["createdAt,asc"]
// ) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   const sortQuery = sort.map((s) => `sort=${s}`).join("&");
//   return api.get(
//     `/admin/kyc/all_doers?page=${page}&size=${size}&${sortQuery}`,
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
// };

// export default api;

// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const BASE_URL = "http://192.168.156.218:8080/api";

// // Axios instance
// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { "Content-Type": "application/json" },
// });

// // ----------------- SUPER ADMIN -----------------

// export const loginSuperAdmin = async (email, password) => {
//   const res = await api.post("/auth/admin/login", { email, password });
//   if (res.status === 200 && res.data?.data?.token) {
//     // Store both tokens
//     await AsyncStorage.setItem("superAdminToken", res.data.data.token);
//     await AsyncStorage.setItem(
//       "superAdminRefreshToken",
//       res.data.data.refreshToken
//     );
//   }
//   return res.data;
// };

// export const fetchPendingAdmins = async () => {
//   const token = await AsyncStorage.getItem("superAdminToken");
//   return api.get("/superadmin/admins/pending", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

// // ----------------- ADMIN -----------------

// export const loginAdmin = async (email, password) => {
//   try {
//     const res = await api.post("/auth/admin/login", { email, password });

//     if (res.status === 200 && res.data?.data?.token) {
//       // Store both tokens
//       await AsyncStorage.setItem("adminToken", res.data.data.token);
//       await AsyncStorage.setItem(
//         "adminRefreshToken",
//         res.data.data.refreshToken
//       );

//       console.log("Access Token:", res.data.data.token);
//       console.log("Refresh Token:", res.data.data.refreshToken);
//     }

//     return res.data;
//   } catch (err) {
//     console.error("Admin login error:", err.response?.data || err.message);
//     throw err;
//   }
// };

// // Admin registration (requires Super Admin token)
// export const registerAdmin = async (payload) => {
//   const superAdminToken = await AsyncStorage.getItem("superAdminToken");
//   if (!superAdminToken) throw new Error("Super Admin must login first");
//   return api.post("/auth/admin/register", payload, {
//     headers: { Authorization: `Bearer ${superAdminToken}` },
//   });
// };

// // ----------------- ADMIN KYC -----------------

// export const fetchPendingKyc = async (
//   page = 0,
//   size = 20,
//   sort = ["createdAt,DESC"]
// ) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   const sortQuery = sort.map((s) => `sort=${s}`).join("&");
//   return api.get(`/admin/kyc/pending?page=${page}&size=${size}&${sortQuery}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

// export const approveKyc = async (id) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   return api.post(
//     `/admin/kyc/approve/${id}`,
//     {},
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
// };

// export const rejectKyc = async (id, reason = "") => {
//   const token = await AsyncStorage.getItem("adminToken");
//   const url = reason
//     ? `/admin/kyc/reject/${id}?reason=${encodeURIComponent(reason)}`
//     : `/admin/kyc/reject/${id}`;
//   return api.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
// };

// export const downloadKycFile = async (id) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   return api.get(`/admin/kyc/file/${id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//     responseType: "blob",
//   });
// };

// export const fetchAllPosters = async (
//   page = 0,
//   size = 10,
//   sort = ["createdAt,asc"]
// ) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   const sortQuery = sort.map((s) => `sort=${s}`).join("&");
//   return api.get(
//     `/admin/kyc/all_posters?page=${page}&size=${size}&${sortQuery}`,
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
// };

// export const fetchAllDoersAdmin = async (
//   page = 0,
//   size = 10,
//   sort = ["createdAt,asc"]
// ) => {
//   const token = await AsyncStorage.getItem("adminToken");
//   const sortQuery = sort.map((s) => `sort=${s}`).join("&");
//   return api.get(
//     `/admin/kyc/all_doers?page=${page}&size=${size}&${sortQuery}`,
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
// };

// export default api;

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.156.218:8080/api";

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});
/**
 * Unified login for Admin and Super Admin
 * @returns { token, refreshToken, role }
 */
export const loginUser = async (email, password) => {
  try {
    const res = await api.post("/auth/admin/login", { email, password });

    if (res.status === 200 && res.data?.data?.token) {
      const { token, refreshToken, role } = res.data.data;

      // Validate role
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        throw new Error(`Invalid role received: ${role}`);
      }

      // Store tokens based on role
      if (role === "SUPER_ADMIN") {
        await AsyncStorage.setItem("superAdminToken", token);
        await AsyncStorage.setItem("superAdminRefreshToken", refreshToken);
      } else if (role === "ADMIN") {
        await AsyncStorage.setItem("adminToken", token);
        await AsyncStorage.setItem("adminRefreshToken", refreshToken);
      }

      console.log(`${role} logged in`);
      return { token, refreshToken, role };
    }

    throw new Error(res.data?.message || "Login failed");
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    throw err;
  }
};

// ----------------- ADMIN & SUPER ADMIN FETCH -----------------

/**
 * Get token based on role: admin or super admin
 */
const getToken = async () => {
  return (
    (await AsyncStorage.getItem("adminToken")) ||
    (await AsyncStorage.getItem("superAdminToken"))
  );
};

// Fetch all Doers (Admin or Super Admin)
export const fetchAllDoers = async (
  page = 0,
  size = 10,
  sort = ["createdAt,asc"]
) => {
  const token = await getToken();
  const sortQuery = sort.map((s) => `sort=${s}`).join("&");
  return api.get(
    `/admin/kyc/all_doers?page=${page}&size=${size}&${sortQuery}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Fetch all Posters (Admin or Super Admin)
export const fetchAllPosters = async (
  page = 0,
  size = 10,
  sort = ["createdAt,asc"]
) => {
  const token = await getToken();
  const sortQuery = sort.map((s) => `sort=${s}`).join("&");
  return api.get(
    `/admin/kyc/all_posters?page=${page}&size=${size}&${sortQuery}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Fetch pending KYC (Admin only)
export const fetchPendingKyc = async (
  page = 0,
  size = 20,
  sort = ["createdAt,DESC"]
) => {
  const token = await AsyncStorage.getItem("adminToken");
  const sortQuery = sort.map((s) => `sort=${s}`).join("&");
  return api.get(`/admin/kyc/pending?page=${page}&size=${size}&${sortQuery}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ----------------- KYC ACTIONS -----------------

export const approveKyc = async (id) => {
  const token = await AsyncStorage.getItem("adminToken");
  return api.post(
    `/admin/kyc/approve/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const rejectKyc = async (id, reason = "") => {
  const token = await AsyncStorage.getItem("adminToken");
  const url = reason
    ? `/admin/kyc/reject/${id}?reason=${encodeURIComponent(reason)}`
    : `/admin/kyc/reject/${id}`;
  return api.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
};

export const downloadKycFile = async (id) => {
  const token = await AsyncStorage.getItem("adminToken");
  return api.get(`/admin/kyc/file/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
};

// ----------------- ADMIN MANAGEMENT -----------------

export const registerAdmin = async (payload) => {
  const superAdminToken = await AsyncStorage.getItem("superAdminToken");
  if (!superAdminToken) throw new Error("Super Admin must login first");
  return api.post("/auth/admin/register", payload, {
    headers: { Authorization: `Bearer ${superAdminToken}` },
  });
};

export const fetchPendingAdmins = async () => {
  const token = await AsyncStorage.getItem("superAdminToken");
  return api.get("/superadmin/admins/pending", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default api;
