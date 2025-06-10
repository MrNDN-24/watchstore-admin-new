import { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaCheck,
  FaTimes,
  FaUserPlus,
  FaTrash,
} from "react-icons/fa";
import {
  getSupportQueue,
  removeFromQueue,
} from "../services/supportQueueServicesAdmin.js";
import {
  assignStaff,
  closeConversation,
} from "../services/conversationServicesAdmin.js";
import {
  sendMessage,
  getMessagesByConversation,
} from "../services/messageServicesAdmin.js";
import { jwtDecode } from "jwt-decode";
import "../styles/StaffChat.css";

//Socket
import { io } from "socket.io-client";

const ChatMessageManagement = ({ setHasNewSupportRequest }) => {
  const [supportQueue, setSupportQueue] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [staffId, setStaffId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const chatBodyRef = useRef();
  const socketRef = useRef(null);

  // Sửa lại useEffect trong ChatMessageManagement
  useEffect(() => {
    // Reset thông báo khi vào trang chat
    if (typeof setHasNewSupportRequest === "function") {
      console.log("Resetting notification flag");
      setHasNewSupportRequest(false);
    }

    return () => {
      // Có thể thêm cleanup nếu cần
    };
  }, [setHasNewSupportRequest]);

  // Lấy thông tin nhân viên từ token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setStaffId(decoded.userId || decoded.id || decoded._id);
      } catch (err) {
        console.error("Token không hợp lệ:", err);
      }
    }
  }, []);

  // Lấy danh sách hàng chờ
  const fetchSupportQueue = async () => {
    try {
      const data = await getSupportQueue();
      setSupportQueue(data.queue || []);
    } catch (error) {
      console.error("Lỗi khi lấy hàng chờ:", error);
    }
  };
  useEffect(() => {
    fetchSupportQueue();

    // Khởi tạo socket kết nối tới server
    socketRef.current = io(process.env.REACT_APP_API_SOCKET_ADMIN);

    // Lắng nghe event server gửi khi hàng chờ thay đổi
    socketRef.current.on("supportQueueUpdated", () => {
      fetchSupportQueue();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Lấy tin nhắn của cuộc trò chuyện
  const fetchMessages = async (conversationId) => {
    try {
      const data = await getMessagesByConversation(conversationId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
    }
  };

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("receive_message", (message) => {
      if (message.conversationId === activeConversation) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socketRef.current.off("receive_message");
    };
  }, [activeConversation]);

  // Nhận cuộc trò chuyện từ hàng chờ
  const acceptConversation = async (conversationId, customerId) => {
    if (!staffId) return;

    try {
      console.log("Gán nhân viên", { conversationId, staffId });
      // Gán nhân viên vào cuộc trò chuyện
      await assignStaff(conversationId, staffId);
      // Tìm khách hàng trong hàng chờ để lấy tên
      const customer = supportQueue.find(
        (item) => item.conversationId === conversationId
      );

      if (customer) {
        setCustomerName(
          customer.customerId?.name || `KH#${customerId.slice(0, 6)}`
        );
        setCustomerId(customerId);
      }

      // Cập nhật state
      setActiveConversation(conversationId);
      socketRef.current.emit("join", conversationId);
      fetchMessages(conversationId);
      fetchSupportQueue();
    } catch (error) {
      console.error("Lỗi khi nhận cuộc trò chuyện:", error);
    }
  };

  const handleRemoveFromQueue = async (customerId, conversationId) => {
    //if (!window.confirm("Xóa khách này khỏi hàng chờ?")) return;

    try {
      await removeFromQueue(customerId);
      fetchSupportQueue();
    } catch (error) {
      console.error("Lỗi khi xoá khách khỏi hàng chờ:", error);
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !staffId) return;

    try {
      const messageData = {
        conversationId: activeConversation,
        senderId: staffId,
        receiverId: customerId,
        senderRole: "staff",
        message: newMessage,
        isBot: false,
      };

      await sendMessage(messageData);

      // Cập nhật tin nhắn
      setNewMessage("");
      fetchMessages(activeConversation);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };

  // Đóng cuộc trò chuyện
  const handleCloseConversation = async (isResolved = true) => {
    if (!activeConversation) return;

    console.log("👉 Đóng cuộc trò chuyện:", {
      conversationId: activeConversation,
      isResolved,
    });

    try {
      await closeConversation(activeConversation, isResolved);
      setActiveConversation(null);
      setMessages([]);
      setCustomerName("");
    } catch (error) {
      console.error("Lỗi khi đóng cuộc trò chuyện:", error);
    }
  };

  // Tự động scroll xuống khi có tin nhắn mới
  useEffect(() => {
    chatBodyRef.current?.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Làm mới danh sách hàng chờ định kỳ
  useEffect(() => {
    fetchSupportQueue();
    const interval = setInterval(fetchSupportQueue, 5000); // Làm mới mỗi 5 giây

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="staff-chat-container">
      <h2>Quản lý hỗ trợ khách hàng</h2>

      <div className="chat-layout">
        {/* Danh sách hàng chờ */}
        <div className="queue-section">
          <div className="queue-header">
            <h3>Hàng chờ hỗ trợ ({supportQueue.length})</h3>
            {supportQueue.length > 0}
          </div>
          <div className="queue-list">
            {supportQueue.length === 0 ? (
              <p className="empty-queue">
                Không có khách hàng nào trong hàng chờ
              </p>
            ) : (
              supportQueue.map((item) => (
                <div key={item.customerId._id} className="queue-item">
                  <div className="customer-info">
                    <span className="customer-name">
                      {item.customerId.name ||
                        item.customerId.email ||
                        `KH#${item.customerId._id.toString().slice(0, 6)}`}
                    </span>

                    <span className="waiting-time">
                      Đang chờ:{" "}
                      {Math.floor(
                        (Date.now() -
                          new Date(
                            item.requestedAt || item.createdAt
                          ).getTime()) /
                          60000
                      )}{" "}
                      phút
                    </span>
                  </div>
                  <div className="chat-actions">
                    {activeConversation === null && (
                      <button
                        onClick={() =>
                          acceptConversation(
                            item.conversationId,
                            item.customerId
                          )
                        }
                        className="accept-btn"
                        title="Nhận cuộc trò chuyện"
                      >
                        <span className="icon-chat">
                          <FaUserPlus />
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleRemoveFromQueue(
                          item.customerId?._id || item.customerId,
                          item.conversationId
                        )
                      }
                      className="remove-btn"
                      title="Xóa khỏi hàng chờ"
                    >
                      <span className="icon-chat">
                        {" "}
                        <FaTrash />
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Khu vực chat */}
        <div className="chat-section">
          {activeConversation ? (
            <>
              <div className="chat-header">
                <h3>Đang trò chuyện với {customerName || "khách hàng"}</h3>
                <div className="chat-actions">
                  <button
                    onClick={() => handleCloseConversation(true)}
                    className="resolve-btn"
                    title="Đánh dấu đã giải quyết"
                  >
                    {" "}
                    <span className="icon-chat">
                      <FaCheck />
                    </span>
                  </button>
                  <button
                    onClick={() => handleCloseConversation(false)}
                    className="close-btn"
                    title="Đóng cuộc trò chuyện"
                  >
                    <span className="icon-chat">
                      {" "}
                      <FaTimes />
                    </span>
                  </button>
                </div>
              </div>

              <div ref={chatBodyRef} className="chat-messages">
                {messages.length === 0 ? (
                  <p className="no-messages">Chưa có tin nhắn nào</p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${
                        msg.senderRole === "staff"
                          ? "staff-message"
                          : "customer-message"
                      }`}
                    >
                      <div className="message-content">
                        <p>{msg.message}</p>
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="send-btn"
                  title="Gửi tin nhắn"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </>
          ) : (
            <div className="no-active-chat">
              <p>Chọn một cuộc trò chuyện từ hàng chờ để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageManagement;
