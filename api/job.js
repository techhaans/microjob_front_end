import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.226.218:8080/api"; // 👈 your backend URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Create a job
export const createPosterJob = async (jobData) => {
  try {
    const token = await AsyncStorage.getItem("posterToken");
    const res = await api.post("/poster/jobs/create", jobData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Create Job Error:", err.response?.data || err.message);
    throw err;
  }
};

// ✅ (Optional) Get all posted jobs
export const fetchPosterJobs = async () => {
  try {
    const token = await AsyncStorage.getItem("posterToken");
    const res = await api.get("/poster/jobs/list", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Fetch Jobs Error:", err.response?.data || err.message);
    throw err;
  }
};

// ✅ (Optional) Delete job by ID
export const deletePosterJob = async (jobId) => {
  try {
    const token = await AsyncStorage.getItem("posterToken");
    const res = await api.delete(`/poster/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Delete Job Error:", err.response?.data || err.message);
    throw err;
  }
};
