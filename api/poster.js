import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.40:8080/api" // 192.168.1.40
    : "http://192.168.1.40:8080/api";

// ----------------- Axios Instance -----------------
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Automatically attach JWT token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ----------------- Poster Profile APIs -----------------
export const fetchPosterProfile = async () => {
  try {
    const res = await api.get("/poster/profile/get");
    return res.data;
  } catch (err) {
    console.error(
      "❌ fetchPosterProfile Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to fetch profile",
    };
  }
};
// Fetch price items for a poster job
// Fetch price items for a poster job
export const getPosterJobPriceItems = async (jobId) => {
  try {
    const res = await api.get(`/poster/jobs/${jobId}/price-items`);
    return res.data; // should be { status, data, message }
  } catch (err) {
    console.error(
      "❌ getPosterJobPriceItems Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      data: [],
      message: err.response?.data?.message || "Failed to fetch price items",
    };
  }
};
export const fetchUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");

    const res = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data; // { status, data, message }
  } catch (err) {
    console.error(
      "❌ fetchUserProfile Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to fetch user profile",
    };
  }
};
export const updatePosterProfile = async (body) => {
  try {
    const res = await api.put("/poster/profile/", body);
    return res.data;
  } catch (err) {
    console.error(
      "❌ updatePosterProfile Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to update profile",
    };
  }
};

// ----------------- Address APIs -----------------
export const addAddress = async (address) => {
  try {
    const res = await api.post("/poster/profile/address", address);
    return res.data;
  } catch (err) {
    console.error("❌ addAddress Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to add address",
    };
  }
};

export const updateAddress = async (id, address) => {
  try {
    const res = await api.put(`/poster/profile/address/${id}`, address);
    return res.data;
  } catch (err) {
    console.error("❌ updateAddress Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to update address",
    };
  }
};

export const deleteAddress = async (id) => {
  try {
    const res = await api.delete(`/poster/profile/address/${id}`);
    return res.data;
  } catch (err) {
    console.error("❌ deleteAddress Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to delete address",
    };
  }
};
export const updatePosterJob = async (jobId, payload) => {
  try {
    const response = await api.put(`/poster/jobs/update/${jobId}`, payload);
    return response.data;
  } catch (error) {
    console.log("Update poster job error:", error);
    return error.response?.data || { error: "Unknown error" };
  }
};

// export const getPosterAddressList = async () => {
//   try {
//     const res = await apiClient.get("/poster/profile/address/get");
//     return res.data; // return { data, status, message, timestamp }
//   } catch (error) {
//     console.log("Address fetch error:", error);
//     throw error;
//   }
// };

export const fetchPosterAddresses = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const res = await api.get("/poster/profile/address/get", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data?.status === "SUCCESS") return res.data;
    else return { status: "SUCCESS", data: [] };
  } catch (err) {
    //console.error("❌ fetchPosterAddresses Error:", err);
    //return { status: "ERROR", data: [], message: err.message };
  }
};

// Combined save: auto add or update
export const savePosterAddress = async (address) => {
  try {
    if (address.id) return await updateAddress(address.id, address);
    else return await addAddress(address);
  } catch (err) {
    console.error("❌ savePosterAddress Error:", err);
    return {
      status: "ERROR",
      message: err.message || "Failed to save address",
    };
  }
};
export const getJobCategories = async () => {
  try {
    const response = await api.get("/poster/jobs/categories");
    return response.data;
  } catch (error) {
    console.log("Category fetch error:", error);
    throw error;
  }
};
// ----------------- KYC APIs -----------------
export const uploadPosterKyc = async (docType, file) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("Poster not logged in");
    if (!file?.uri) throw new Error("No file selected");

    let fileUri = file.uri;
    if (Platform.OS === "android" && !fileUri.startsWith("file://"))
      fileUri = "file://" + fileUri;

    const formData = new FormData();
    formData.append("docType", docType);
    formData.append("file", {
      uri: fileUri,
      type: file.mimeType || file.type || "application/pdf",
      name: file.name || "kyc_document.pdf",
    });

    const res = await axios.post(
      `${BASE_URL}/poster/profile/doc/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error(
      "❌ uploadPosterKyc Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message:
        err.response?.data?.message || err.message || "Failed to upload KYC",
    };
  }
};

export const getPosterKycHistory = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const res = await axios.get(`${BASE_URL}/poster/profile/kyc/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error(
      "❌ getPosterKycHistory Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to fetch KYC history",
    };
  }
};

export const deletePosterKyc = async (id) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const res = await axios.delete(`${BASE_URL}/poster/profile/kyc/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error(
      "❌ deletePosterKyc Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to delete KYC document",
    };
  }
};

// ----------------- Poster Phone OTP -----------------
export const sendPosterPhoneOtp = async () => {
  try {
    const res = await api.post("/poster/profile/phone/send-otp");
    return res.data;
  } catch (err) {
    console.error(
      "❌ sendPosterPhoneOtp Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to send OTP",
    };
  }
};

export const verifyPosterPhoneOtp = async (sessionId, otp) => {
  try {
    const res = await api.post("/poster/profile/phone/verify", {
      sessionId,
      otp,
    });
    return res.data;
  } catch (err) {
    console.error(
      "❌ verifyPosterPhoneOtp Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "OTP verification failed",
    };
  }
};

// ----------------- Poster Jobs -----------------
export const createPosterJob = async (jobData) => {
  try {
    // Validate and convert fields
    const amountInRs = parseInt(jobData.amountInRs, 10);
    if (isNaN(amountInRs) || amountInRs <= 0) {
      return { status: "ERROR", message: "Invalid amountInRs" };
    }

    const payload = {
      title: jobData.title?.trim(),
      description: jobData.description?.trim(),
      categoryCode: jobData.categoryCode, // send string if backend expects string
      amountInRs,
      deadline: jobData.deadline || new Date().toISOString(),
      addressId:
        jobData.jobType === "PHYSICAL" ? Number(jobData.addressId) : null,
      jobType: jobData.jobType || "PHYSICAL",
    };

    console.log("Payload to backend:", payload);

    const res = await api.post("/poster/jobs/create", payload);
    return res.data;
  } catch (err) {
    console.error(
      "❌ createPosterJob Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to create job",
    };
  }
};
// ----------------- ✏️ Update Poster Job (PATCH) -----------------
// export const updatePosterJob = async (jobId, updateData) => {
//   try {
//     const res = await api.patch(`/poster/jobs/update/${jobId}`, updateData, {
//       headers: { "Content-Type": "application/json" },
//     });
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ updatePosterJob Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to update job",
//     };
//   }
// };
export const getPosterAddressList = async () => {
  try {
    const response = await api.get("/poster/profile/address/get");
    return response.data;
  } catch (error) {
    console.log("Address fetch error:", error);
    throw error;
  }
};

export const fetchPosterJobDetails = async (jobId) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");

    const res = await axios.get(`${BASE_URL}/poster/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data; // { status, data, message }
  } catch (err) {
    console.error(
      "❌ fetchPosterJobDetails Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to fetch job details",
    };
  }
};

export const getPosterJobs = async (
  page = 0,
  size = 10,
  status = "POSTED",
  sortFields = ["createdAt"],
  sortDirections = ["asc"]
) => {
  try {
    const res = await api.get("/poster/jobs/list", {
      params: { page, size, status, sortFields, sortDirections },
      headers: { Accept: "application/json" },
    });

    if (!res.data) {
      return {
        status: "ERROR",
        data: [],
        message: "No data returned from server",
      };
    }

    return {
      status: "SUCCESS",
      data: res.data.content || [],
      page: res.data.page,
      size: res.data.size,
      totalPages: res.data.totalPages,
      last: res.data.last,
      message: res.data.message,
      messageCode: res.data.messageCode,
    };
  } catch (err) {
    console.error("❌ getPosterJobs Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      data: [],
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch poster jobs",
    };
  }
};

// export const updatePosterJob = async (jobId, payload) => {
//   const token = await AsyncStorage.getItem("token"); // make sure your token is saved
//   return axios
//     .put(`${API_BASE}/jobs/${jobId}`, payload, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     })
//     .then((res) => res.data);
// };
const handleSaveUpdate = async () => {
  try {
    const payload = {
      title: selectedJob.title,
      description: selectedJob.description,
      categoryCode: selectedJob.category, // ensure backend expects categoryCode
      amountInRs: selectedJob.amountInRs,
      deadLine: selectedJob.deadLine,
      jobType: selectedJob.jobType,
    };

    const res = await updatePosterJob(selectedJob.id, payload);

    if (res?.status === "SUCCESS") {
      if (priceItems?.length > 0) {
        for (const item of priceItems) {
          await addJobPriceItem(selectedJob.id, {
            label: item.label,
            description: item.description || "",
            priceRupees: item.priceRupees,
          });
        }
      }

      Alert.alert("✅ Success", "Job updated successfully");
      setUpdateModalVisible(false);
      loadJobs(jobStatusFilter);
    } else {
      Alert.alert("Error", res?.message || "Failed to update job");
    }
  } catch (err) {
    console.error(
      "❌ handleSaveUpdate Error:",
      err.response?.data || err.message
    );
    Alert.alert("Error", "Something went wrong while updating the job.");
  }
};

// export const addJobPriceItem = async (jobId, pricePayload) => {
//   const token = await AsyncStorage.getItem("token");
//   return axios
//     .post(`${API_BASE}/jobs/${jobId}/price-items`, pricePayload, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     })
//     .then((res) => res.data);
// };
// const handleSaveUpdate = async () => {
//   try {
//     // Build payload dynamically — only include non-empty fields
//     const payload = {};

//     if (title?.trim()) payload.title = title.trim();
//     if (description?.trim()) payload.description = description.trim();
//     if (categoryCode) payload.categoryCode = String(categoryCode);
//     if (amountPaise) payload.amountInRs = Number(amountPaise) / 100; // convert paise → rupees
//     if (deadline) payload.deadLine = deadline.toISOString();
//     if (jobType) payload.jobType = jobType;
//     if (addressId && jobType === "PHYSICAL")
//       payload.addressId = Number(addressId);

//     console.log("PATCH Payload:", payload);

//     if (Object.keys(payload).length === 0) {
//       return Alert.alert(
//         "Nothing to update",
//         "Please modify at least one field before saving."
//       );
//     }

//     const res = await updatePosterJob(selectedJob.id, payload);

//     if (res?.status === "SUCCESS") {
//       // Optional: price items update (only if you allow editing them)
//       if (priceItems?.length > 0) {
//         for (const item of priceItems) {
//           await addJobPriceItem(selectedJob.id, {
//             label: item.label,
//             description: item.description || "",
//             priceRupees: item.priceRupees,
//           });
//         }
//       }

//       Alert.alert("✅ Success", "Job updated successfully");
//       setUpdateModalVisible(false);
//       loadJobs(jobStatusFilter);
//     } else {
//       Alert.alert("Error", res?.message || "Failed to update job");
//     }
//   } catch (err) {
//     console.error("❌ handleSaveUpdate Error:", err);
//     Alert.alert("Error", "Something went wrong while updating the job.");
//   }
// };

export const deletePosterJob = async (jobId) => {
  try {
    const res = await api.delete(`/poster/jobs/delete/${jobId}`);
    return res.data;
  } catch (err) {
    console.error(
      "❌ deletePosterJob Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to delete job",
    };
  }
};

// ----------------- 💰 Job Price Items APIs -----------------
export const fetchJobPriceItems = async (jobId) => {
  try {
    const res = await api.get(`/poster/jobs/${jobId}/price-items`);
    return res.data;
  } catch (err) {
    console.error(
      "❌ fetchJobPriceItems Error:",
      err.response?.data || err.message
    );
    return { status: "ERROR", message: "Failed to fetch price items" };
  }
};

// export const addJobPriceItem = async (jobId, item) => {
//   try {
//     const res = await api.post(`/poster/jobs/${jobId}/price-items/add`, item);
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ addJobPriceItem Error:",
//       err.response?.data || err.message
//     );
//     return { status: "ERROR", message: "Failed to add price item" };
//   }
// };
// export const addJobPriceItem = async (jobId, item) => {
//   try {
//     const res = await api.post(`/poster/jobs/${jobId}/price-items`, item);
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ addJobPriceItem Error:",
//       err.response?.data || err.message
//     );
//     return { status: "ERROR", message: "Failed to add price item" };
//   }
// };

export const addJobPriceItem = async (jobId, itemData) => {
  try {
    // Get token from storage
    const token = await AsyncStorage.getItem("authToken");

    const payload = {
      label: itemData.label,
      description: itemData.description,
      priceRupees: itemData.priceRupees,
    };

    console.log("Payload to backend:", payload);

    const response = await axios.post(
      `http://192.168.1.40:8080/api/poster/jobs/${jobId}/price-items/add`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    console.log("Response:", response.data);
    return response.data;
  } catch (err) {
    console.error(
      "❌ addJobPriceItem Error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

export const updateJobPriceItem = async (jobId, itemId, item) => {
  try {
    const res = await api.put(
      `/poster/jobs/${jobId}/price-items/${itemId}`,
      item
    );
    return res.data;
  } catch (err) {
    console.error(
      "❌ updateJobPriceItem Error:",
      err.response?.data || err.message
    );
    return { status: "ERROR", message: "Failed to update price item" };
  }
};

export const deleteJobPriceItem = async (jobId, itemId) => {
  try {
    const res = await api.delete(`/poster/jobs/${jobId}/price-items/${itemId}`);
    return res.data;
  } catch (err) {
    console.error(
      "❌ deleteJobPriceItem Error:",
      err.response?.data || err.message
    );
    return { status: "ERROR", message: "Failed to delete price item" };
  }
};

// ----------------- Categories -----------------
export const fetchCategories = async () => {
  try {
    const res = await api.get("/poster/jobs/categories");
    return res.data;
  } catch (err) {
    console.error(
      "❌ fetchCategories Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to fetch categories",
    };
  }
};
// ----------------- 💰 Job Price Items APIs -----------------

// Fetch all price items for a job
export const fetchPosterJobPriceItems = async (jobId) => {
  try {
    const res = await api.get(`/poster/jobs/${jobId}/price-items`);
    return res.data; // { status, data, message }
  } catch (err) {
    console.error(
      "❌ fetchPosterJobPriceItems Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      data: [],
      message: "Failed to fetch price items",
    };
  }
};

// Add a new price item
export const addPosterJobPriceItem = async (jobId, itemData) => {
  try {
    const payload = {
      label: itemData.label,
      description: itemData.description || "",
      priceRupees: itemData.priceRupees,
    };

    const res = await api.post(
      `/poster/jobs/${jobId}/price-items/add`,
      payload
    );
    return res.data;
  } catch (err) {
    console.error(
      "❌ addPosterJobPriceItem Error:",
      err.response?.data || err.message
    );
    return { status: "ERROR", message: "Failed to add price item" };
  }
};

// Update an existing price item
export const updatePosterJobPriceItem = async (jobId, itemId, itemData) => {
  try {
    const payload = {
      label: itemData.label,
      description: itemData.description || "",
      priceRupees: itemData.priceRupees,
    };

    const res = await api.put(
      `/poster/jobs/${jobId}/price-items/${itemId}`,
      payload
    );
    return res.data;
  } catch (err) {
    console.error(
      "❌ updatePosterJobPriceItem Error:",
      err.response?.data || err.message
    );
    return { status: "ERROR", message: "Failed to update price item" };
  }
};

// Delete a price item
export const deletePosterJobPriceItem = async (jobId, itemId) => {
  try {
    const res = await api.delete(`/poster/jobs/${jobId}/price-items/${itemId}`);
    return res.data;
  } catch (err) {
    console.error(
      "❌ deletePosterJobPriceItem Error:",
      err.response?.data || err.message
    );
    return { status: "ERROR", message: "Failed to delete price item" };
  }
};

// ----------------- Logout -----------------
export const logoutPoster = async () => {
  try {
    await AsyncStorage.multiRemove(["authToken", "posterProfile", "userRole"]);
    return { status: "SUCCESS", message: "Logout successful" };
  } catch (err) {
    console.error("❌ logoutPoster Error:", err);
    return { status: "ERROR", message: "Logout failed" };
  }
};
