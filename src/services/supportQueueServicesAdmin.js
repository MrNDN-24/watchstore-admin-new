//Phía cửa hàng
import { createAxiosInstance } from '../config/axiosConfig';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const axiosInstance = createAxiosInstance(`${API_BASE_URL}/support-queue`);

// Lấy danh sách hàng chờ hỗ trợ
export const getSupportQueue = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy hàng chờ hỗ trợ:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Xóa khách hàng khỏi hàng chờ theo customerId
export const removeFromQueue = async (customerId) => {
  try {
    const response = await axiosInstance.delete(`/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xoá khách khỏi hàng chờ:', error.response ? error.response.data : error.message);
    throw error;
  }
};
