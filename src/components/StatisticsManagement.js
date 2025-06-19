import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "../styles/StatisticsManagement.css";
import {
  getStatistics,
  getAvailableYears,
  getOrdersByYear,
} from "../services/statisticServicesAdmin";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "jspdf-autotable";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);
};

const StatisticsManagement = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [activeTab, setActiveTab] = useState("revenue");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await getStatistics(selectedYear);
        setStatistics(data);
        setRevenueData(data.revenueData);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedYear]);

  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const years = await getAvailableYears();
        setAvailableYears(years);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách năm:", error);
      }
    };

    fetchAvailableYears();
  }, []);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrdersByYear(selectedYear);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [selectedYear]);

  const formatCurrencyForExport = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const exportToExcel = async () => {
    // Sheet thống kê doanh thu
    const excelData = revenueData.map((item) => ({
      Tháng: item.name.split("/")[0],
      Năm: item.name.split("/")[1],
      "Doanh thu thực tế": formatCurrencyForExport(item.doanhThu),
      "Doanh thu gốc": formatCurrencyForExport(item.originalTotal),
      "Giảm giá sản phẩm": formatCurrencyForExport(item.productDiscount),
      "Giảm giá từ mã": formatCurrencyForExport(item.couponDiscount),
      "Tổng giảm giá": formatCurrencyForExport(item.totalDiscount),
    }));

    // Gom đơn hàng theo tháng CẬP NHẬT (updatedAt)
    const ordersByMonth = {};
    orders.forEach((order) => {
      const month = new Date(order.updatedAt).getMonth() + 1;
      const year = new Date(order.updatedAt).getFullYear();

      if (year === selectedYear) {
        if (!ordersByMonth[month]) {
          ordersByMonth[month] = [];
        }

        // Tính tổng giá trị đơn hàng từ các sản phẩm
        const orderTotal = order.products.reduce((total, p) => {
          const price =
            p.product_id?.discount_price || p.product_id?.price || 0;
          return total + p.quantity * price;
        }, 0);

        ordersByMonth[month].push({
          "Mã đơn hàng": order._id,
          "Ngày cập nhật": new Date(order.updatedAt).toLocaleDateString(),
          "Khách hàng": order.user_id?.name || "Khách vãng lai",
          Email: order.user_id?.email || "",
          "Tổng giá trị": formatCurrencyForExport(orderTotal),
          "Giảm giá": formatCurrencyForExport(
            order.discountCode?.discountValue || 0
          ),
          "Mã giảm giá": order.discountCode?.code || "",
          "Trạng thái": order.deliveryStatus,
          "Sản phẩm": order.products
            .map((p) => {
              const price = p.product_id?.price || 0;
              const discountPrice = p.product_id?.discount_price;
              return (
                `${p.product_id?.name || "Sản phẩm đã xóa"} (SL: ${
                  p.quantity
                })\n` +
                `- Giá gốc: ${formatCurrencyForExport(price)}\n` +
                (discountPrice
                  ? `- Giá KM: ${formatCurrencyForExport(discountPrice)}\n`
                  : "") +
                `- Thành tiền: ${formatCurrencyForExport(
                  p.quantity * (discountPrice || price)
                )}`
              );
            })
            .join("\n\n"),
          "Ghi chú": order.note || "",
        });
      }
    });

    // Tạo workbook
    const wb = XLSX.utils.book_new();

    // Sheet thống kê doanh thu
    const ws1 = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws1, "Thống kê doanh thu");

    // Thêm các sheet đơn hàng theo tháng
    Object.entries(ordersByMonth).forEach(([month, monthOrders]) => {
      const ws = XLSX.utils.json_to_sheet(monthOrders);
      XLSX.utils.book_append_sheet(wb, ws, `Đơn hàng tháng ${month}`);
    });

    // Tự động điều chỉnh độ rộng cột
    const setAutoWidth = (sheet) => {
      const colWidths = [];
      XLSX.utils.sheet_to_json(sheet, { header: 1 }).forEach((row) => {
        row.forEach((cell, i) => {
          const cellLength = cell ? cell.toString().length : 0;
          colWidths[i] = Math.max(colWidths[i] || 0, cellLength);
        });
      });
      sheet["!cols"] = colWidths.map((w) => ({ width: Math.min(w + 2, 50) })); // Giới hạn max width 50
    };

    wb.SheetNames.forEach((sheetName) => {
      setAutoWidth(wb.Sheets[sheetName]);
    });

    // Xuất file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, `thong_ke_doanh_thu_va_don_hang_${selectedYear}.xlsx`);
  };

  const exportOrdersToExcel = () => {
    // Gom đơn hàng theo tháng CẬP NHẬT (updatedAt)
    const ordersByMonth = {};
    orders.forEach((order) => {
      const month = new Date(order.updatedAt).getMonth() + 1;
      const year = new Date(order.updatedAt).getFullYear();

      if (year === selectedYear) {
        if (!ordersByMonth[month]) {
          ordersByMonth[month] = [];
        }

        // Tính tổng giá trị đơn hàng từ các sản phẩm
        const orderTotal = order.products.reduce((total, p) => {
          const price =
            p.product_id?.discount_price || p.product_id?.price || 0;
          return total + p.quantity * price;
        }, 0);

        ordersByMonth[month].push({
          "Mã đơn hàng": order._id,
          "Ngày cập nhật": new Date(order.updatedAt).toLocaleDateString(),
          "Khách hàng": order.user_id?.name || "Khách vãng lai",
          Email: order.user_id?.email || "",
          "Tổng giá trị": formatCurrencyForExport(orderTotal),
          "Giảm giá": formatCurrencyForExport(
            order.discountCode?.discountValue || 0
          ),
          "Mã giảm giá": order.discountCode?.code || "",
          "Trạng thái": order.deliveryStatus,
          "Sản phẩm": order.products
            .map((p) => {
              const price = p.product_id?.price || 0;
              const discountPrice = p.product_id?.discount_price;
              return (
                `${p.product_id?.name || "Sản phẩm đã xóa"} (SL: ${
                  p.quantity
                })\n` +
                `- Giá gốc: ${formatCurrencyForExport(price)}\n` +
                (discountPrice
                  ? `- Giá KM: ${formatCurrencyForExport(discountPrice)}\n`
                  : "") +
                `- Thành tiền: ${formatCurrencyForExport(
                  p.quantity * (discountPrice || price)
                )}`
              );
            })
            .join("\n\n"),
          "Ghi chú": order.note || "",
        });
      }
    });

    // Tạo workbook chỉ với các sheet đơn hàng
    const wb = XLSX.utils.book_new();

    // Thêm các sheet đơn hàng theo tháng
    Object.entries(ordersByMonth).forEach(([month, monthOrders]) => {
      const ws = XLSX.utils.json_to_sheet(monthOrders);
      XLSX.utils.book_append_sheet(wb, ws, `Tháng ${month}`);
    });

    // Tự động điều chỉnh độ rộng cột
    const setAutoWidth = (sheet) => {
      const colWidths = [];
      XLSX.utils.sheet_to_json(sheet, { header: 1 }).forEach((row) => {
        row.forEach((cell, i) => {
          const cellLength = cell ? cell.toString().length : 0;
          colWidths[i] = Math.max(colWidths[i] || 0, cellLength);
        });
      });
      sheet["!cols"] = colWidths.map((w) => ({ width: Math.min(w + 2, 50) }));
    };

    wb.SheetNames.forEach((sheetName) => {
      setAutoWidth(wb.Sheets[sheetName]);
    });

    // Xuất file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, `danh_sach_don_hang_${selectedYear}.xlsx`);
  };
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="error-message">
        Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.
      </div>
    );
  }
  return (
    <div className="statistics-container">
      <h2>Báo cáo và Thống kê</h2>
      <div className="year-selector">
        <label htmlFor="year-select">Chọn năm: </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="export-buttons">
        <button onClick={exportToExcel}>
          Xuất Excel (Thống kê + Đơn hàng)
        </button>
        <button onClick={exportOrdersToExcel}>Xuất Excel (Đơn hàng)</button>
      </div>
      <div className="statistics-summary">
        <div className="stat-item">
          <h3>Tổng Khách Hàng</h3>
          <p>{statistics.totalCustomers}</p>
        </div>
        <div className="stat-item">
          <h3>Tổng Sản Phẩm</h3>
          <p>{statistics.totalProducts}</p>
        </div>
        <div className="stat-item">
          <h3>Đơn Chờ Xử Lý</h3>
          <p>{statistics.pendingOrders}</p>
        </div>
        <div className="stat-item">
          <h3>Đơn Giao Thành Công</h3>
          <p>{statistics.deliveredOrders}</p>
        </div>
        <div className="stat-item">
          <h3>Doanh Thu Thực Tế</h3>
          <p>{formatCurrency(statistics.monthTotal)}</p>
        </div>
        <div className="stat-item">
          <h3>Doanh Thu Ban Đầu</h3>
          <p>{formatCurrency(statistics.monthOriginal)}</p>
        </div>
        <div className="stat-item">
          <h3>Giảm Giá Của Sản Phẩm</h3>
          <p>{formatCurrency(statistics.monthProductDiscount)}</p>
        </div>
        <div className="stat-item">
          <h3>Giảm Giá Mã Khuyến Mãi</h3>
          <p>{formatCurrency(statistics.monthCouponDiscount)}</p>
        </div>
      </div>

      <div className="chart-tabs">
        <button
          className={`tab-button ${activeTab === "revenue" ? "active" : ""}`}
          onClick={() => setActiveTab("revenue")}
        >
          Doanh Thu
        </button>
        <button
          className={`tab-button ${activeTab === "discount" ? "active" : ""}`}
          onClick={() => setActiveTab("discount")}
        >
          Giảm Giá
        </button>
      </div>

      <div id="chart-container" className="chart-container">
        <h3>
          Biểu đồ {activeTab === "revenue" ? "Doanh Thu" : "Giảm Giá"} Theo
          Tháng
        </h3>
        <ResponsiveContainer width="100%" height={500}>
          {activeTab === "revenue" ? (
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) =>
                  formatCurrency(value).replace("₫", "")
                }
                width={100}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => `Tháng ${label.split("/")[0]}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="doanhThu"
                stroke="#4e73df"
                name="Doanh thu thực tế"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="originalTotal"
                stroke="#1cc88a"
                name="Doanh thu gốc"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          ) : (
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) =>
                  formatCurrency(value).replace("₫", "")
                }
                width={100}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => `Tháng ${label.split("/")[0]}`}
              />
              <Legend />
              <Bar
                dataKey="totalDiscount"
                name="Tổng giảm giá"
                fill="#f6c23e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="productDiscount"
                name="Giảm giá sản phẩm"
                fill="#36b9cc"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="couponDiscount"
                name="Giảm giá từ mã"
                fill="#e74a3b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatisticsManagement;
