import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.6:8080/api";

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ----------------- SUPER ADMIN -----------------

export const loginSuperAdmin = async (email, password) => {
  const res = await api.post("/auth/admin/login", { email, password });
  if (res.status === 200) {
    await AsyncStorage.setItem("superAdminToken", res.data.data.token);
  }
  return res.data;
};

export const fetchPendingAdmins = async () => {
  const token = await AsyncStorage.getItem("superAdminToken");
  return api.get("/superadmin/admins/pending", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const approveAdmin = async (adminId) => {
  const token = await AsyncStorage.getItem("superAdminToken");
  return api.post(
    `/superadmin/admin/${adminId}/approve`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const rejectAdmin = async (adminId) => {
  const token = await AsyncStorage.getItem("superAdminToken");
  return api.post(
    `/superadmin/admin/${adminId}/reject`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const fetchAllDoers = async () => {
  const token = await AsyncStorage.getItem("superAdminToken");
  return api.get("/superadmin/doers", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ----------------- ADMIN -----------------

// ✅ Admin registration requires Super Admin token
export const registerAdmin = async (payload) => {
  const superAdminToken = await AsyncStorage.getItem("superAdminToken");
  if (!superAdminToken) throw new Error("Super Admin must login first");
  return api.post("/auth/admin/register", payload, {
    headers: { Authorization: `Bearer ${superAdminToken}` },
  });
};

// ✅ Admin login works independently
export const loginAdmin = async (email, password) => {
  const res = await api.post("/auth/admin/login", { email, password });
  if (res.status === 200) {
    await AsyncStorage.setItem("adminToken", res.data.data.token);
  }
  return res.data;
};

// ----------------- ADMIN KYC -----------------

export const fetchPendingKyc = async () => {
  const token = await AsyncStorage.getItem("adminToken");
  return api.get("/admin/kyc/pending", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const approveKyc = async (id) => {
  const token = await AsyncStorage.getItem("adminToken");
  return api.post(
    `/admin/kyc/${id}/approve`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const rejectKyc = async (id) => {
  const token = await AsyncStorage.getItem("adminToken");
  return api.post(
    `/admin/kyc/${id}/reject`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const downloadKycFile = async (id) => {
  const token = await AsyncStorage.getItem("adminToken");
  return api.get(`/admin/kyc/file/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
};

export default api;
