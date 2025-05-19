import { createAxiosInstance } from '../config/axiosConfig';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const axiosInstance = createAxiosInstance(`${API_BASE_URL}/blogs`);

// Lấy danh sách bài viết, hỗ trợ phân trang và tìm kiếm
export const getBlogs = async (page, limit, search = "") => {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (search) params.append("search", search);

    const response = await axiosInstance.get(`/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching blogs:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Tạo mới bài viết, blogData có thể là FormData để upload ảnh
export const createBlog = async (blogData) => {
  try {
    const response = await axiosInstance.post('/create', blogData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating blog:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Cập nhật bài viết theo id, blogData có thể là FormData
export const updateBlog = async (id, blogData) => {
  try {
    const response = await axiosInstance.put(`/${id}`, blogData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating blog:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Xóa bài viết theo id
export const deleteBlog = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting blog:', error.response ? error.response.data : error.message);
    throw error;
  }
};
