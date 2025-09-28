import axios from "axios";

export const BASE_URL = "http://192.168.1.7:8080/api"; // Use your PC IP and port

export const loginDoer = (phone) =>
  axios.post(`${BASE_URL}/auth/doer/login`, { phone });
export const verifyOtpDoer = (sessionId, otp) =>
  axios.post(`${BASE_URL}/auth/doer/verify-otp`, { sessionId, otp });
export const registerDoer = (payload) =>
  axios.post(`${BASE_URL}/auth/doer/register`, payload);
export const fetchProfile = (token) =>
  axios.get(`${BASE_URL}/doer/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
