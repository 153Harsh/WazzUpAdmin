import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaDownload, FaSearch } from "react-icons/fa";
import "../reports-shared.css";
// Add this after your imports
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
// Helper function to get dbType
// Update the getDbType function
const getDbType = () => {
  const dbType = localStorage.getItem("dbType");
  return dbType === "company" ? "company" : "demo";
};
export const MessageReports = () => {
  const pageName = "Message Status";
  const colors = ["#8536D8", "#3498db", "#27ae60"];
  const [messageReports, setMessageReports] = useState([]);
  const { id: userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentPdp, setCurrentPdp] = useState(null);
const [dbType, setDbType] = useState(getDbType());

// Add this useEffect for dbType changes
useEffect(() => {
  const handleDbChanged = (e) => {
    console.log("DB Changed in MessageReports:", e.detail);
    setDbType(e.detail);
    // Refresh data when db changes
    setLoading(true);
  };

  window.addEventListener("dbChanged", handleDbChanged);

  return () => {
    window.removeEventListener("dbChanged", handleDbChanged);
  };
}, []);
  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!userId || !isValidObjectId(userId)) {
      console.error('Invalid userId for fetching message reports');
      setError('Invalid session');
      setLoading(false);
      return;
    }
      try {
        const dbType = getDbType();
        const response = await axios.get(
          `http://localhost:7821/api/admin/FaliedMessages/${userId}`,
          { params: { dbType } }
        );
        setMessageReports(response.data.data.reverse());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
}, [userId, dbType]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();

  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp * 1000);
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDateStamp = (timestamp) => {
    const messageDate = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday =
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();

    const isYesterday =
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear();

    return messageDate.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const exportToExcel = (data) => {
    const formattedData = data.map((item) => ({
      Name: item?.profile,
      Phone: item.phoneNumber,
      DateOfCreation: formatDateStamp(item.timestamp),
      Time: formatTimestamp(item.timestamp),
      Status: item?.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Message_Status_Data.xlsx");
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredData = search
    ? messageReports.filter((status) => 
        status.phoneNumber?.includes(search) || 
        status.profile?.toLowerCase().includes(search.toLowerCase())
      )
    : messageReports;

  // Sort data once for display
  const sortedData = [...filteredData].sort((a, b) => b.timestamp - a.timestamp);
// Add this after your other useEffects
useEffect(() => {
  if (userId && !isValidObjectId(userId)) {
    console.error('Invalid ObjectId format in MessageReports:', userId);
  }
}, [userId]);
  return (
    <div className="reports-page">
      <Header pageName={pageName} />
      <div className="reports-toolbar">
        <div className="reports-search-box">
          <FaSearch size={13} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Search by phone number or name…" 
            onChange={handleSearchChange}
            value={search}
          />
        </div>
        <button 
          className="reports-download-btn" 
          onClick={() => exportToExcel(sortedData)}
          disabled={sortedData.length === 0}
        >
          <FaDownload size={13} /> Download
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
        </div>
      ) : sortedData.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No message status data available</p>
        </div>
      ) : (
        <div className="reports-table-wrap scrollbar-hidden">
          <table className="reports-table">
            <thead>
              <tr>
                {["SR.No", "Name", "Phone Number", "Date", "Time", "Status"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((msg, index, arr) => (
                <tr key={msg.messageId || msg.phoneNumber || index}>
                  <td>{arr.length - index}</td>
                  <td>{msg?.profile || "-"}</td>
                  <td>{msg?.phoneNumber || "-"}</td>
                  <td>{formatDateStamp(msg.timestamp)}</td>
                  <td>{formatTimestamp(msg.timestamp)}</td>
                  <td>
                    {msg?.status === "read" ? (
                      <span className="status-badge status-read" title="Read">✓ Read</span>
                    ) : msg?.status === "delivered" ? (
                      <span className="status-badge status-delivered" title="Delivered">✓ Delivered</span>
                    ) : msg?.status === "sent" ? (
                      <span className="status-badge status-sent" title="Sent">✓ Sent</span>
                    ) : msg?.status === "failed" ? (
                      <span className="status-badge status-failed" title="Failed">✕ Failed</span>
                    ) : (
                      <span className="status-badge status-sent" title="Sent">✓ Sent</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};