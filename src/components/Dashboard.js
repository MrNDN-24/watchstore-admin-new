import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import ProductManagement from "./ProductManagement";
import CustomerManagement from "./CustomerManagement";
import OrderAdminManagement from "./OrderAdminManagement";
import UserManagement from "./UserManagement";
import InventoryManagement from "./InventoryManagement";
import Statistics from "./StatisticsManagement";
import OrderDeliveryStaffManagement from "./OrderDeliveryStaffManagement";
import BrandManagement from "./BrandManagement";
import CategoryManagement from "./CategoryManagement";
import StyleManagement from "./StyleManagement";
import ImageManagement from "./ImageManagement";
import DiscountManagement from "./DiscountManagement";
import OrderSaleManagement from "./OrderSaleManagement";
import OrderDetailManagement from "./OrderDetailManagement";
import CustomerCare from "./CustomerCare";
import ProfileManagement from "./ProfileManagement";
import ActionProductManagement from "./ActionProductManagement";
import TopProductManagement from "./TopProductManagement";
import BlogManagement from "./BlogManagement";
import ChatMessageManagement from "./ChatMessageManagement";
import ActivityManagement from "./ActivityManagement";
import PaymentManagement from "./PaymentManagement.js";
import "../styles/Sidebar.css";
import { useEffect } from "react";
import io from "socket.io-client";
import { getSupportQueue } from "../services/supportQueueServicesAdmin.js";

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("isSidebarCollapsed") === "true";
  });

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };
  const [hasNewSupportRequest, setHasNewSupportRequest] = useState(false);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_SOCKET_ADMIN);

    // Hàm lấy hàng chờ hiện tại khi load trang
    async function fetchPendingSupportQueue() {
      try {
        const res = await getSupportQueue();
        console.log(res); // res có dạng { queue: [...] }
        const data = res.queue; // Lấy mảng hàng chờ từ trường queue

        if (Array.isArray(data)) {
          setHasNewSupportRequest(data.length > 0);
        } else {
          setHasNewSupportRequest(false);
        }
      } catch (error) {
        console.error("Failed to fetch support queue", error);
        setHasNewSupportRequest(false);
      }
    }
    fetchPendingSupportQueue(); // gọi lấy hàng chờ khi load trang

    socket.on("supportQueueUpdated", (newQueue) => {
      if (Array.isArray(newQueue)) {
        setHasNewSupportRequest(newQueue.length > 0);
      } else {
        setHasNewSupportRequest(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div
      className={`dashboard-container ${isSidebarCollapsed ? "collapsed" : ""}`}
    >
      <Sidebar
        onToggle={handleSidebarToggle}
        hasNewSupportRequest={hasNewSupportRequest}
      />
      <div
        className={`content-container ${isSidebarCollapsed ? "expanded" : ""}`}
      >
        <Routes>
          <Route path="product-management" element={<ProductManagement />} />
          <Route path="customer-management" element={<CustomerManagement />} />
          <Route
            path="orderAdmin-management"
            element={<OrderAdminManagement />}
          />
          <Route
            path="orderSale-management"
            element={<OrderSaleManagement />}
          />
          <Route path="user-management" element={<UserManagement />} />
          <Route
            path="inventory-management"
            element={<InventoryManagement />}
          />
          <Route path="statistics" element={<Statistics />} />
          <Route
            path="delivery-status"
            element={<OrderDeliveryStaffManagement />}
          />
          <Route path="brand-management" element={<BrandManagement />} />
          <Route path="category-management" element={<CategoryManagement />} />
          <Route path="style-management" element={<StyleManagement />} />
          <Route
            path="image-management/:productId"
            element={<ImageManagement />}
          />
          <Route path="discount-management" element={<DiscountManagement />} />
          <Route
            path="orderdetail-management/:orderId"
            element={<OrderDetailManagement />}
          />
          <Route path="customer-care" element={<CustomerCare />} />
          <Route
            path="profile-management/:userId"
            element={<ProfileManagement />}
          />
          <Route
            path="action-product/:action/:productId?"
            element={<ActionProductManagement />}
          />
          <Route path="top-product" element={<TopProductManagement />} />
          <Route
            path="chat-message"
            element={
              <ChatMessageManagement
                setHasNewSupportRequest={setHasNewSupportRequest}
              />
            }
          />

          <Route path="blog-management" element={<BlogManagement />} />
          <Route path="activity-management" element={<ActivityManagement />} />
          <Route path="payment-management" element={<PaymentManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
