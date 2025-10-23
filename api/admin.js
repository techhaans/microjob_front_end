// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const BASE_URL = "http://192.168.156.218:8080/api";

// // Axios instance
// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { "Content-Type": "application/json" },
// });
// /**
//  * Unified login for Admin and Super Admin
//  * @returns { token, refreshToken, role }
//  */
// export const loginUser = async (email, password) => {
//   try {
//     const res = await api.post("/auth/admin/login", { email, password });

//     if (res.status === 200 && res.data?.data?.token) {
//       const { token, refreshToken, role } = res.data.data;

//       // Validate role
//       if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
//         throw new Error(`Invalid role received: ${role}`);
//       }

//       // Store tokens based on role
//       if (role === "SUPER_ADMIN") {
//         await AsyncStorage.setItem("superAdminToken", token);
//         await AsyncStorage.setItem("superAdminRefreshToken", refreshToken);
//       } else if (role === "ADMIN") {
//         await AsyncStorage.setItem("adminToken", token);
//         await AsyncStorage.setItem("adminRefreshToken", refreshToken);
//       }

//       console.log(`${role} logged in`);
//       return { token, refreshToken, role };
//     }

//     throw new Error(res.data?.message || "Login failed");
//   } catch (err) {
//     console.error("Login error:", err.response?.data || err.message);
//     throw err;
//   }
// };

// // ----------------- ADMIN & SUPER ADMIN FETCH -----------------

// /**
//  * Get token based on role: admin or super admin
//  */
// const getToken = async () => {
//   return (
//     (await AsyncStorage.getItem("adminToken")) ||
//     (await AsyncStorage.getItem("superAdminToken"))
//   );
// };

// // Fetch all Doers (Admin or Super Admin)
// export const fetchAllDoers = async (
//   page = 0,
//   size = 10,
//   sort = ["createdAt,asc"]
// ) => {
//   const token = await getToken();
//   const sortQuery = sort.map((s) => `sort=${s}`).join("&");
//   return api.get(
//     `/admin/kyc/all_doers?page=${page}&size=${size}&${sortQuery}`,
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
// };

// // Fetch all Posters (Admin or Super Admin)
// export const fetchAllPosters = async (
//   page = 0,
//   size = 10,
//   sort = ["createdAt,asc"]
// ) => {
//   const token = await getToken();
//   const sortQuery = sort.map((s) => `sort=${s}`).join("&");
//   return api.get(
//     `/admin/kyc/all_posters?page=${page}&size=${size}&${sortQuery}`,
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
// };

// // Fetch pending KYC (Admin only)
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

// // ----------------- KYC ACTIONS -----------------

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

// // ----------------- ADMIN MANAGEMENT -----------------

// export const registerAdmin = async (payload) => {
//   const superAdminToken = await AsyncStorage.getItem("superAdminToken");
//   if (!superAdminToken) throw new Error("Super Admin must login first");
//   return api.post("/auth/admin/register", payload, {
//     headers: { Authorization: `Bearer ${superAdminToken}` },
//   });
// };

// export const fetchPendingAdmins = async () => {
//   const token = await AsyncStorage.getItem("superAdminToken");
//   return api.get("/superadmin/admins/pending", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
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
 */
export const loginUser = async (email, password) => {
  try {
    const res = await api.post("/auth/admin/login", { email, password });

    if (res.status === 200 && res.data?.data?.token) {
      const { token, refreshToken, role } = res.data.data;

      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        throw new Error(`Invalid role received: ${role}`);
      }

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

// ----------------- TOKEN HANDLER -----------------

const getToken = async () => {
  return (
    (await AsyncStorage.getItem("adminToken")) ||
    (await AsyncStorage.getItem("superAdminToken"))
  );
};

// ----------------- KYC MANAGEMENT -----------------

export const fetchAllDoers = async (
  page = 0,
  size = 10,
  sort = ["createdAt,asc"]
) => {
  const token = await getToken();
  const sortQuery = sort.map((s) => `sort=${s}`).join("&");
  return api.get(
    `/admin/kyc/all_doers?page=${page}&size=${size}&${sortQuery}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const fetchAllPosters = async (
  page = 0,
  size = 10,
  sort = ["createdAt,asc"]
) => {
  const token = await getToken();
  const sortQuery = sort.map((s) => `sort=${s}`).join("&");
  return api.get(
    `/admin/kyc/all_posters?page=${page}&size=${size}&${sortQuery}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

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

// ----------------- CATEGORY MANAGEMENT (NEW) -----------------
/**
 * Create new category (Admin or Super Admin)
 */

export const fetchAllCategories = async () => {
  const token = await getToken();
  return api.get("/admin/categories/all", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/** Create new category */
export const createCategory = async (payload) => {
  const token = await getToken();
  return api.post("/admin/categories", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/** Update existing category by ID (primary key) */
export const updateCategory = async (id, payload) => {
  const token = await getToken();
  return api.put(`/admin/categories/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/** Delete category by ID (primary key) */
export const deleteCategory = async (id) => {
  const token = await getToken();
  return api.delete(`/admin/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
/**
 * Fetch all categories
 */

export default api;
