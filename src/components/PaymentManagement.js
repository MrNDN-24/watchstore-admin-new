import React, { useEffect, useState } from "react";
import { getPayments, getPaymentById } from "../services/paymentServices";
import Pagination from "../components/Pagination";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/PaymentManagement.css";
import "../styles/PaymentManagement.css";
import { FaEye } from "react-icons/fa";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailPayment, setDetailPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 5;

  const fetchData = (
    page = 1,
    status = filterStatus,
    method = filterMethod
  ) => {
    getPayments(page, itemsPerPage, status, method)
      .then((data) => {
        setPayments(data.payments || data);
        setCurrentPage(data.page || page);
        setTotalPages(data.totalPages || 1);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy thanh toán:", error);
        toast.error("Lỗi khi lấy danh sách thanh toán.");
      });
  };
  useEffect(() => {
    fetchData(1); // reset về page 1 khi filter thay đổi
  }, [filterStatus, filterMethod]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handleViewDetail = async (id) => {
    try {
      const data = await getPaymentById(id);
      console.log(data);
      if (data.success && data.payment) {
        const mergedPayment = {
          ...data.payment,
          order: data.relatedOrders?.[0] || null,
          user: data.relatedOrders?.[0]?.user_id || null,
        };
        setDetailPayment(mergedPayment);
      } else {
        toast.error("Không tìm thấy chi tiết thanh toán.");
      }
    } catch (error) {
      toast.error("Lỗi khi lấy chi tiết thanh toán.");
    }
  };

  const closeDetailModal = () => {
    setDetailPayment(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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
    <div className="payment-management">
      <h1>Quản Lý Thanh Toán</h1>
      <div className="search-input-payment">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset về page 1 khi search thay đổi
          }}
        />
      </div>

      <div className="payment-filter">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="Đã thanh toán">Đã thanh toán</option>
          <option value="Chưa thanh toán">Chưa thanh toán</option>
          <option value="Hoàn tiền">Hoàn tiền/Hủy mua hàng</option>
        </select>

        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
        >
          <option value="">-- Tất cả phương thức --</option>
          <option value="Cash on Delivery">Thanh toán khi nhận hàng</option>
          <option value="Bank Transfer">Ví MoMo</option>
          <option value="VNPAY">VNPAY</option>
        </select>
      </div>

      <div className="payment-table">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Người dùng</th>
              <th>Đơn hàng</th>
              <th>Phương thức</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  Không có thanh toán nào
                </td>
              </tr>
            ) : (
              payments
                .filter((payment) => {
                  const keyword = searchTerm.toLowerCase();
                  return (
                    payment._id?.toLowerCase().includes(keyword) ||
                    payment.buyer?.name?.toLowerCase().includes(keyword) ||
                    payment.buyer?.orderId?.toLowerCase().includes(keyword)
                  );
                })
                .map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment._id?.slice(0, 10) || "-"}</td>
                    <td>{payment.buyer?.name || "-"}</td> {/* ✅ sửa chỗ này */}
                    <td>{payment.buyer?.orderId?.slice(0, 12) || "-"}</td>{" "}
                    {/* Có thể để "-" nếu không cần */}
                    <td>
                      {payment.method === "Cash on Delivery"
                        ? "Thanh toán khi nhận hàng"
                        : payment.method === "Bank Transfer"
                        ? "Ví MoMo"
                        : payment.method === "VNPAY"
                        ? "VNPAY"
                        : payment.method || "-"}
                    </td>
                    <td>{payment.status || "-"}</td>
                    <td>{payment.amount?.toLocaleString("vi-VN")}₫</td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>
                      <div className="payment-actions">
                        <button
                          className="seen-btn-payment"
                          onClick={() => handleViewDetail(payment._id)}
                        >
                          <span className="icon-payment">
                            <FaEye />
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

      {detailPayment && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chi Tiết Thanh Toán</h2>
            <button className="modal-close-btn" onClick={closeDetailModal}>
              Đóng
            </button>
            <div>
              <strong>Mã:</strong> {detailPayment._id}
            </div>
            <div>
              <strong>Người dùng:</strong> {detailPayment.user?.name || "-"}
            </div>
            <div>
              <strong>Đơn hàng:</strong> {detailPayment.order?._id || "-"}
            </div>

            <div>
              <strong>Phương thức:</strong>{" "}
              {detailPayment.method === "Cash on Delivery"
                ? "Thanh toán khi nhận hàng"
                : detailPayment.method === "Bank Transfer"
                ? "Ví MoMo"
                : detailPayment.method === "VNPAY"
                ? "VNPAY"
                : detailPayment.method || "-"}
            </div>
            <div>
              <strong>Số tiền:</strong>{" "}
              {detailPayment.amount?.toLocaleString("vi-VN")}₫
            </div>
            <div>
              <strong>Thời gian:</strong> {formatDate(detailPayment.createdAt)}
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default PaymentManagement;
