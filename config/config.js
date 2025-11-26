import axios from "axios";

export const BASE_URL = "http://192.168.1.7:8080/api"; // Your PC IP

export const loginDoer = (phone) =>
  axios.post(`${BASE_URL}/auth/doer/login`, { phone });

export const verifyOtpDoer = (sessionId, otp) =>
  axios.post(`${BASE_URL}/auth/doer/verify-otp`, { sessionId, otp });

export const registerDoer = (payload) =>
  axios.post(`${BASE_URL}/auth/doer/register`, payload);

export const fetchDoerProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");

    const res = await axios.get(`${BASE_URL}/doer/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // { status, data, message }
  } catch (err) {
    console.error("❌ fetchDoerProfile Error:", err.response?.data || err.message);
    return { status: "ERROR", message: err.message || "Failed to fetch profile" };
  }
};
