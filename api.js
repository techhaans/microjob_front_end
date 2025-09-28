

// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Replace with your PC local IP
// export const BASE_IP = "192.168.1.10"; // <-- your PC IP
// export const BASE_URL = `http://${BASE_IP}:8080/api`;

// // 1️⃣ Login → send phone
// export const loginDoer = async (phone) => {
//   const res = await axios.post(`${API_BASE}/auth/doer/login`, { phone });
//   return res.data.data; // sessionId
// };

// // 2️⃣ Verify OTP → get JWT
// export const verifyOtp = async (sessionId, otp) => {
//   const res = await axios.post(`${API_BASE}/auth/doer/verify-otp`, {
//     sessionId,
//     otp,
//   });
//   const token = res.data.data.token;
//   await AsyncStorage.setItem("JWT_TOKEN", token); // save token
//   return token;
// };

// // 3️⃣ Get Doer Profile
// export const getProfile = async () => {
//   const token = await AsyncStorage.getItem("JWT_TOKEN");
//   const res = await axios.get(`${API_BASE}/doer/profile`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.data.data;
// };


import axios from "axios";
import { BASE_URL } from "../config/config";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export default api;
