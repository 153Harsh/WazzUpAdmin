import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import "./Sidebar.css";
import toast from "react-hot-toast";
import { BsChatText } from "react-icons/bs";
import { MdCampaign, MdLogout } from "react-icons/md";
import { HiTemplate } from "react-icons/hi";
import { LuContact } from "react-icons/lu";
import { TiFlowMerge } from "react-icons/ti";
import { MdLibraryBooks } from "react-icons/md";
import { io } from "socket.io-client";
import logo from "../../assets/Icon.png";
import axios from "axios";
import { apiGet } from "../../utils/api";
// Add this after your imports
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
const NAV_ITEMS = [
  { key: "reports", icon: BsChatText, label: "Live Chats" },
  { key: "contactList", icon: LuContact, label: "Contacts" },
  { key: "campaign", icon: MdCampaign, label: "Campaign" },
  { key: "fetchAllTemplates", icon: HiTemplate, label: "Templates" },
  { key: "flowBuilder", icon: TiFlowMerge, label: "Flow Builder" },
  { key: "flowLibrary", icon: MdLibraryBooks, label: "Library" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);

  const [menuItem, setMenuItem] = useState("");
 const userId = localStorage.getItem("UserId"); // ObjectId for API
const adminIdDisplay = localStorage.getItem("AdminId"); 
  const [msgCountUnread, setMsgCountUnread] = useState(0);
  const [queryData, setQueryData] = useState([]);
  const dbType = localStorage.getItem("dbType");
// Add this useEffect after your state declarations
useEffect(() => {
  if (userId && !isValidObjectId(userId)) {
    console.error('Invalid ObjectId format in Sidebar:', userId);
    toast.error('Invalid session. Please login again.');
    // Optionally redirect to login
    // navigate('/');
  }
}, [userId]);
  const sendNotify = (Profile, Count) => {
    if (!("Notification" in window)) return;
    const show = () => {
      const options = {
        body: `${Profile} Send You ${Count} Message`,
        icon: `https://digilateral.com/images/digi-icon.png`,
        dir: "ltr",
      };
      new Notification("New Notification", options);
      const audio = new Audio(`${window.location.origin}/notify.mp3`);
      audio.play().catch((err) => console.log("Sound play error:", err));
    };
    if (Notification.permission === "granted") {
      show();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((p) => p === "granted" && show());
    }
  };

  const fetchUsers = async () => {
     if (!userId || !isValidObjectId(userId)) {
    console.error('Invalid userId for fetching users');
    toast.error('Invalid session');
    return;
  }
    try {
      const response = await apiGet(`/api/admin/allUsersNo/${userId}`, { page: 1, limit: 30 });
      const newData = response.data.data;
      setMsgCountUnread(newData.filter((item) => item.adminReadLast === false).length);
      setQueryData(newData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => { fetchUsers(); }, [dbType]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    socketRef.current = io(API_URL, { query: { dbType } });
    return () => { socketRef.current?.disconnect(); };
  }, [dbType]);

  useEffect(() => {
    if (!socketRef.current) return;
    const normalizePhone = (phone = "") => String(phone || "").replace(/\D/g, "");
    const isMatchingPhone = (a, b) => {
      const normA = normalizePhone(a);
      const normB = normalizePhone(b);
      return normA && normB && normA === normB;
    };

    const handleUpdateMsg = (data) => {
      setQueryData((prev) => {
        const index = prev.findIndex((item) => isMatchingPhone(item.From, data.From || data.from));
        if (index !== -1) {
          const existing = prev[index];
          const msgChanged = JSON.stringify(existing.Messages) !== JSON.stringify(data.Messages);
          const readChanged = existing.adminReadLast !== data.adminReadLast;
          if (msgChanged || readChanged) {
            const updated = [...prev];
            updated[index] = { ...existing, ...(msgChanged && { Messages: data.Messages }), lastTimeStamp: data.lastTimeStamp, adminReadLast: data.adminReadLast, msgCount: data.msgCount };
            const unread = updated.filter((i) => i.adminReadLast === false).length;
            setMsgCountUnread(unread);
            if (Array.isArray(data.Messages) && data.Messages.length > 0) {
              const last = data.Messages[data.Messages.length - 1];
              if (last.userType === "User") sendNotify(data.profile, unread);
            }
            return updated;
          }
          return prev;
        }
        return [...prev, data];
      });
    };
    socketRef.current.on("UpdateMsg", handleUpdateMsg);
    return () => { socketRef.current?.off("UpdateMsg", handleUpdateMsg); };
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;
    const handleUpdateRead = (data) => {
      setQueryData((prev) => {
        const index = prev.findIndex((item) => item.From === data.From);
        if (index !== -1) {
          const existing = prev[index];
          const msgChanged = JSON.stringify(existing.Messages) !== JSON.stringify(data.Messages);
          const readChanged = existing.adminReadLast !== data.adminReadLast;
          if (msgChanged || readChanged) {
            const updated = [...prev];
            updated[index] = { ...existing, ...(msgChanged && { Messages: data.Messages }), lastTimeStamp: data.lastTimeStamp, adminReadLast: data.adminReadLast, msgCount: data.msgCount };
            setMsgCountUnread(updated.filter((i) => i.adminReadLast === false).length);
            return updated;
          }
          return prev;
        }
        return [...prev, data];
      });
    };
    socketRef.current.on("UpdateRead", handleUpdateRead);
    return () => { socketRef.current?.off("UpdateRead", handleUpdateRead); };
  }, []);

  const navActions = {
    reports: () => navigate(`/replyPage/${userId}?dbType=${dbType}`),
    contactList: () => navigate(`/contactList/${userId}?dbType=${dbType}`),
    campaign: () => navigate(`/campaign/${userId}?dbType=${dbType}`),
    fetchAllTemplates: () => navigate(`/fetchAllTemplates/${userId}?dbType=${dbType}`),
    flowBuilder: () => navigate(`/new-flow-builder/${userId}?dbType=${dbType}`),
    flowLibrary: () => navigate(`/flowLibrary/${userId}?dbType=${dbType}`),
  };

useEffect(() => {
  const p = location.pathname;

  if (p.includes("/replyPage/")) {
    setMenuItem("reports");
  } else if (p.includes("/contactList/")) {
    setMenuItem("contactList");
  } else if (p.includes("/campaign/")) {
    setMenuItem("campaign");
  } else if (p.includes("/fetchAllTemplates/")) {
    setMenuItem("fetchAllTemplates");
  } else if (p.includes("/new-flow-builder/")) {
    setMenuItem("flowBuilder");
  } else if (p.includes("/flowLibrary/")) {
    setMenuItem("flowLibrary");
  }
}, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    toast.success("Logout success", { duration: 2000 });
  };

  return (
    <aside
      id="logo-sidebar"
      className="fixed top-0 left-0 z-10 h-full sm:translate-x-0 -translate-x-full"
      style={{
        width: "62px",
        background: "linear-gradient(180deg, #0a3d2e 0%, #064e3b 60%, #053a2c 100%)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "2px 0 12px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "0",
        paddingBottom: "18px",
      }}
      aria-label="Sidebar"
    >
      {/* Logo */}
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px 0 12px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "16px",
          }}
        >
          <img src={logo} alt="logo" width={28} style={{ borderRadius: "6px" }} />
        </div>

        {/* Nav Items */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          {NAV_ITEMS.map(({ key, icon: Icon, label }) => (
            <li key={key}>
              <div
                className={`sidebar-nav-item${menuItem === key ? " active" : ""}`}
                onClick={navActions[key]}
              >
                <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Icon size={22} />
                  {key === "reports" && msgCountUnread > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: "9px",
                        fontWeight: 700,
                        borderRadius: "9999px",
                        minWidth: "17px",
                        height: "17px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 3px",
                        lineHeight: 1,
                      }}
                    >
                      {msgCountUnread > 99 ? "99+" : msgCountUnread}
                    </span>
                  )}
                </span>
                <span className="tooltip">{label}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
        <div className="sidebar-divider" />
        <div
          className="sidebar-nav-item"
          onClick={handleLogout}
          style={{ marginTop: "10px", color: "rgba(255,100,100,0.75)" }}
        >
          <MdLogout size={22} />
          <span className="tooltip">Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
