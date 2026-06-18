import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaDownload, FaSearch } from "react-icons/fa";
import "../reports-shared.css";
import toast from "react-hot-toast";

// Add this after your imports
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
// Helper function to get dbType
// Update the getDbType function to be safer
const getDbType = () => {
  const dbType = localStorage.getItem("dbType");
  return dbType === "company" ? "company" : "demo";
};

export const Reports = () => {
  const pageName = "User Reports";
  const colors = ["#8536D8", "#3498db", "#27ae60"];
  const [pdpSavedDetails, setPdpSavedDetails] = useState([]);
  const { id: userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentPdp, setCurrentPdp] = useState(null);
  const [showMoreColumns, setShowMoreColumns] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);
// Add this state with your other states
const [dbType, setDbType] = useState(getDbType());
  const navigate = useNavigate();
useEffect(() => {
  const handleDbChanged = (e) => {
    console.log("DB Changed in Reports:", e.detail);
    setDbType(e.detail);
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
      console.error('Invalid userId for fetching reports');
      setError('Invalid session');
      setLoading(false);
      return;
    }
    
      try {
        const dbType = getDbType();
        const response = await axios.get(
          `http://localhost:7821/api/admin/allUserData/${userId}`,
          { params: { dbType } }
        );
        console.log("[UserReports] allUserData response:", response.data);
        console.log(
          "[UserReports] received count =",
          Array.isArray(response.data?.data) ? response.data.data.length : "not-array"
        );
        setPdpSavedDetails(response.data.data.reverse());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [userId,dbType]);
// Add this after your other useEffects
useEffect(() => {
  if (userId && !isValidObjectId(userId)) {
    console.error('Invalid ObjectId format in Reports:', userId);
    toast.error('Invalid session. Please login again.');
  }
}, [userId]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const handleDelete = async (formId) => {
    if (!userId || !isValidObjectId(userId)) {
    toast.error("Invalid session. Please login again.");
    return;
  }
  
  if (!formId || !isValidObjectId(formId)) {
    toast.error("Invalid form ID");
    return;
  }
    try {
      const dbType = getDbType();
      await axios.delete(
        `http://localhost:7821/api/admin/deleteForm/${userId}/${formId}`,
        { params: { dbType } }
      );
      setPdpSavedDetails(prev => prev.filter(item => item._id !== formId));
      toast.success("Form deleted successfully");
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error("Failed to delete form");
    }
  };

  const exportToExcel = (data) => {
    const formattedData = data.map(item => ({
      Name: item.Name,
      Phone: item.Phone,
      MotherName: item.MotherName,
      DateOfCreation: item.DateOfCreation,
      Time: item.DOC ? new Date(item.DOC).toTimeString().split(' ')[0] : "-",
      Status: item.Status === true ? "Success" : item.Status === false ? "Failed" : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, 'MothersDay_Data.xlsx');
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredData = search
    ? pdpSavedDetails.filter(
        (status) =>
          status.Phone?.includes(search) ||
          status.Name?.toLowerCase().includes(search.toLowerCase()) ||
          status.MotherName?.toLowerCase().includes(search.toLowerCase())
      )
    : pdpSavedDetails;

  return (
    <div className="reports-page">
      <Header pageName={pageName} />
      <div className="reports-toolbar">
        <div className="reports-search-box">
          <FaSearch size={13} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Search by phone number, name..." 
            onChange={handleSearchChange} 
            value={search}
          />
        </div>
        <button className="reports-download-btn" onClick={() => exportToExcel(filteredData)}>
          <FaDownload size={13} /> Download
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No data available</p>
        </div>
      ) : (
        <div className="reports-table-wrap scrollbar-hidden">
          <table className="reports-table">
            <thead>
              <tr>
                {["SR.No", "Name", "Mother's Name", "Phone Number", "Date", "Time", "Status"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((pdp, index, arr) => (
                <tr key={pdp._id || index}>
                  <td>{arr.length - index}</td>
                  <td>{pdp?.Name || "-"}</td>
                  <td>{pdp?.MotherName || "-"}</td>
                  <td>{pdp?.Phone || "-"}</td>
                  <td>{pdp?.DateOfCreation || "-"}</td>
                  <td>{pdp?.DOC ? new Date(pdp.DOC).toTimeString().split(" ")[0] : "-"}</td>
                  <td>
                    {pdp?.Status === true
                      ? <span className="status-badge status-success">✓</span>
                      : pdp?.Status === false
                      ? <span className="status-badge status-failed">✕</span>
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-sm text-gray-600">Are you sure you want to delete this form?</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={async () => { 
                  await handleDelete(selectedFormId); 
                  setShowModal(false); 
                }} 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};