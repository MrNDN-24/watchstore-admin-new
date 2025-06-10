import { createAxiosInstance } from "../config/axiosConfig";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const axiosInstance = createAxiosInstance(`${API_BASE_URL}/payments`);

// Lấy danh sách thanh toán (với filter: status, method, pagination)
export const getPayments = async (page = 1, limit = 10, status = "", method = "") => {
  try {
    const params = { page, limit };

    if (status) params.status = status;
    if (method) params.method = method;

    const response = await axiosInstance.get("/", { params });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thanh toán:", error);
    throw error;
  }
};

// Lấy chi tiết 1 thanh toán kèm đơn hàng liên quan
export const getPaymentById = async (paymentId) => {
  try {
    const response = await axiosInstance.get(`/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết thanh toán:", error);
    throw error;
  }
};


