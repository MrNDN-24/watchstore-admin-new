import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaChartBar,
  FaTags,
  FaBox,
  FaCogs,
  FaUsers,
  FaShippingFast,
  FaListAlt,
  FaAppleAlt,
  FaChevronDown,
  FaChevronUp,
  FaClipboardList,
  FaShoppingCart,
  FaFileAlt,
  FaRegCommentDots,
  FaTasks,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillWave,
} from "react-icons/fa";
import Navbar from "./Navbar";
import useAuth from "../hooks/useAuth";
import "../styles/Sidebar.css";
import { useLocation } from "react-router-dom";

const Sidebar = ({ onToggle, hasNewSupportRequest }) => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isProductManagementOpen, setProductManagementOpen] = useState(false);
  const [isBarManagementOpen, setBarManagementOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    localStorage.setItem("isSidebarCollapsed", newCollapsedState);
    onToggle(newCollapsedState);
  };

  const toggleProductManagement = () => {
    const newState = !isProductManagementOpen;
    setProductManagementOpen(newState);
    localStorage.setItem("isProductManagementOpen", newState);
  };

  const toggleBarManagement = () => {
    const newState = !isBarManagementOpen;
    setBarManagementOpen(newState);
    localStorage.setItem("isBarManagementOpen", newState);
  };

  useEffect(() => {
    const savedProductOpen =
      localStorage.getItem("isProductManagementOpen") === "true";
    const savedBarOpen = localStorage.getItem("isBarManagementOpen") === "true";
    const savedCollapsed =
      localStorage.getItem("isSidebarCollapsed") === "true";
    setProductManagementOpen(savedProductOpen);
    setBarManagementOpen(savedBarOpen);
    setIsCollapsed(savedCollapsed);
  }, []);

  useEffect(() => {
    if (role && isFirstRender && location.pathname === "/dashboard") {
      if (role === "admin") {
        navigate("/dashboard/statistics");
      } else if (role === "salesperson") {
        navigate("/dashboard/orderSale-management");
      } else if (role === "deliverystaff") {
        navigate("/dashboard/delivery-status");
      }
      setIsFirstRender(false);
    }
  }, [role, navigate, isFirstRender, location]);
  return (
    <div className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
      <Navbar />
      <div className="sidebar">
        <button className="collapse-btn" onClick={toggleSidebar}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
        <nav>
          <ul>
            {role === "admin" && (
              <>
                <li>
                  <a
                    href="#!"
                    className="menu-toggle"
                    onClick={toggleBarManagement}
                  >
                    <FaChartBar /> {!isCollapsed && "Báo cáo và thống kê"}
                    {!isCollapsed &&
                      (isBarManagementOpen ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      ))}
                  </a>
                  {isBarManagementOpen && (
                    <ul className="submenu">
                      <li>
                        <NavLink
                          to="/dashboard/statistics"
                          className={({ isActive }) =>
                            isActive ? "active" : ""
                          }
                        >
                          <FaClipboardList />  <span>Thống kê tổng quan</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/dashboard/top-product"
                          className={({ isActive }) =>
                            isActive ? "active" : ""
                          }
                        >
                          <FaShoppingCart /> <span>Sản phẩm bán chạy</span>
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <a
                    href="#!"
                    className="menu-toggle"
                    onClick={toggleProductManagement}
                  >
                    <FaBox /> {!isCollapsed && "Quản lý sản phẩm"}
                    {!isCollapsed &&
                      (isProductManagementOpen ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      ))}
                  </a>
                  {isProductManagementOpen && (
                    <ul className="submenu">
                      <li>
                        <NavLink
                          to="/dashboard/brand-management"
                          className={({ isActive }) =>
                            isActive ? "active" : ""
                          }
                        >
                          <FaAppleAlt /> <span>Thương hiệu</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/dashboard/category-management"
                          className={({ isActive }) =>
                            isActive ? "active" : ""
                          }
                        >
                          <FaTags /> <span>Danh Mục</span> 
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/dashboard/product-management"
                          className={({ isActive }) =>
                            isActive ? "active" : ""
                          }
                        >
                          <FaListAlt /> <span> Sản Phẩm</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/dashboard/style-management"
                          className={({ isActive }) =>
                            isActive ? "active" : ""
                          }
                        >
                          <FaCogs /> <span>Phong Cách</span>
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <NavLink
                    to="/dashboard/customer-management"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FaUsers /> {!isCollapsed && "Quản lý khách hàng"}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/orderAdmin-management"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FaBox /> {!isCollapsed && "Quản lý đơn hàng"}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/payment-management"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FaMoneyBillWave /> {!isCollapsed && "Quản lý thanh toán"}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/user-management"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FaUsers /> {!isCollapsed && "Quản lý nhân viên"}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/discount-management"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FaTags /> {!isCollapsed && "Quản lý khuyến mãi"}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/blog-management"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FaFileAlt /> {!isCollapsed && "Quản lý bài viết"}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/activity-management"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FaTasks /> {!isCollapsed && "Quản lý hoạt động"}
                  </NavLink>
                </li>
              </>
            )}
            {role === "salesperson" && (
              <>
                <li>
                  <NavLink
                    to="/dashboard/orderSale-management"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FaBox /> {!isCollapsed && "Quản lý đơn hàng"}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/chat-message"
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FaRegCommentDots />
                    {!isCollapsed && (
                      <>
                        Tin nhắn
                        {hasNewSupportRequest && (
                          <span className="new-badge"></span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              </>
            )}
            {role === "deliverystaff" && (
              <li>
                <NavLink
                  to="/dashboard/delivery-status"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FaShippingFast />{" "}
                  {!isCollapsed && "Quản lý trạng thái giao hàng"}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
