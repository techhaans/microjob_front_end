import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ----------------- CONFIG -----------------
const BASE_URL = "http://192.168.1.6:8080/api"; // Change to your backend IP if needed

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ----------------- DOER APIS -----------------

// Request OTP
export const requestOtp = async (phone) => {
  const formattedPhone = phone.startsWith("+") ? phone : "+91" + phone;
  return api.post("/auth/doer/login", { phone: formattedPhone });
};

// Verify OTP
export const verifyOtp = async (phone, otp, sessionId) => {
  const formattedPhone = phone.startsWith("+") ? phone : "+91" + phone;
  return api.post("/auth/doer/verify-otp", {
    phone: formattedPhone,
    otp,
    sessionId,
  });
};

// Register Doer
export const registerDoer = async (payload) =>
  api.post("/auth/doer/register", payload);

// Fetch Doer Profile
export const fetchProfile = async () => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) throw new Error("Doer token missing");

  const res = await api.get("/doer/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Ensure KYC fields are included
  const profileData = res.data.data;

  // Map backend fields to frontend-friendly ones
  profileData.kycStatus = profileData.verificationStatus || "PENDING";
  profileData.rejectionReason = profileData.rejectionReason || null;

  return { data: { data: profileData } };
};

// Upload KYC for Doer
export const uploadKYC = async (formData, docType = "PAN") => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) throw new Error("Doer token missing");

  return api.post(`/doer/doc/upload?docType=${docType}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

// ----------------- SUPER ADMIN APIS -----------------

// Login Super Admin
export const loginSuperAdmin = async (email, password) => {
  const res = await api.post("/auth/superadmin/login", { email, password });
  if (res.status === 200 && res.data?.data?.token) {
    await AsyncStorage.setItem("superAdminToken", res.data.data.token);
  }
  return res.data;
};

// Fetch pending admin registrations
export const fetchPendingAdmins = async () => {
  const token = await AsyncStorage.getItem("superAdminToken");
  if (!token) throw new Error("Super Admin token missing");

  const res = await api.get("/superadmin/admins/pending", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || [];
};

// Approve Admin
export const approveAdmin = async (adminId) => {
  const token = await AsyncStorage.getItem("superAdminToken");
  return api.post(
    `/superadmin/admin/${adminId}/approve`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Reject Admin
export const rejectAdmin = async (adminId, reason) => {
  const token = await AsyncStorage.getItem("superAdminToken");
  return api.post(
    `/superadmin/admin/${adminId}/reject`,
    { reason }, // send rejection reason
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Fetch all Doers (for Super Admin)
export const fetchAllDoers = async () => {
  const token = await AsyncStorage.getItem("superAdminToken");
  if (!token) throw new Error("Super Admin token missing");

  const res = await api.get("/superadmin/doers", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || [];
};

// ----------------- EXPORT -----------------
export default api;
