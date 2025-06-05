import { createAxiosInstance } from "../config/axiosConfig";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const axiosInstance = createAxiosInstance(`${API_BASE_URL}/activity`);

// Lấy danh sách activity, hỗ trợ phân trang và lọc theo userId
export const getActivities = async (page = 1, limit = 5, search = "") => {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (search) params.append("search", search);
    const response = await axiosInstance.get(`/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching activities:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Lấy chi tiết activity theo id
export const getActivityById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching activity by id:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Xóa mềm activity theo id
export const softDeleteActivity = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error soft deleting activity:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
