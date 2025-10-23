// api/job.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.156.218:8080/api"; // replace with your backend IP

// ✅ Axios instance with token automatically added
const api = axios.create({
  baseURL: BASE_URL,
});

// Add token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("posterToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------------- JOB APIS ----------------

// Get all jobs for poster
export const getJobs = async (page = 0, size = 10, status = "") => {
  try {
    const res = await api.get("/poster/jobs/list", {
      params: { page, size, status },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};


// Update a job
export const updateJob = async (jobId, jobData) => {
  try {
    const res = await api.patch(`/poster/jobs/update/${jobId}`, jobData);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Delete a job
export const deleteJob = async (jobId) => {
  try {
    const res = await api.delete(`/poster/jobs/delete/${jobId}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Get all job categories (if needed)
export const getAllCategories = async () => {
  try {
    const res = await api.get("/poster/jobs/all");
    return res.data;
  } catch (err) {
    throw err;
  }
};
