import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import "../styles/Navbar.css";
import { getUserById } from "../services/userServicesAdmin";
import defaultAvatar from "../assets/avatar-default.jpg"; // <== thêm dòng này

const Navbar = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        try {
          const data = await getUserById(userId);
          setUser(data.user);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
      }
    };

    fetchUser();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <h1>WatchThis</h1>
        <div className="navbar-links">
          {/* Notification */}
          {/* <button className="navbar-link notify-btn">
            <FaRegBell />
          </button> */}
          {/* Avatar + Dropdown */}
          <div className="avatar-dropdown">
            <img
              src={user?.avatar || defaultAvatar}
              alt="Avatar"
              className="navbar-avatar"
              onClick={() => setShowDropdown((prev) => !prev)}
            />
            {showDropdown && (
              <div className="dropdown-menu">
                <button
                  onClick={() => {
                    navigate(`/dashboard/profile-management/${userId}`);
                    setShowDropdown(false);
                  }}
                >
                  <FaUser /> Tài khoản
                </button>
                <button onClick={handleLogout}>
                  <FaSignOutAlt /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
