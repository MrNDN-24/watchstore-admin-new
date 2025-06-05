import React, { useEffect, useState } from "react";
import {
  getActivities,
  getActivityById,
  softDeleteActivity,
} from "../services/activityServices";
import Pagination from "../components/Pagination";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ActivityManagement.css";
import { FaTrashAlt, FaEye } from "react-icons/fa";


const ActivityManagement = () => {
  const [activities, setActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const [detailActivity, setDetailActivity] = useState(null);
  const [search, setSearch] = useState("");

  const fetchData = (page = 1) => {
    getActivities(page, itemsPerPage, search)
      .then((data) => {
        setActivities(data.activities || data);
        setCurrentPage(data.page || page);
        setTotalPages(data.totalPages || 1);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy hoạt động:", error);
        toast.error("Lỗi khi lấy danh sách hoạt động.");
      });
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, search]);
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };
  const handleViewDetail = async (id) => {
    try {
      const data = await getActivityById(id);
      console.log(data);
      if (data.success && data.activity) {
        setDetailActivity(data.activity);
      } else {
        toast.error("Không tìm thấy chi tiết hoạt động.");
      }
    } catch (error) {
      toast.error("Lỗi khi lấy chi tiết hoạt động.");
    }
  };

  const closeDetailModal = () => {
    setDetailActivity(null);
  };

  const handleSoftDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hoạt động này?")) {
      try {
        await softDeleteActivity(id);
        toast.success("Xóa hoạt động thành công!");
        fetchData(currentPage);
      } catch (error) {
        toast.error("Lỗi khi xóa hoạt động.");
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const translateActivityType = (type) => {
    const translations = {
      view_product_details: "Xem chi tiết sản phẩm",
      add_to_cart: "Thêm vào giỏ hàng",
      remove_from_cart: "Xóa khỏi giỏ hàng",
      view_discount_program: "Xem chương trình giảm giá",
      view_blog: "Xem bài viết",
      view_order_history: "Xem lịch sử đơn hàng",
      login: "Đăng nhập",
      logout: "Đăng xuất",
      mark_all_notify_read: "Đánh dấu đã đọc hết tất cả thông báo",
      mark_notify_read: "Đánh dấu đã đọc thông báo",
      create_order: "Tạo đơn hàng mua",
      cancel_order: "Hủy đơn hàng",
      create_conversation: "Tạo cuộc trò chuyện với nhân viên",
    };
    return translations[type] || type;
  };

  const translateTargetModel = (model) => {
    const translations = {
      Product: "Sản phẩm",
      Cart: "Giỏ hàng",
      Discount: "Khuyến mãi",
      Blog: "Bài viết",
      Order: "Đơn hàng",
      User: "Người dùng",
      Notify: "Thông báo",
    };
    return translations[model] || model;
  };
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `📅 ${day}/${month}/${year} 🕒 ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="activity-management">
      <h1>Quản Lý Hoạt Động Người Dùng</h1>
      <div className="filter-search">
        <input
          type="text"
          placeholder="Tìm kiếm"
          onChange={handleSearchChange}
        />
      </div>

      <div className="activity-table">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Người dùng</th>
              <th>Loại hoạt động</th>
              <th>Đối tượng</th>
              <th>Mô tả</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  Không có hoạt động nào
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity._id}>
                  <td>{activity._id?.slice(0, 10) || "-"}</td>
                  <td>{activity.userId?.name || "-"}</td>
                  <td>{translateActivityType(activity.activityType)}</td>
                  <td>{translateTargetModel(activity.targetModel)}</td>
                  <td>{activity.description || "-"}</td>
                  <td>{formatDate(activity.timestamp)}</td>

                  <td>
                    <div className="activity-actions">
                      <button
                        className="seen-btn-activity"
                        onClick={() => handleViewDetail(activity._id)}
                      >
                        <span className="icon-activity">
                          <FaEye />
                        </span>
                      </button>
                      <button
                        className="delete-btn-activity"
                        onClick={() => handleSoftDelete(activity._id)}
                      >
                        <span className="icon-activity">
                          <FaTrashAlt />
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {detailActivity && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chi Tiết Hoạt Động</h2>
            <button className="modal-close-btn" onClick={closeDetailModal}>
              Đóng
            </button>
            <div>
              <strong>Mã:</strong> {detailActivity._id}
            </div>
            <div>
              <strong>Người dùng:</strong> {detailActivity.userId?.name || "-"}
            </div>

            <div>
              <strong>Loại Hoạt Động:</strong>{" "}
              {translateActivityType(detailActivity.activityType)}
            </div>
            <div>
              <strong>Đối tượng:</strong>{" "}
              {translateTargetModel(detailActivity.targetModel || "-")}
            </div>

            <div>
              <strong>Mô Tả:</strong> {detailActivity.description || "-"}
            </div>

            <div>
              <strong>Thời gian:</strong> {formatDate(detailActivity.timestamp)}
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ActivityManagement;
