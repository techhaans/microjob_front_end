import axios from "axios"; // your axios instance

export const postJob = async (data) => {
  try {
    const res = await api.post("/poster/job", data);
    return res.data;
  } catch (err) {
    console.error(err);
    return { status: "ERROR", message: err.message };
  }
};
