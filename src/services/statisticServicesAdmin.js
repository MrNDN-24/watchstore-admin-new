import { createAxiosInstance } from '../config/axiosConfig';

// Tạo instance cho các API liên quan đến sản phẩm

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const axiosInstance = createAxiosInstance(`${API_BASE_URL}/statistics`);

export const getStatistics = async (year) => {
  try {
    const response = await axiosInstance.get('/', {
      params: { year }
    }); 
    return response.data; 
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error; 
  }
};
export const getTopProducts = async () => {
  try {
    const response = await axiosInstance.get('/topProducts');
    console.log(response.data); // Log dữ liệu trả về từ API
    return response.data; 
  } catch (error) {
    console.error("Error fetching top products:", error);
    throw error; 
  }
};


export const getAvailableYears = async () => {
  try {
    const response = await axiosInstance.get('/toltalYear');
    return response.data; // Ví dụ: [2021, 2022, 2023, 2024, 2025]
  } catch (error) {
    console.error("Error fetching available years:", error);
    throw error;
  }
};

export const getOrdersByYear = async (year) => {
  try {
    const response = await axiosInstance.get('/getOrderByYear', {
      params: { year },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders by year:', error);
    throw error;
  }
};