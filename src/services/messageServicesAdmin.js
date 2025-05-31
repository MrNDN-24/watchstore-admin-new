//Phía cửa hàng
import { createAxiosInstance } from '../config/axiosConfig';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const axiosInstance = createAxiosInstance(`${API_BASE_URL}/messages`);

// Gửi tin nhắn mới
export const sendMessage = async ({ conversationId, senderId, receiverId, senderRole, message, isBot = false }) => {
  try {
    const response = await axiosInstance.post('/', {
      conversationId,
      senderId,
      receiverId,
      senderRole,
      message,
      isBot,
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Lấy danh sách tin nhắn theo conversationId
export const getMessagesByConversation = async (conversationId) => {
  try {
    const response = await axiosInstance.get(`/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy tin nhắn:', error.response ? error.response.data : error.message);
    throw error;
  }
};
