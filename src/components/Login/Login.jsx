import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";
import Image from "../../assets/Icon.png";
import { FaLock, FaUserLarge,FaRegUser  } from "react-icons/fa6";
import { LuUserRound } from "react-icons/lu";


const Login = () => {
  const navigate = useNavigate();
  const [EMPID, setEMPID] = useState("");
  const [Password, setPassword] = useState("");

  const handleUserData = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:7821/api/admin/login-admin",
        {
          AdminId: EMPID,
          Password: Password,
        }
      );

      if (response.data.success === true) {
        // 🔥 Use ObjectId (_id) as the primary identifier
        const userId = response.data.data._id;        // MongoDB ObjectId
        const userType = response.data.data.role;
        const userName = response.data.data.AdminName;
        const adminId = response.data.data.AdminId;   // Keep for display if needed
        const BusinessUnit = response.data.data.CompanyName;

        // 🔥 Store ObjectId as the main identifier
        localStorage.setItem("UserId", userId);       // ObjectId for API calls
        localStorage.setItem("UserName", userName);
        localStorage.setItem("AdminId", adminId);     // String ID for display only
        localStorage.setItem("UserType", userType);
        localStorage.setItem("BusinessUnit", BusinessUnit);

        // 🔥 Navigate using ObjectId
        toast.success("Login Success", { duration: 2000 });
        navigate(`/replyPage/${userId}`);  // ← Use userId (ObjectId) instead of adminId
      } else {
        toast.error(response.data.message || "Login failed", {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-avatar">
          <LuUserRound size={48} color="white" />
        </div>
        <div className="login-title">Welcome Back</div>
        <div className="login-subtitle">Sign in to your account</div>
        <form onSubmit={handleUserData}>
          <div className="login-input-group">
            <FaUserLarge size={16} />
            <input
              id="email"
              value={EMPID}
              onChange={(e) => setEMPID(e.target.value)}
              type="text"
              name="email"
              placeholder="User ID"
            />
          </div>
          <div className="login-input-group">
            <FaLock size={16} />
            <input
              type="password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              id="password"
              placeholder="Password"
            />
          </div>
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;