import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../Header/Header";
import toast from "react-hot-toast";
import { RxCrossCircled } from "react-icons/rx";
import { TableVirtuoso } from "react-virtuoso";
import { TbBroadcast } from "react-icons/tb";
import { io } from "socket.io-client";
import { FaSearch } from "react-icons/fa";
import { TiFilter } from "react-icons/ti";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { RiResetRightLine } from "react-icons/ri";
import "./Campaign.css";

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const AllCampaign = () => {
  const pageName = "Campaigns";
  const [messageReports, setMessageReports] = useState([]);
  const { id: userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [search1, setSearch1] = useState("");
  const [allContactsData, setAllContactsData] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [showBroadCastMsg, setBroadCastMsg] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [checkedItems, setCheckedItems] = useState([]);
  const [showContactPage, setContactPage] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const socketRef = useRef(null);
  const [selectedName, setSelectedName] = useState("");
  const [selectedProfileName, setSelectedProfileName] = useState("");
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedCompanyEmail, setSelectedCompanyEmail] = useState("");
  const [selectedPersonalEmail, setSelectedPersonalEmail] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [resetFilters, setResetFilters] = useState(false);
  const [filteredData1, setFilteredData1] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const pageSize = 50;
  const [loadingContent, setLoadingContent] = useState(false);
  
  // ✅ FORCE DEMO DATABASE ONLY - NEVER USE COMPANY DB
  const currentDb = "demo";
  
  const navigate = useNavigate();

  // Initialize socket connection with demo db only
  useEffect(() => {
    if (!userId || !isValidObjectId(userId)) {
      console.error('Invalid userId for socket connection');
      return;
    }
    
    socketRef.current = io("http://localhost:7821", {
      query: { dbType: "demo" }, // ✅ Force demo
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  // Set up socket listeners
  useEffect(() => {
    if (!socketRef.current) return;

    const handleCampaingUpdate = async (data) => {
      if (!userId || !isValidObjectId(userId)) {
        console.error('Invalid userId in socket update');
        return;
      }
      const response = await axios.get(
        `http://localhost:7821/api/admin/getAll-createdCampaign/${userId}`,
        { params: { dbType: "demo" } } // ✅ Force demo
      );
      setMessageReports(response.data.data.reverse());
    };
    
    socketRef.current.on("CampaignUpdated", handleCampaingUpdate);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off("CampaignUpdated", handleCampaingUpdate);
      }
    };
  }, [userId]);

  // Fetch contacts
  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!userId || !isValidObjectId(userId)) {
        console.error('Invalid userId for fetching contacts');
        toast.error('Invalid session');
        return;
      }
      setLoadingContent(true);
      try {
        const response = await axios.get(
          `http://localhost:7821/api/admin/getAllUserContacts/${userId}`,
          {
            params: {
              page,
              limit,
              search,
              selectedName,
              selectedProfileName,
              selectedCompanyName,
              selectedDesignation,
              selectedCompanyEmail,
              selectedPersonalEmail,
              selectedTag,
              groupName: selectedGroup,
              dbType: "demo" // ✅ Force demo
            }
          }
        );
        setAllContactsData(response.data.data);
        setTotalCount(response.data.totalCount);
        setLoadingContent(false);
      } catch (err) {
        setError(err.message);
        setLoadingContent(false);
      } finally {
        setLoading(false);
        setLoadingContent(false);
      }
    };

    fetchPlanDetails();
  }, [
    page,
    search,
    selectedName,
    selectedProfileName,
    selectedCompanyEmail,
    selectedPersonalEmail,
    selectedTag,
    selectedCompanyName,
    selectedDesignation,
    resetFilters,
    selectedGroup,
    userId,
    limit,
  ]);

  const handleCheckboxChange = (id) => {
    setCheckedItems(
      (prev) =>
        prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id]
    );
  };

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!userId || !isValidObjectId(userId)) {
        console.error('Invalid userId for fetching templates');
        return;
      }
      try {
        const response = await axios.get(`/api/admin/fetchAllTemplates/${userId}`, {
          params: { dbType: "demo" } // ✅ Force demo
        });
        setTemplates(response.data.data || []);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, [userId]);

  // Validate userId
  useEffect(() => {
    if (userId && !isValidObjectId(userId)) {
      console.error('Invalid ObjectId format in AllCampaign:', userId);
      toast.error('Invalid user session. Please login again.');
    }
  }, [userId, navigate]);

  const handleDateChange = (e) => {
    const value = e.target.value;
    const parts = value.split("-");
    const formatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
    setScheduledDate(formatted);
  };

  // Fetch campaigns
  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!userId || !isValidObjectId(userId)) {
        console.error('Invalid userId for fetching campaigns');
        toast.error('Invalid session');
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:7821/api/admin/getAll-createdCampaign/${userId}`,
          { params: { dbType: "demo" } } // ✅ Force demo
        );
        setMessageReports(response.data.data.reverse());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
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
    const messageDate = new Date(timestamp);
    return messageDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchChange1 = (e) => {
    setSearch1(e.target.value);
  };

  const getUniqueColor = (tag) => {
    const colors = [
      "#6366F1", "#10B981", "#EF4444", "#8B5CF6", "#14B8A6",
      "#E11D48", "#F59E0B", "#7C3AED", "#F97316", "#059669", "#EC4899"
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const handleCreateCampaign = async () => {
    if (!userId || !isValidObjectId(userId)) {
      toast.error("Invalid session. Please login again.");
      return;
    }
    
    if (!campaignName) {
      toast.error("Please enter campaign name");
      return;
    }
    
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }
    
    if (checkedItems.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }
    
    try {
      setLoadingBtn(true);
      const sendTemplate = await axios.post(
        `http://localhost:7821/api/admin/create-Campaign/${userId}`,
        {
          CampainName: campaignName,
          TemplateName: selectedTemplate,
          ContactNo: checkedItems,
          dbType: "demo" // ✅ Force demo
        }
      );
      setLoadingBtn(false);
      setCheckedItems([]);
      setBroadCastMsg(false);
      toast.success("Template Send Success");
    } catch (error) {
      setLoadingBtn(false);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  const groupOptions = [
    ...new Set(
      allContactsData
        .flatMap((item) => item.GroupName || [])
        .filter(Boolean)
    ),
  ];

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    setFilterType("group");
    setDropdownVisible(false);
  };

  useEffect(() => {
    const newFiltered1 = allContactsData
      .filter((item) => {
        if (filterType === "group" && selectedGroup) {
          return (
            Array.isArray(item.GroupName) &&
            item.GroupName.includes(selectedGroup)
          );
        }
        return true;
      })
      .filter((item, index, self) => {
        if (filterType === "all") {
          return (
            index === self.findIndex((t) => t.From === item.From)
          );
        }
        return true;
      })
      .filter((item) => {
        if (selectedName) {
          return item.Name === selectedName;
        } else if (selectedProfileName) {
          return item.profile === selectedProfileName;
        } else if (selectedCompanyName) {
          return item.CompanyName === selectedCompanyName;
        } else if (selectedDesignation) {
          return item.Designation === selectedDesignation;
        } else if (selectedCompanyEmail) {
          return item.CompanyEmail === selectedCompanyEmail;
        } else if (selectedPersonalEmail) {
          return item.PersonalEmail === selectedPersonalEmail;
        } else if (selectedTag) {
          return Array.isArray(item.tags) && item.tags.includes(selectedTag);
        }
        return true;
      })
      .filter((item) => {
        if (!search1) return true;

        const searchTerm = search1.toLowerCase();
        const fields = [
          item?.profile,
          item?.From,
          item?.Name,
          item?.CompanyName,
          item?.Designation,
          item?.PersonalEmail,
          item?.CompanyEmail,
        ];

        const matchesFields = fields.some((field) =>
          field?.toLowerCase().includes(searchTerm)
        );

        const matchesTags = Array.isArray(item?.tags)
          ? item.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
          : false;

        return matchesFields || matchesTags;
      });

    setFilteredData1(newFiltered1);

    const filtersApplied =
      filterType !== "all" ||
      selectedGroup ||
      selectedName ||
      selectedProfileName ||
      selectedCompanyName ||
      selectedDesignation ||
      selectedCompanyEmail ||
      selectedPersonalEmail ||
      selectedTag ||
      search1;

    setFilteredCount(filtersApplied ? newFiltered1.length : 0);
  }, [
    filterType,
    selectedGroup,
    allContactsData,
    selectedName,
    selectedProfileName,
    selectedCompanyName,
    selectedDesignation,
    selectedCompanyEmail,
    selectedPersonalEmail,
    selectedTag,
    resetFilters,
    search1,
  ]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData1.slice(start, start + pageSize);
  }, [filteredData1, page]);

  const filteredData = search
    ? messageReports.filter((item) => {
        const searchTerm = search.toLowerCase();
        const matchesProfile = item?.profile?.toLowerCase()?.includes(searchTerm);
        const matchesFrom = item?.From?.toLowerCase()?.includes(searchTerm);
        const matchesName = item?.Name?.toLowerCase()?.includes(searchTerm);
        const matchesCampaignName = item?.CampainName?.toLowerCase()?.includes(searchTerm);
        const matchesTemplateName = item?.TemplateName?.toLowerCase()?.includes(searchTerm);
        return matchesProfile || matchesFrom || matchesName || matchesCampaignName || matchesTemplateName;
      })
    : messageReports;

  const fetchAllContactNumbers = async () => {
    if (!userId || !isValidObjectId(userId)) {
      console.error('Invalid userId for fetching contacts');
      toast.error('Invalid session');
      return [];
    }
    try {
      const response = await axios.get(
        `http://localhost:7821/api/admin/getAllUserContactsFull/${userId}`,
        {
          params: {
            search: search1,
            selectedName,
            selectedProfileName,
            selectedCompanyName,
            selectedDesignation,
            selectedCompanyEmail,
            selectedPersonalEmail,
            selectedTag,
            groupName: selectedGroup,
            dbType: "demo" // ✅ Force demo
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all contact numbers:", error);
      return [];
    }
  };

  return (
    <div className="campaign-page">
      <Header pageName={pageName} />

      {/* Toolbar */}
      <div className="campaign-toolbar">
        <div className="campaign-search-box">
          <FaSearch size={13} color="#9ca3af" />
          <input type="text" placeholder="Search campaign name…" onChange={handleSearchChange} />
        </div>
        <button className="broadcast-btn" onClick={() => setContactPage(true)}>
          <TbBroadcast size={18} /> New Campaign
        </button>
      </div>

      {/* Table */}
      <div className="campaign-table-wrap scrollbar-hidden">
        <table className="campaign-table">
          <thead>
            <tr>
              {["Campaign Name","Template Name","Total","Sent","Delivered","Read","Failed","Replied","Created On","Completed On"].map((h) => (
                <th key={h} style={{ textAlign: h === "Campaign Name" || h === "Template Name" ? "left" : "center" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={10} style={{ height: "60vh" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600" />
                </div>
              </td></tr>
            )}
            {filteredData.map((msg, index) => (
              <tr key={index} onClick={() => navigate(`/singleCampaignDetail/${userId}`, { state: { msg } })}>
                <td>{msg?.CampainName || "-"}</td>
                <td>{msg?.TemplateName || "-"}</td>
                <td style={{ textAlign: "center" }}><span className="stat-badge stat-total">{msg?.totalContacts || "-"}</span></td>
                <td style={{ textAlign: "center" }}><span className="stat-badge stat-sent">{msg?.Sent || "-"}</span></td>
                <td style={{ textAlign: "center" }}><span className="stat-badge stat-delivered">{msg?.Delivered || "-"}</span></td>
                <td style={{ textAlign: "center" }}><span className="stat-badge stat-read">{msg?.Read || "-"}</span></td>
                <td style={{ textAlign: "center" }}><span className="stat-badge stat-failed">{msg?.Failed || "-"}</span></td>
                <td style={{ textAlign: "center" }}><span className="stat-badge stat-replied">{msg?.Replied || "-"}</span></td>
                <td style={{ textAlign: "center" }}>{msg?.createdAt ? formatDateStamp(msg.createdAt) : "-"}</td>
                <td style={{ textAlign: "center" }}>{msg?.CampainCompleted ? formatDateStamp(msg.CampainCompleted) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Campaign Modal */}
      {showBroadCastMsg && (
        <div className="campaign-modal-overlay">
          <div className="campaign-modal">
            <div className="campaign-modal-header">
              <span className="campaign-modal-title">New Campaign</span>
              <RxCrossCircled size={24} onClick={() => setBroadCastMsg(false)} style={{ cursor: "pointer", color: "#6b7280" }} />
            </div>
            <label className="campaign-form-label">Campaign Name</label>
            <input className="campaign-form-input" type="text" placeholder="Enter campaign name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
            <label className="campaign-form-label">Template</label>
            <select className="campaign-form-select" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
              <option value="">Select template</option>
              {templates.map((t, i) => <option key={i} value={t.name}>{t.name}</option>)}
            </select>
            <button className="campaign-submit-btn" onClick={handleCreateCampaign} disabled={loadingBtn}>
              {loadingBtn ? "Sending…" : "Start Broadcast"}
            </button>
          </div>
        </div>
      )}

      {/* Contact Picker Modal */}
      {showContactPage && (
        <div className="campaign-modal-overlay">
          <div className="contact-picker-modal">
            <div className="contact-picker-toolbar">
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", whiteSpace: "nowrap" }}>
                Selected: {checkedItems.length} of {totalCount}
              </span>
              <button className={`picker-filter-btn${filterType === "all" ? " active" : ""}`} onClick={() => { setFilterType("all"); setSelectedGroup(""); }}>All Contacts</button>
              <button className={`picker-filter-btn${filterType === "group" ? " active" : ""}`} onClick={() => setDropdownVisible(!dropdownVisible)}>Group By</button>
              {dropdownVisible && (
                <select className="campaign-form-select" style={{ margin: 0, width: "160px" }} value={selectedGroup} onChange={handleGroupChange}>
                  <option value="">Select Group</option>
                  {groupOptions.map((g, i) => <option key={i} value={g}>{g}</option>)}
                </select>
              )}
              <div className="contact-picker-search" style={{ flex: 1 }}>
                <FaSearch size={12} color="#9ca3af" />
                <input type="text" placeholder="Search…" onChange={handleSearchChange1} />
              </div>
              <button className="picker-reset-btn" onClick={() => { setResetFilters(true); setSelectedName(""); setSelectedProfileName(""); setSelectedCompanyName(""); setSelectedDesignation(""); setSelectedCompanyEmail(""); setSelectedPersonalEmail(""); setSelectedTag(""); setFilterType("all"); setSelectedGroup(""); setSearch1(""); setTimeout(() => setResetFilters(false), 100); setCheckedItems([]); }}>
                <RiResetRightLine /> Reset
              </button>
              <button className="picker-page-btn" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}><MdNavigateBefore size={16} /></button>
              <span style={{ fontSize: "11px", color: "#075e54", whiteSpace: "nowrap", fontWeight: 600 }}>
                {totalCount === 0 ? "0 results" : `${(page - 1) * limit + 1}–${Math.min(page * limit, totalCount)} of ${totalCount}`}
              </span>
              <button className="picker-page-btn" onClick={() => { const max = Math.ceil(totalCount / limit); setPage((p) => p < max ? p + 1 : p); }} disabled={page * limit >= totalCount}><MdNavigateNext size={16} /></button>
            </div>

            <div style={{ height: "65vh" }} className="scrollbar-hidden">
              <TableVirtuoso
                className="scrollbar-hidden"
                data={filteredData1}
                fixedHeaderContent={() => (
                  <tr>
                    <th className="px-2 py-2 text-center text-xs font-bold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10">
                      <input type="checkbox"
                        onChange={async (e) => {
                          if (e.target.checked) {
                            const all = await fetchAllContactNumbers();
                            setCheckedItems(all.map((i) => i?.From).filter(Boolean));
                          } else { setCheckedItems([]); }
                        }}
                        checked={filteredData1.length > 0 && filteredData1.every((m) => checkedItems.includes(m?.From))}
                        ref={(input) => { if (input) { const some = filteredData1.some((m) => checkedItems.includes(m?.From)); const all = filteredData1.length > 0 && filteredData1.every((m) => checkedItems.includes(m?.From)); input.indeterminate = some && !all; } }}
                      />
                    </th>
                    {["Name","Profile","Company","Designation","Tags","Phone","Created","Modified","Personal Email","Company Email"].map((col) => (
                      <th key={col} className="px-2 py-2 text-center text-xs font-bold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                )}
                itemContent={(index, msg) => (
                  <React.Fragment key={index}>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-700">
                      <input type="checkbox" checked={checkedItems.includes(msg?.From)} onChange={() => handleCheckboxChange(msg?.From)} />
                    </td>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-700">{msg?.Name || "-"}</td>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-700">{msg?.profile || "-"}</td>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-700">{msg?.CompanyName || "-"}</td>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-700">{msg?.Designation || "-"}</td>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-700">
                      {Array.isArray(msg?.tags) && msg.tags.length > 0 ? (
                        <div style={{ display: "flex", justifyContent: "center", gap: "4px", flexWrap: "wrap" }}>
                          {msg.tags.slice(-2).map((tag, i) => (
                            <span key={i} style={{ background: getUniqueColor(tag), color: "#fff", fontSize: "9px", fontWeight: 600, padding: "2px 7px", borderRadius: "20px" }}>{tag}</span>
                          ))}
                          {msg.tags.length > 2 && <span style={{ fontSize: "9px", color: "#6b7280" }}>+{msg.tags.length - 2}</span>}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-700">{msg?.From || "-"}</td>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-700">{msg?.createdAt ? formatDateStamp(msg.createdAt) : "-"}</td>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-700">{msg?.updatedAt ? formatDateStamp(msg.updatedAt) : "-"}</td>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-700">{msg?.PersonalEmail || "-"}</td>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-700">{msg?.CompanyEmail || "-"}</td>
                  </React.Fragment>
                )}
                components={{
                  Table: (props) => <table {...props} className="min-w-full divide-y divide-gray-200" />,
                  TableHead: (props) => <thead {...props} className="bg-gray-100 sticky top-0 z-10" />,
                  TableRow: (props) => <tr {...props} className="hover:bg-gray-50 transition-colors" />,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "12px", maxWidth: "280px", margin: "12px auto 0" }}>
              <button className="picker-action-btn cancel" onClick={() => { setContactPage(false); setBroadCastMsg(false); }}>Cancel</button>
              <button className="picker-action-btn next" onClick={() => { setContactPage(false); setBroadCastMsg(true); }}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};