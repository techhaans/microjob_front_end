import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.40:8080/api" //  192.168.1.40
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
// export const createPosterJob = async (jobData) => {
//   try {
//     // Validate and convert fields
//     const amountInRs = parseInt(jobData.amountInRs, 10);
//     if (isNaN(amountInRs) || amountInRs <= 0) {
//       return { status: "ERROR", message: "Invalid amountInRs" };
//     }

//     const payload = {
//       title: jobData.title?.trim(),
//       description: jobData.description?.trim(),
//       categoryCode: jobData.categoryCode, // send string if backend expects string
//       amountInRs,
//       deadline: jobData.deadline || new Date().toISOString(),
//       addressId:
//         jobData.jobType === "PHYSICAL" ? Number(jobData.addressId) : null,
//       jobType: jobData.jobType || "PHYSICAL",
//     };

//     console.log("Payload to backend:", payload);

//     const res = await api.post("/poster/jobs/create", payload);
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ createPosterJob Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to create job",
//     };
//   }
// };

export const createPosterJob = async (jobData) => {
  try {
    const amountInRs = parseInt(jobData.amountInRs, 10);
    if (isNaN(amountInRs) || amountInRs <= 0) {
      return { status: "ERROR", message: "Invalid amountInRs" };
    }

    const payload = {
      title: jobData.title?.trim(),
      description: jobData.description?.trim(),
      categoryCode: jobData.categoryCode,
      amountInRs,
      deadline: jobData.deadline || new Date().toISOString(),
      addressId:
        jobData.jobType === "PHYSICAL" ? Number(jobData.addressId) : null,
      jobType: jobData.jobType || "PHYSICAL",

      // ⭐ Added
      photoUrl: jobData.photoUrl || null,
      radiusInKm: jobData.radiusInKm || 0,
    };

    console.log("Payload:", payload);

    const res = await api.post("/poster/jobs/create", payload);

    return {
      status: "SUCCESS",
      data: res.data?.data,
      message: "🎉 Your job has been created successfully!",
    };
  } catch (err) {
    console.error("createPosterJob Error:", err.response?.data || err.message);
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to create job",
    };
  }
};

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

// ----------------- Poster Job Status APIs -----------------

/**
 * Mark a poster job as partially completed
 * @param {number} jobId
 * @returns {Promise<Object>} { status, data, message }
 */
export const markJobPartial = async (jobId) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const res = await axios.post(
      `${BASE_URL}/poster/jobs/${jobId}/partial`,
      {}, // No body needed
      {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      }
    );
    return res.data; // { status, message, data, timestamp }
  } catch (err) {
    console.error(
      "❌ markJobPartial Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to mark job partial",
    };
  }
};

/**
 * Confirm that a poster job has been completed
 * @param {number} jobId
 * @returns {Promise<Object>} { status, data, message }
 */
export const confirmJobCompleted = async (jobId) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const res = await axios.post(
      `${BASE_URL}/poster/jobs/${jobId}/confirm-completed`,
      {}, // No body needed
      {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      }
    );
    return res.data; // { status, message, data, timestamp }
  } catch (err) {
    console.error(
      "❌ confirmJobCompleted Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message:
        err.response?.data?.message || "Failed to confirm job completion",
    };
  }
};

const handleConfirmCompleted = async (jobId, status) => {
  if (status !== "PARTIAL" && status !== "IN_PROGRESS") {
    Alert.alert("Error", "Cannot complete this job in current state.");
    return;
  }
  setLoadingJobIds((prev) => [...prev, jobId]);
  try {
    const res = await confirmJobCompleted(jobId);
    if (res.status === "SUCCESS") {
      Alert.alert("Success", "Job confirmed as completed");
      loadJobs(jobStatusFilter);
    } else {
      Alert.alert("Error", res.message || "Failed to confirm completion");
    }
  } catch (err) {
    console.warn(err);
    Alert.alert("Error", "Failed to confirm completion");
  }
  setLoadingJobIds((prev) => prev.filter((id) => id !== jobId));
};

// --------------------------------------
// NOTIFICATIONS (CORRECT BACKEND ROUTES)
// --------------------------------------

// export const fetchNotifications = async (
//   onlyUnread = false,
//   page = 0,
//   size = 20
// ) => {
//   try {
//     const res = await api.get("/notifications/", {
//       params: { onlyUnread, page, size },
//     });

//     return res.data?.data?.content ?? [];
//   } catch (err) {
//     console.error(
//       "❌ fetchNotifications Error:",
//       err.response?.status,
//       err.response?.data
//     );
//     throw err;
//   }
// };

// /**
//  * Get unread notification count
//  */
// export const getUnreadNotificationCount = async () => {
//   try {
//     const res = await api.get("/notifications/unread-count/");

//     const obj = res.data?.data ?? {};

//     return (
//       obj.additionalProp1 ?? obj.additionalProp2 ?? obj.additionalProp3 ?? 0
//     );
//   } catch (err) {
//     console.error(
//       "❌ getUnreadNotificationCount Error:",
//       err.response?.status,
//       err.response?.data
//     );
//     throw err;
//   }
// };

// /**
//  * Mark a single notification as read
//  */
// // export const markNotificationRead = async (notificationId) => {
// //   try {
// //     const res = await api.post(`/notifications/${notificationId}/read/`);
// //     return res.data;
// //   } catch (err) {
// //     console.error(
// //       "❌ markNotificationRead Error:",
// //       err.response?.status,
// //       err.response?.data
// //     );
// //     throw err;
// //   }
// // };

// // /**
// //  * Mark ALL notifications as read
// //  */
// // export const markAllNotificationsRead = async () => {
// //   try {
// //     const res = await api.post("/notifications/read-all");
// //     return res.data;
// //   } catch (err) {
// //     console.error(
// //       "❌ markAllNotificationsRead Error:",
// //       err.response?.status,
// //       err.response?.data
// //     );
// //     throw err;
// //   }
// // };
// export const fetchNotifications = async (
//   onlyUnread = false,
//   page = 0,
//   size = 20
// ) => {
//   try {
//     const res = await api.get("/notifications/", {
//       params: { onlyUnread, page, size },
//     });

//     return res.data?.data?.content ?? [];
//   } catch (err) {
//     console.error(
//       "❌ fetchNotifications Error:",
//       err.response?.status,
//       err.response?.data
//     );
//     throw err;
//   }
// };

// /**
//  * Get unread notification count
//  */
// export const getUnreadNotificationCount = async () => {
//   try {
//     const res = await api.get("/notifications/unread-count");

//     return res.data?.data?.unreadCount ?? 0;
//   } catch (err) {
//     console.error(
//       "❌ getUnreadNotificationCount Error:",
//       err.response?.status,
//       err.response?.data
//     );
//     return 0;
//   }
// };

// /**
//  * Mark a single notification as read
//  */
// export const markNotificationRead = async (notificationId) => {
//   try {
//     const res = await api.post(`/notifications/${notificationId}/read`);
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ markNotificationRead Error:",
//       err.response?.status,
//       err.response?.data
//     );
//     throw err;
//   }
// };

// /**
//  * Mark ALL notifications as read
//  */
// export const markAllNotificationsRead = async () => {
//   try {
//     const res = await api.post("/notifications/read-all");
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ markAllNotificationsRead Error:",
//       err.response?.status,
//       err.response?.data
//     );
//     throw err;
//   }
// };

// /** Mark a single notification as read */
// export const markNotificationRead = async (id) => {
//   try {
//     const res = await api.post(`/notifications/${id}/read`);
//     return res.data; // {data, message, status, timestamp}
//   } catch (err) {
//     console.error(
//       "❌ markNotificationRead Error:",
//       err.response?.status,
//       err.response?.data
//     );
//     throw err;
//   }
// };

// ----------------- Accept / Reject Job Interest APIs -----------------

/** Accept a doer's interest in a job */
// export const acceptJobInterest = async (jobId, interestId) => {
//   try {
//     const res = await api.post(
//       `/poster/jobs/${jobId}/interests/${interestId}/accept`
//     );

//     return res.data; // { status, message, data }
//   } catch (err) {
//     console.error(
//       "❌ acceptJobInterest Error:",
//       err.response?.data || err.message
//     );
//     return {
//       status: "ERROR",
//       message: err.response?.data?.message || "Failed to accept interest",
//     };
//   }
// };

// ----------------- Job Interests (Doer → Poster) -----------------

export const getJobInterests = async (jobId) => {
  try {
    console.log("🔍 Calling getJobInterests API...", jobId);

    const res = await api.get(`/poster/jobs/${jobId}/interests`);

    console.log("✅ getJobInterests API SUCCESS:", res.data);

    return res.data; // { status, data: [...], message }
  } catch (err) {
    console.error(
      "❌ getJobInterests ERROR:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to load job interests",
      data: [],
    };
  }
};

/**
 * Accept a doer's interest in a job
 * @param {number} jobId
 * @param {number} interestId
 * @returns {Promise<{status: string, message: string, data?: object}>}
 */
export const acceptJobInterest = async (jobId, interestId) => {
  try {
    const res = await api.post(
      `/poster/jobs/${jobId}/interests/${interestId}/accept`
    );
    return res.data;
  } catch (err) {
    console.error(
      "❌ acceptJobInterest Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to accept interest",
    };
  }
};

/**
 * Reject a doer's interest in a job
 * @param {number} jobId
 * @param {number} interestId
 * @returns {Promise<{status: string, message: string, data?: object}>}
 */
export const rejectJobInterest = async (jobId, interestId) => {
  try {
    const res = await api.post(
      `/poster/jobs/${jobId}/interests/${interestId}/reject`
    );
    return res.data;
  } catch (err) {
    console.error(
      "❌ rejectJobInterest Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: err.response?.data?.message || "Failed to reject interest",
    };
  }
};

/**
 * Fetch notifications (all or only unread)
 * @param {boolean} onlyUnread
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Array>}
 */
export const fetchNotifications = async (
  onlyUnread = false,
  page = 0,
  size = 20
) => {
  try {
    const res = await api.get("/notifications/", {
      params: { onlyUnread, page, size },
    });
    return res.data?.data?.content ?? [];
  } catch (err) {
    console.error(
      "❌ fetchNotifications Error:",
      err.response?.data || err.message
    );
    return [];
  }
};

/**
 * Get unread notification count
 * @returns {Promise<number>}
 */
export const getUnreadNotificationCount = async () => {
  try {
    const res = await api.get("/notifications/unread-count");
    return res.data?.data?.unreadCount ?? 0;
  } catch (err) {
    console.error(
      "❌ getUnreadNotificationCount Error:",
      err.response?.data || err.message
    );
    return 0;
  }
};

/**
 * Mark a single notification as read
 * @param {number} notificationId
 */
export const markNotificationRead = async (notificationId) => {
  try {
    const res = await api.post(`/notifications/${notificationId}/read`);
    return res.data;
  } catch (err) {
    console.error(
      "❌ markNotificationRead Error:",
      err.response?.data || err.message
    );
    return { status: "ERROR", message: "Failed to mark notification read" };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async () => {
  try {
    const res = await api.post("/notifications/read-all");
    return res.data;
  } catch (err) {
    console.error(
      "❌ markAllNotificationsRead Error:",
      err.response?.data || err.message
    );
    return {
      status: "ERROR",
      message: "Failed to mark all notifications read",
    };
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
