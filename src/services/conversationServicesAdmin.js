//Phía cửa hàng
import { createAxiosInstance } from "../config/axiosConfig";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const axiosInstance = createAxiosInstance(`${API_BASE_URL}/conversations`);

// Gán nhân viên vào conversation
export const assignStaff = async (conversationId, staffId) => {
  try {
    const response = await axiosInstance.put("/assign-staff", {
      conversationId,
      staffId,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi gán nhân viên:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Đóng conversation
export const closeConversation = async (conversationId, isResolved = false) => {
  try {
    const response = await axiosInstance.put("/close", {
      conversationId,
      isResolved,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi đóng conversation:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
