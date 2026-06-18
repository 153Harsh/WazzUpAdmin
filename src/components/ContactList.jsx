import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "./Header/Header";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { MdCloudUpload, MdGroupAdd, MdNavigateNext, MdNavigateBefore, MdEdit, MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { RxCrossCircled } from "react-icons/rx";
import { TableVirtuoso } from "react-virtuoso";
import { TbBroadcast } from "react-icons/tb";
import { FaDownload, FaSearch } from "react-icons/fa";
import { IoIosContact } from "react-icons/io";
import debounce from "lodash/debounce";
import { RiResetRightLine } from "react-icons/ri";
import "./ContactList.css";
import { forwardRef } from "react";

const VirtuosoTable = forwardRef((props, ref) => (
  <table
    {...props}
    ref={ref}
    className="min-w-full divide-y divide-gray-200"
  />
));

const VirtuosoTableHead = forwardRef((props, ref) => (
  <thead
    {...props}
    ref={ref}
    className="bg-white sticky top-0 z-10"
  />
));

const VirtuosoTableRow = forwardRef((props, ref) => (
  <tr
    {...props}
    ref={ref}
    className="hover:bg-gray-500 transition-colors"
  />
));
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

export const ContactList = () => {
  const pageName = "Contacts";
  const [dbType, setDbType] = useState(getDbType());
  const [messageReports, setMessageReports] = useState([]);
  const [selectAllCheckItems, setSelectAllCheckItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const { id: userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [filterType, setFilterType] = useState("all");
  const [groupOptions, setGroupOptions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [allCompanyNames, setAllCompanyNames] = useState([]);
  const [allDesignations, setAllDesignations] = useState([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState(""); 
  const [campaignOptions, setCampaignOptions] = useState([]);

  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const [selectAllProgress, setSelectAllProgress] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7821/api/admin/getDistinctGroups`,
          { params: { dbType } }
        );
        setGroupOptions(response.data.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };

    fetchGroups();
  }, [userId, dbType]);
// Add this after your other useEffects
useEffect(() => {
  if (userId && !isValidObjectId(userId)) {
    console.error('Invalid ObjectId format in ContactList:', userId);
    toast.error('Invalid session. Please login again.');
  }
}, [userId]);
  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    setFilterType("group");
    setDropdownVisible(false);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
  const [deleteSelectedLoading, setDeleteSelectedLoading] = useState(false);

  const [userToEdit, setUserToEdit] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    Name: "",
    Profile: "",
    From: "",
    tags: [],
    newTag: "",
    CompanyName: "",
    Designation: "",
    PersonalEmail: "",
    CompanyEmail: "",
    GroupName: [],
    newGroupName: "",
  });
  const [showAddSingleContact, setShowAddSingleContact] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    Name: "",
    Profile: "",
    MobileNo: "",
    GroupName: [],
    newGroupName: "",
    tags: [],
    newTag: "",
    CompanyName: "",
    Designation: "",
    PersonalEmail: "",
    CompanyEmail: "",
  });

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [showexcelModal, setShowExcelModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const [showexcelModalGroup, setShowExcelModalGroup] = useState(false);
  const [excelFileGroup, setExcelFileGroup] = useState(null);
  const [groupName, setGroupName] = useState("");

  const [showBroadCastMsg, setBroadCastMsg] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const [checkedItems, setCheckedItems] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);

  const [selectedCompanyNames, setSelectedCompanyNames] = useState([]);
  const [selectedDesignations, setSelectedDesignations] = useState([]);

  useEffect(() => {
   const syncDbType = (event) => {
  const newDbType = event?.detail || getDbType();

  console.log("DB CHANGED EVENT RECEIVED:", newDbType);

  setDbType(newDbType);
};
    window.addEventListener("dbChanged", syncDbType);
    window.addEventListener("storage", syncDbType);

    return () => {
      window.removeEventListener("dbChanged", syncDbType);
      window.removeEventListener("storage", syncDbType);
    };
  }, []);

  const handleCheckboxChange = (id) => {
    setCheckedItems(
      (prev) =>
        prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(`/api/admin/fetchAllTemplates/${userId}`, {
          params: { dbType }
        });
        setTemplates(response.data.data || []);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, [userId, dbType]);

  const handleDateChange = (e) => {
    const value = e.target.value;
    const parts = value.split("-");
    const formatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
    setScheduledDate(formatted);
  };

  const [selectedName, setSelectedName] = useState("");
  const [selectedProfileName, setSelectedProfileName] = useState("");
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedCompanyEmail, setSelectedCompanyEmail] = useState("");
  const [selectedPersonalEmail, setSelectedPersonalEmail] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setPage(1);
    }, 500),
    []
  );

  const fetchPageData = useCallback(async () => {
    if (!userId || !isValidObjectId(userId)) {
    console.error('Invalid userId for fetching contacts');
    setIsFetching(false);
    return;
  }

    try {
      setIsFetching(true);
      const companyNamesParam = selectedCompanyNames.join(",");
      const designationsParam = selectedDesignations.join(",");

      console.log("Campaign filter value:", selectedCampaignFilter); 

      const response = await axios.get(
        `http://localhost:7821/api/admin/getAllUserContacts/${userId}`,
        {
          params: {
            page,
            limit,
            search,
            selectedName,
            selectedProfileName,
            selectedCompanyName: companyNamesParam,
            selectedDesignation: designationsParam,
            selectedCompanyEmail,
            selectedPersonalEmail,
            selectedTag,
            groupName: selectedGroup,
            campaignName: selectedCampaignFilter,
            dbType
          }
        }
      );
      console.log("got response for table!!!", response.data);
  
      console.log("response length:", response.data.data.length);

setMessageReports(response.data.data);
      setTotalCount(response.data.totalCount);
      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      console.error("Error fetching data:", error);
    }
  }, [
    page,
    search,
    selectedName,
    selectedProfileName,
    selectedCompanyNames,
    selectedDesignations,
    selectedCompanyEmail,
    selectedPersonalEmail,
    selectedTag,
    selectedGroup,
    selectedCampaignFilter, 
    userId,
    limit,
    dbType,
  ]);
useEffect(() => {
  console.log("Current data:", messageReports);
}, [messageReports]);
  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchAllDataForExport = useCallback(async () => {
    try {
      const companyNamesParam = selectedCompanyNames.join(",");
      const designationsParam = selectedDesignations.join(",");

      const response = await axios.get(
        `http://localhost:7821/api/admin/getAllUserContactsFull/${userId}`,
        {
          params: {
            search,
            selectedName,
            selectedProfileName,
            selectedCompanyName: companyNamesParam,
            selectedDesignation: designationsParam,
            selectedCompanyEmail,
            selectedPersonalEmail,
            selectedTag,
            groupName: selectedGroup,
            dbType
          }
        }
      );
      setSelectAllCheckItems(response.data.data);
    } catch (error) {
      console.error("Error fetching all data:", error);
    }
  }, [
    search,
    selectedName,
    selectedProfileName,
    selectedCompanyNames,
    selectedDesignations,
    selectedCompanyEmail,
    selectedPersonalEmail,
    selectedTag,
    selectedGroup,
    userId,
    dbType,
  ]);

// Update this useEffect
useEffect(() => {
  const fetchCampaignOptions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:7821/api/admin/getDistinctCampaigns/${userId}`,
        { params: { dbType } }
      );
      setCampaignOptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
    }
  };

  fetchCampaignOptions();
}, [userId, dbType]); // Add dbType here

  const fetchAllContactNumbers = useCallback(async () => {
    try {
      const allPhoneNumbers = [];
      let currentPage = 1;
      const pageLimit = 200;
      let hasMore = true;
      let totalCount = 0;
      
      const companyNamesParam = selectedCompanyNames.join(',');
      const designationsParam = selectedDesignations.join(',');
      
      while (hasMore) {
        const response = await axios.get(
          `http://localhost:7821/api/admin/getAllUserContacts/${userId}`,
          {
            params: {
              page: currentPage,
              limit: pageLimit,
              search,
              selectedName,
              selectedProfileName,
              selectedCompanyName: companyNamesParam,
              selectedDesignation: designationsParam,
              selectedCompanyEmail,
              selectedPersonalEmail,
              selectedTag,
              groupName: selectedGroup,
              campaignName: selectedCampaignFilter,
              dbType
            }
          }
        );
        
        totalCount = response.data.totalCount;
        const phoneNumbers = response.data.data.map(item => item?.From).filter(Boolean);
        allPhoneNumbers.push(...phoneNumbers);
        
        const progress = Math.round((allPhoneNumbers.length / totalCount) * 100);
        setSelectAllProgress(progress);
        
        const totalFetched = currentPage * pageLimit;
        hasMore = totalFetched < response.data.totalCount;
        currentPage++;
        
        console.log(`Fetched ${allPhoneNumbers.length} of ${response.data.totalCount}`);
        
        if (response.data.data.length < pageLimit) {
          hasMore = false;
        }
      }
      
      return allPhoneNumbers;
    } catch (error) {
      console.error("Error fetching all contact numbers:", error);
      toast.error("Failed to select all contacts");
      throw error;
    }
  }, [search, selectedName, selectedProfileName, selectedCompanyNames, 
      selectedDesignations, selectedCompanyEmail, selectedPersonalEmail, 
      selectedTag, selectedGroup, selectedCampaignFilter, userId, dbType]);

  const uniqueNames = useMemo(() => {
    return [
      ...new Set(messageReports.map((item) => item?.Name).filter(Boolean)),
    ].sort();
  }, [messageReports]);

  const uniqueProfiles = useMemo(() => {
    return [
      ...new Set(messageReports.map((item) => item?.profile).filter(Boolean)),
    ].sort();
  }, [messageReports]);

  const uniqueCompanyNames = useMemo(() => {
    return [
      ...new Set(
        messageReports.map((item) => item?.CompanyName).filter(Boolean)
      ),
    ].sort();
  }, [messageReports]);

  const uniqueDesignations = useMemo(() => {
    return [
      ...new Set(
        messageReports.map((item) => item?.Designation).filter(Boolean)
      ),
    ].sort();
  }, [messageReports]);

  const uniqueCompanyEmails = useMemo(() => {
    return [
      ...new Set(
        messageReports.map((item) => item?.CompanyEmail).filter(Boolean)
      ),
    ].sort();
  }, [messageReports]);

  const uniquePersonalEmails = useMemo(() => {
    return [
      ...new Set(
        messageReports.map((item) => item?.PersonalEmail).filter(Boolean)
      ),
    ].sort();
  }, [messageReports]);

  const uniqueTags = useMemo(() => {
    return [
      ...new Set(
        messageReports.flatMap((item) => item.tags || []).filter(Boolean)
      ),
    ].sort();
  }, [messageReports]);

  const clearAllFilters = () => {
    setSearch("");
    setSelectedName("");
    setSelectedProfileName("");
    setSelectedCompanyNames([]);
    setSelectedDesignations([]);
    setSelectedCompanyEmail("");
    setSelectedPersonalEmail("");
    setSelectedTag("");
    setSelectedGroup("");
    setFilterType("all");
    setPage(1);
    setSelectedCampaignFilter(""); 
    setCheckedItems([]);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        console.log("Fetching groups for user:", userId);
        const response = await axios.get(
          `http://localhost:7821/api/admin/getDistinctGroups`,
          { params: { dbType } }
        );
        console.log("Groups API response:", response.data);
        setGroupOptions(response.data.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
        console.error("Error response:", error.response);
      }
    };

    fetchGroups();
  }, [userId, dbType]);

  useEffect(() => {
    console.log("Group options:", groupOptions);
  }, [groupOptions]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    selectedName,
    selectedProfileName,
    selectedCompanyNames,
    selectedDesignations,
    selectedCompanyEmail,
    selectedPersonalEmail,
    selectedTag,
    selectedGroup,
    selectedCampaignFilter,
  ]);

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
    const messageDate = new Date(timestamp);
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

    return messageDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const getUniqueColor = (tag) => {
    const colors = [
      "#6366F1",
      "#F59E0B",
      "#10B981",
      "#8B5CF6",
      "#14B8A6",
      "#EF4444",
      "#E11D48",
      "#7C3AED",
      "#F97316",
      "#059669",
      "#EC4899",
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const handleDeleteContact = async () => {
     if (!userId || !isValidObjectId(userId)) {
    toast.error("Invalid session. Please login again.");
    return;
  }
  
  if (!userIdToDelete || !isValidObjectId(userIdToDelete)) {
    toast.error("Invalid contact ID");
    return;
  }
    try {
      setLoadingBtn(true);
      const deleteUser = await axios.delete(
        `http://localhost:7821/api/admin/deleteParticularContactDetails/${userId}/${userIdToDelete}`,
        { params: { dbType } }
      );
      setLoadingBtn(false);
      setShowDeleteModal(false);
      toast.success("User Deleted Success");
      setMessageReports((prevReports) =>
        prevReports.filter((report) => report._id !== userIdToDelete)
      );
      setUserIdToDelete("");
    } catch (error) {
      setLoadingBtn(false);
      console.log(error);
      toast.error("Error While Deleting Contact Details");
    }
  };

  const handleDeleteSelectedContacts = async () => {
    if (!userId || !isValidObjectId(userId)) {
      toast.error("Invalid session. Please login again.");
      return;
    }

    if (!Array.isArray(checkedItems) || checkedItems.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    try {
      setDeleteSelectedLoading(true);

      // phone numbers come from `From` field in table
      const phoneNumbers = checkedItems;

      const res = await axios({
        method: "delete",
        url: `http://localhost:7821/api/admin/deleteSelectedContacts/${userId}`,
        params: { dbType },
        data: { phoneNumbers },
      });

      setDeleteSelectedLoading(false);
      setShowDeleteSelectedModal(false);

      const deletedPhoneNumbers = new Set(phoneNumbers);

      setMessageReports((prev) =>
        prev.filter((item) => !deletedPhoneNumbers.has(item?.From))
      );
      setCheckedItems([]);

      toast.success(
        `Deleted ${res?.data?.deletedCount ?? phoneNumbers.length} contact(s) successfully`
      );
    } catch (error) {
      setDeleteSelectedLoading(false);
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Error While Deleting Selected Contacts"
      );
    }
  };

  const handleUploadExcelContact = async () => {
     if (!userId || !isValidObjectId(userId)) {
    toast.error("Invalid session. Please login again.");
    return;
  }
    try {
      setLoadingBtn(true);
      if (!excelFile) return alert("Please select a file");

      if (!/\.(xlsx|xls|csv)$/i.test(excelFile.name)) {
        return alert("Invalid file type. Please upload an Excel or CSV file.");
      }

      const formData = new FormData();
      formData.append("file", excelFile);
      formData.append("dbType", dbType);

      const uploadExcelSheet = await axios.post(
        `http://localhost:7821/api/admin/addContactListByAdmin/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: { dbType }
        }
      );
      setLoadingBtn(false);
      setShowExcelModal(false);
      toast.success("CSV Upload Success");
    } catch (error) {
      setLoadingBtn(false);
      toast.error("Error Uploading Excel");
    }
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
          dbType: dbType
        }
      );
      setLoadingBtn(false);
      setCheckedItems([]);
      setBroadCastMsg(false);
      setTimeout(() => {
        navigate(`/campaign/${userId}`);
      }, 1000);
    } catch (error) {
      setLoadingBtn(false);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleUploadExcelContactsGroup = async () => {
    if (!userId || !isValidObjectId(userId)) {
    toast.error("Invalid session. Please login again.");
    return;
  }
  
  if (!groupName) {
    toast.error("Please enter a group name");
    return;
  }
    try {
      setLoadingBtn(true);
      if (!excelFileGroup) return alert("Please select a file");

      if (!/\.(xlsx|xls|csv)$/i.test(excelFileGroup.name)) {
        return alert("Invalid file type. Please upload an Excel or CSV file.");
      }

      const formData = new FormData();
      formData.append("file", excelFileGroup);
      formData.append("GroupName", groupName);
      formData.append("dbType", dbType);

      const uploadExcelSheet = await axios.post(
        `http://localhost:7821/api/admin/addGroupContactListByAdmin/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: { dbType }
        }
      );
      setLoadingBtn(false);
      setShowExcelModalGroup(false);
      toast.success("CSV Upload Success");
      fetchPageData();
    } catch (error) {
      setLoadingBtn(false);
      toast.error("Error Uploading Excel");
      console.error("Upload error:", error);
    }
  };

  const handleToggleTags = () => {
    setShowAllTags((prev) => !prev);
  };

  const exportToExcel = async () => {
    try {
      const companyNamesParam = selectedCompanyNames.join(',');
      const designationsParam = selectedDesignations.join(',');
      
      const response = await axios.get(
        `http://localhost:7821/api/admin/getAllUserContactsFull/${userId}`,
        {
          params: {
            search,
            selectedName,
            selectedProfileName,
            selectedCompanyName: companyNamesParam,
            selectedDesignation: designationsParam,
            selectedCompanyEmail,
            selectedPersonalEmail,
            selectedTag,
            groupName: selectedGroup,
            dbType
          }
        }
      );
      
      const data = response.data.data;

      const formattedData = data.map((item) => ({
        Name: item?.Name,
        ProfileName: item?.profile,
        PhoneNo: item?.From,
        DateOfCreation: item?.createdAt
          ? formatDateStamp(item?.createdAt)
          : "-",
        Designation: item?.Designation,
        CompanyName: item?.CompanyName,
        CompanyEmail: item?.CompanyEmail,
        PersonalEmail: item?.PersonalEmail,
        Tags: item?.tags?.join(", "),
        GroupName: item?.GroupName?.join(", "),
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "All Filtered Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      let filename = "AllFilteredContacts";
      if (selectedCompanyNames.length > 0) {
        filename += `_${selectedCompanyNames.join('-')}`;
      }
      filename += ".xlsx";

      saveAs(blob, filename);
      
      toast.success(`Exported all ${formattedData.length} filtered records`);
    } catch (error) {
      console.error("Error downloading contacts:", error);
      toast.error("Error exporting data");
    }
  };

  const fetchAllCompanyNames = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:7821/api/admin/getAllUniqueCompanyNames/${userId}`,
        { params: { dbType } }
      );
      setAllCompanyNames(response.data.data);
    } catch (error) {
      console.error("Error fetching company names:", error);
    }
  }, [userId, dbType]);

  const fetchAllDesignations = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:7821/api/admin/getAllUniqueDesignations/${userId}`,
        { params: { dbType } }
      );
      setAllDesignations(response.data.data);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  }, [userId, dbType]);

  useEffect(() => {
    fetchAllCompanyNames();
    fetchAllDesignations();
  }, [fetchAllCompanyNames, fetchAllDesignations]);

  // Add this useEffect - it will run when dbType changes
useEffect(() => {
  if (userId) {
    setMessageReports([]);
setTotalCount(0);
    // Reset all filters when dbType changes
    setSelectedGroup("");
    setSelectedCampaignFilter("");
    setPage(1);
    setSearch("");
    setSelectedName("");
    setSelectedProfileName("");
    setSelectedCompanyNames([]);
    setSelectedDesignations([]);
    setSelectedCompanyEmail("");
    setSelectedPersonalEmail("");
    setSelectedTag("");
    setCheckedItems([]);
    
    // Re-fetch groups for the new database
    const fetchGroupsForDb = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7821/api/admin/getDistinctGroups`,
          { params: { dbType } }
        );
        setGroupOptions(response.data.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
        setGroupOptions([]);
      }
    };
    
    // Re-fetch campaigns for the new database
    const fetchCampaignsForDb = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7821/api/admin/getDistinctCampaigns/${userId}`,
          { params: { dbType } }
        );
        setCampaignOptions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching campaign data:", error);
        setCampaignOptions([]);
      }
    };
    
    // Re-fetch company names and designations
    const fetchFilterOptions = async () => {
      try {
        const [companyRes, designationRes] = await Promise.all([
          axios.get(`http://localhost:7821/api/admin/getAllUniqueCompanyNames/${userId}`, 
            { params: { dbType } }
          ),
          axios.get(`http://localhost:7821/api/admin/getAllUniqueDesignations/${userId}`,
            { params: { dbType } }
          )
        ]);
        setAllCompanyNames(companyRes.data.data || []);
        setAllDesignations(designationRes.data.data || []);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    const refreshData = async () => {
      await Promise.all([fetchGroupsForDb(), fetchCampaignsForDb(), fetchFilterOptions()]);
      // fetchPageData will be triggered by the page/state changes, but call it explicitly to be safe
      setTimeout(() => {
        fetchPageData();
      }, 100);
    };
    
    refreshData();
  
  }
}, [dbType, userId]); // This runs when dbType changes
  // The rest of your JSX remains the same...
  // (The JSX portion doesn't need changes as it's just the UI)
// Use messageReports directly - this is the filtered data from the API
const filteredData = messageReports;
  return (
    <div className="contact-page">
      <Header pageName={pageName} />

      {/* Toolbar */}
      <div className="contact-toolbar">
        {/* Selected count */}
        <div className="contact-selected-count">
          Selected<br />{checkedItems.length} of {totalCount}
        </div>

        {/* Filter buttons */}
        <button className={`contact-filter-btn${filterType === "all" ? " active" : ""}`} onClick={() => { setFilterType("all"); setSelectedGroup(""); }}>All</button>
        <button className={`contact-filter-btn${filterType === "group" ? " active" : ""}`} onClick={() => setDropdownVisible(!dropdownVisible)}>Group By</button>

        {/* Group dropdown */}
        {dropdownVisible && (
          <select className="contact-group-select" value={selectedGroup} onChange={handleGroupChange} onBlur={() => setTimeout(() => setDropdownVisible(false), 200)}>
            <option value="">Select Group</option>
            {groupOptions.map((g, i) => <option key={i} value={g}>{g}</option>)}
          </select>
        )}

        {/* Search */}
        <div className="contact-search-box">
          <FaSearch size={12} color="#9ca3af" />
          <input type="text" placeholder="Search..." onChange={handleSearchChange} />
        </div>

        {/* Action buttons */}
        <button className="contact-action-btn" onClick={() => setShowExcelModalGroup(true)}><MdGroupAdd size={14} /> Create Group</button>
        <button className="contact-action-btn" onClick={() => setShowExcelModal(true)}><MdCloudUpload size={14} /> Upload Excel</button>
        <button className="contact-action-btn" onClick={() => setBroadCastMsg(true)}><TbBroadcast size={14} /> Broadcast</button>
        <button className="contact-action-btn" onClick={exportToExcel}><FaDownload size={12} /> Download</button>
        <button
          className="contact-action-btn"
          onClick={() => {
            if (checkedItems.length === 0) {
              toast.error("Please select at least one contact");
              return;
            }
            setShowDeleteSelectedModal(true);
          }}
          disabled={deleteSelectedLoading}
          style={deleteSelectedLoading ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
          title="Delete selected contacts"
        >
          <MdDelete size={14} /> {deleteSelectedLoading ? "Deleting..." : "Delete Selected"}
        </button>
        <button className="contact-action-btn" onClick={() => setShowAddSingleContact(true)}><IoIosContact size={14} /> Add Contact</button>


        {/* Pagination */}
        <div className="contact-pagination">
          <button className="contact-page-btn" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}><MdNavigateBefore size={16} /></button>
          <span className="contact-page-info">
            {totalCount === 0 ? "0 results" : `${(page - 1) * limit + 1}–${Math.min(page * limit, totalCount)} of ${totalCount}`}
          </span>
          <button className="contact-page-btn" onClick={() => { const max = Math.ceil(totalCount / limit); setPage((p) => p < max ? p + 1 : p); }} disabled={page * limit >= totalCount}><MdNavigateNext size={16} /></button>
        </div>
      </div>

      {/* Table */}
      <div className="contact-table-wrap scrollbar-hidden">
                    
                                        {/* Desktop Table */}
                    <div className="hidden sm:block">
                      {/* </table> */}
                      <div className="h-[83vh] scrollbar-hidden bg-white">
                        <TableVirtuoso
                          data={filteredData}
                          
                          fixedHeaderContent={() => (
                            <tr>
                            <th className="px-4 py-2 text-center text-xs text-[#075e54] uppercase tracking-wider sticky top-0 bg-gray-100 z-10">
  {isSelectingAll ? (
    <div className="flex flex-col justify-center items-center">
      <svg
        className="animate-spin h-5 w-5 text-gray-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
        ></path>
      </svg>
      {selectAllProgress > 0 && (
        <span className="text-xs text-gray-600 mt-1">{selectAllProgress}%</span>
      )}
    </div>
  ) : (
    <div className="relative group">
      <input
        type="checkbox"
        disabled={isSelectingAll}
        onChange={async (e) => {
          if (e.target.checked) {
            console.log("Starting to select all filtered contacts...");
            setIsSelectingAll(true);
            setSelectAllProgress(0);
            
            try {
              const allFilteredPhoneNumbers = await fetchAllContactNumbers();
              console.log(`Successfully fetched ${allFilteredPhoneNumbers.length} contacts`);
              setCheckedItems(allFilteredPhoneNumbers);
              toast.success(`Selected all ${allFilteredPhoneNumbers.length} contacts`);
            } catch (error) {
              console.error("Error selecting all:", error);
              toast.error("Failed to select all contacts");
            } finally {
              setIsSelectingAll(false);
              setSelectAllProgress(0);
            }
          } else {
            setCheckedItems([]);
          }
        }}
        checked={
          filteredData.length > 0 && 
          filteredData.every(msg => checkedItems.includes(msg?.From))
        }
        ref={(input) => {
          if (input) {
            const someSelected = filteredData.some(msg => checkedItems.includes(msg?.From));
            const allSelected = filteredData.length > 0 && 
                               filteredData.every(msg => checkedItems.includes(msg?.From));
            input.indeterminate = someSelected && !allSelected;
          }
        }}
        className="cursor-pointer"
      />
      {/* Tooltip on hover */}
      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap z-20">
        Select all {totalCount} contacts
      </div>
    </div>
  )}
</th>


                              <th className="px-4 py-2 text-left text-xs text-[#075e54] uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap align-top">
                                <div className="flex flex-col items-left h-full">
                                  <span className="mb-1 font-semibold">Name</span>
                                </div>
                              </th>
                              <th className="px-2 py-2 text-left text-xs text-[#075e54] uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap align-top">
                                <div className="flex flex-col items-left h-full">
                                  <span className="mb-1 font-semibold">Profile Name</span>
                                </div>
                              </th>

                              <th className="px-2 py-2 text-center text-xs text-[#075e54] uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap align-top">
                                <div className="flex flex-col items-center h-full">
                                  <span className="mb-1 font-semibold">Company Name</span>
                                  <div className="relative">
                                    <select
                                      className="w-[120px] font-normal border border-gray-300 rounded px-1 py-1 text-gray-700 bg-white text-xs"
                                      size="1"
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value) {
                                          // Convert "(Blank)" back to empty string for filtering
                                          const actualValue =
                                            value === "(Blank)" ? "" : value;

                                          if (
                                            selectedCompanyNames.includes(
                                              actualValue
                                            )
                                          ) {
                                            setSelectedCompanyNames((prev) =>
                                              prev.filter(
                                                (c) => c !== actualValue
                                              )
                                            );
                                          } else {
                                            setSelectedCompanyNames((prev) => [
                                              ...prev,
                                              actualValue,
                                            ]);
                                          }
                                        }
                                        e.target.value = "";
                                      }}
                                    >
                                      <option value="">
                                        --Select--
                                      </option>
                                      {allCompanyNames
                                        .sort((a, b) => {
                                          // Sort with (Blank) appearing first
                                          const aDisplay =
                                            !a || a.trim() === ""
                                              ? "(Blank)"
                                              : a;
                                          const bDisplay =
                                            !b || b.trim() === ""
                                              ? "(Blank)"
                                              : b;
                                          return aDisplay.localeCompare(
                                            bDisplay
                                          );
                                        })
                                        .map((name, index) => {
                                          // Display name: show "(Blank)" for empty values
                                          const displayName =
                                            !name || name.trim() === ""
                                              ? "(Blank)"
                                              : name;
                                          // Actual value: keep original value for processing
                                          const actualValue =
                                            !name || name.trim() === ""
                                              ? ""
                                              : name;

                                          return (
                                            <option
                                              key={index}
                                              value={actualValue}
                                            >
                                              {selectedCompanyNames.includes(
                                                actualValue
                                              )
                                                ? "✓ "
                                                : ""}
                                              {displayName}
                                            </option>
                                          );
                                        })}
                                    </select>

                                    {selectedCompanyNames.length > 0 && (
                                      <div className="mt-1 flex flex-wrap gap-1 max-w-[120px]">
                                        {selectedCompanyNames.map(
                                          (company, index) => {
                                            // Display "(Blank)" for empty company names in chips
                                            const displayName =
                                              !company || company.trim() === ""
                                                ? "(Blank)"
                                                : company;

                                            return (
                                              <span
                                                key={index}
                                                className="inline-flex items-center px-1 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800"
                                              >
                                                {displayName.length > 8
                                                  ? `${displayName.substring(
                                                      0,
                                                      8
                                                    )}...`
                                                  : displayName}
                                                <button
                                                  onClick={() =>
                                                    setSelectedCompanyNames(
                                                      (prev) =>
                                                        prev.filter(
                                                          (c) => c !== company
                                                        )
                                                    )
                                                  }
                                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                                >
                                                  ×
                                                </button>
                                              </span>
                                            );
                                          }
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </th>
                              <th className="px-2 py-2 text-center text-xs text-[#075e54] uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap align-top">
                                <div className="flex flex-col items-center h-full">
                                  <span className="mb-1 font-semibold">Designation</span>
                                  <div className="relative">
                                    <select
                                      className="w-[120px] border font-normal border-gray-300 rounded px-1 py-1 text-gray-700 bg-white text-xs"
                                      size="1"
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value) {
                                          // Convert "(Blank)" back to empty string for filtering
                                          const actualValue =
                                            value === "(Blank)" ? "" : value;

                                          if (
                                            selectedDesignations.includes(
                                              actualValue
                                            )
                                          ) {
                                            setSelectedDesignations((prev) =>
                                              prev.filter(
                                                (d) => d !== actualValue
                                              )
                                            );
                                          } else {
                                            setSelectedDesignations((prev) => [
                                              ...prev,
                                              actualValue,
                                            ]);
                                          }
                                        }
                                        e.target.value = "";
                                      }}
                                    >
                                      <option value="">
                                        --Select--
                                      </option>
                                      {allDesignations
                                        .sort((a, b) => {
                                          // Sort with (Blank) appearing first
                                          const aDisplay =
                                            !a || a.trim() === ""
                                              ? "(Blank)"
                                              : a;
                                          const bDisplay =
                                            !b || b.trim() === ""
                                              ? "(Blank)"
                                              : b;
                                          return aDisplay.localeCompare(
                                            bDisplay
                                          );
                                        })
                                        .map((designation, index) => {
                                          // Display name: show "(Blank)" for empty values
                                          const displayName =
                                            !designation ||
                                            designation.trim() === ""
                                              ? "(Blank)"
                                              : designation;
                                          // Actual value: keep original value for processing
                                          const actualValue =
                                            !designation ||
                                            designation.trim() === ""
                                              ? ""
                                              : designation;

                                          return (
                                            <option
                                              key={index}
                                              value={displayName}
                                            >
                                              {selectedDesignations.includes(
                                                actualValue
                                              )
                                                ? "✓ "
                                                : ""}
                                              {displayName}
                                            </option>
                                          );
                                        })}
                                    </select>

                                    {selectedDesignations.length > 0 && (
                                      <div className="mt-1 flex flex-wrap gap-1 max-w-[120px]">
                                        {selectedDesignations.map(
                                          (designation, index) => {
                                            // Display "(Blank)" for empty designations in chips
                                            const displayName =
                                              !designation ||
                                              designation.trim() === ""
                                                ? "(Blank)"
                                                : designation;

                                            return (
                                              <span
                                                key={index}
                                                className="inline-flex items-center px-1 py-0.5 rounded text-[10px] bg-green-100 text-green-800"
                                              >
                                                {displayName.length > 8
                                                  ? `${displayName.substring(
                                                      0,
                                                      8
                                                    )}...`
                                                  : displayName}
                                                <button
                                                  onClick={() =>
                                                    setSelectedDesignations(
                                                      (prev) =>
                                                        prev.filter(
                                                          (d) =>
                                                            d !== designation
                                                        )
                                                    )
                                                  }
                                                  className="ml-1 text-green-600 hover:text-green-800"
                                                >
                                                  ×
                                                </button>
                                              </span>
                                            );
                                          }
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </th>

                              <th className="px-2 py-2 text-center text-xs text-[#075e54] uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap align-top">
                                <div className="flex flex-col items-center h-full">
                                  <span className="mb-1 font-semibold">Tags</span>
                                  <select
                                    className="w-[120px] border font-normal border-gray-300 rounded px-1 py-1 text-gray-700 bg-white text-xs"
                                    value={selectedTag}
                                    onChange={(e) =>
                                      setSelectedTag(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {[
                                      ...new Set(
                                        messageReports.flatMap(
                                          (item) => item.tags || []
                                        )
                                      ),
                                    ].map((tag, i) => (
                                      <option key={i} value={tag}>
                                        {tag}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </th>

                              <th className="px-2 py-2 text-center text-xs text-[#075e54] uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap align-top">
                                <div className="flex flex-col items-center h-full">
                                  <span className="mb-1 font-semibold">Phone Number</span>
                                  <div className="w-[120px] h-8"></div>{" "}
                                  {/* Spacer for alignment */}
                                </div>
                              </th>


                              <th className="px-2 py-2 text-center text-xs text-[#075e54] uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap align-top">
                                <div className="flex flex-col items-center h-full">
                                  <span className="mb-1 font-semibold">Personal Email</span>
                                  <select
                                    className="w-[120px] border font-normal border-gray-300 rounded px-1 py-1 text-gray-700 bg-white text-xs"
                                    value={selectedPersonalEmail}
                                    onChange={(e) =>
                                      setSelectedPersonalEmail(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {[
                                      ...new Set(
                                        messageReports.map((item) =>
                                          item?.PersonalEmail?.trim()
                                        )
                                      ),
                                    ]
                                      .filter(Boolean)
                                      .sort((a, b) => a.localeCompare(b))
                                      .map((name, index) => (
                                        <option key={index} value={name}>
                                          {name}
                                        </option>
                                      ))}
                                  </select>
                                </div>
                              </th>

                              <th className="px-2 py-2 text-center text-xs text-[#075e54] uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap align-top">
                                <div className="flex flex-col items-center h-full">
                                  <span className="mb-1 font-semibold">Company Email</span>
                                  <select
                                    className="w-[120px] border font-normal border-gray-300 rounded px-1 py-1 text-gray-700 bg-white text-xs"
                                    value={selectedCompanyEmail}
                                    onChange={(e) =>
                                      setSelectedCompanyEmail(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {[
                                      ...new Set(
                                        messageReports.map((item) =>
                                          item?.CompanyEmail?.trim()
                                        )
                                      ),
                                    ]
                                      .filter(Boolean)
                                      .sort((a, b) => a.localeCompare(b))
                                      .map((name, index) => (
                                        <option key={index} value={name}>
                                          {name}
                                        </option>
                                      ))}
                                  </select>
                                </div>
                              </th>

                              <th className="px-2 py-2 text-center text-xs text-[#075e54] uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap align-top">
                                <div className="flex flex-col items-center h-full">
                                  <span className="mb-1 font-semibold">Campaign</span>
                                  <select
                                    className="w-[120px] font-normal border border-gray-300 rounded px-1 py-1 text-gray-700 bg-white text-xs"
                                    value={selectedCampaignFilter}
                                    onChange={(e) => setSelectedCampaignFilter(e.target.value)}
                                  >
                                    <option value="">All</option>
                                    {campaignOptions.map((campaign, index) => (
                                      <option key={index} value={campaign}>
                                        {campaign}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </th>

                              <th className="px-2 py-2 text-center text-xs text-[#075e54] uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap align-top">
                                <div className="flex flex-col items-center h-full justify-start gap-1">
                                  <span>Action</span>
                                  <button
                                    onClick={clearAllFilters}
                                    className="p-1 border border-gray-300 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-sm"
                                    title="Reset Filters"
                                  >
                                    <RiResetRightLine className="h-3 w-3" />
                                  </button>
                                </div>
                              </th>
                            </tr>
                          )}
                          itemContent={(index, msg) => (
                            <>
                              <td className="py-1 text-center bg-white whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  checked={checkedItems.includes(msg?.From)}
                                  onChange={() =>
                                    handleCheckboxChange(msg?.From)
                                  }
                                />
                              </td>
                              {/* <td className="py-1 text-center bg-white whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                {filteredData.length - index}
                              </td> */}
                              <td className="py-1 px-4 text-left bg-white whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                {msg?.Name || "-"}
                              </td>

                              <td className="py-1 text-left bg-white whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                {msg?.profile || "-"}
                              </td>
                              <td className="py-1 text-center bg-white whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                {msg?.CompanyName || "-"}
                              </td>
                              <td className="py-1 text-center bg-white whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                {msg?.Designation || "-"}
                              </td>
                              <td className="py-1 text-center bg-white whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                {Array.isArray(msg?.tags) &&
                                msg.tags.length > 0 ? (
                                  <div
                                    className={`flex ${
                                      showAllTags ? "flex-col" : "flex-row"
                                    }  justify-center items-center gap-0.5`}
                                  >
                                    {(showAllTags
                                      ? msg.tags
                                      : msg.tags.slice(-2)
                                    ).map((tag, i) => (
                                      <span
                                        key={i}
                                        className="px-1 py-0.5 rounded-full border-[1px] text-[10px] font-medium"
                                        style={{
                                          borderColor: getUniqueColor(tag),
                                          color: getUniqueColor(tag),
                                          backgroundColor: getUniqueColor(tag) + "20",
                                        }}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {!showAllTags && msg.tags.length > 2 && (
                                      <span
                                        className="px-1.5 py-0.5 rounded-full bg-gray-300 text-gray-700 text-xs font-medium cursor-pointer"
                                        onClick={handleToggleTags}
                                      >
                                        +{msg.tags.length - 2}
                                      </span>
                                    )}

                                    {showAllTags && msg.tags.length > 2 && (
                                      <span
                                        className="px-1.5 py-0.5 rounded-full bg-gray-300 text-gray-700 text-[10px] font-medium cursor-pointer"
                                        onClick={handleToggleTags}
                                      >
                                        Show less
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="py-1 text-center bg-white whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                {msg?.From || "-"}
                              </td>
                              <td className="py-1 text-center bg-white whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                {msg?.PersonalEmail || "-"}
                              </td>
                              <td className="py-1 text-center bg-white whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                {msg?.CompanyEmail || "-"}
                              </td>
                              <td className="py-1 text-center bg-white whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                {Array.isArray(msg?.CampaignDetails) &&
                                msg.CampaignDetails.length > 0 ? (
                                  <div className="relative inline-block">
                                    {/* Display first campaign name */}
                                    <span
                                      className="cursor-pointer text-blue-600 hover:underline"
                                      onClick={() => {
                                        setSelectedCampaigns(
                                          msg.CampaignDetails
                                        );
                                        setShowCampaignModal(true);
                                      }}
                                    >
                                      {!selectedCampaignFilter
                                        ? (msg.CampaignDetails[msg.CampaignDetails.length - 1]?.campaignName || "Unnamed Campaign")
                                        : (msg.CampaignDetails.find(c => c.campaignName === selectedCampaignFilter)?.campaignName || "Unnamed Campaign")
                                      }

                                    </span>

                                    {/* Show +N indicator if there are more campaigns */}
                                    {!selectedCampaignFilter ? (msg.CampaignDetails.length > 1 && (
                                      <span
                                        className="ml-1 bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full text-xs cursor-pointer hover:bg-blue-200"
                                        onClick={() => {
                                          setSelectedCampaigns(
                                            msg.CampaignDetails
                                          );
                                          setShowCampaignModal(true);
                                        }}
                                      >
                                        +{msg.CampaignDetails.length - 1}
                                      </span>
                                    )):(
                                      <span
                                        className={`ml-1  px-1.5 py-0.5 rounded-full text-xs ${
                                          (msg.CampaignDetails.find(c => c.campaignName === selectedCampaignFilter)?.status) === "sent" ||
                                          (msg.CampaignDetails.find(c => c.campaignName === selectedCampaignFilter)?.status) === "delivered"
                                            ? "bg-green-100 text-green-800"
                                            : (msg.CampaignDetails.find(c => c.campaignName === selectedCampaignFilter)?.status) === "failed"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }
                                          `}
                                      >
                                        {(msg.CampaignDetails.find(c => c.campaignName === selectedCampaignFilter)?.status)}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="flex justify-center bg-white py-2 text-center whitespace-nowrap text-xs text-gray-700 border-b border-gray-200 hover:bg-gray-50">
                                {/* Edit Icon */}
                                <MdEdit
                                  title="Edit"
                                  size={17}
                                  color="green"
                                  className="cursor-pointer mr-2"
                                  onClick={() => {
                                    setShowEditModal(true);
                                    setUserToEdit(msg._id);
                                    setEditForm({
                                      Name: msg.Name || "",
                                      Profile: msg.profile || "",
                                      From: msg.From || "",
                                      tags: msg.tags || [],
                                      CompanyName: msg.CompanyName || "",
                                      CompanyEmail: msg.CompanyEmail || "",
                                      PersonalEmail: msg.PersonalEmail || "",
                                      Designation: msg.Designation || "",
                                      newTag: "",
                                      GroupName: Array.isArray(msg.GroupName)
                                        ? msg.GroupName
                                        : msg.GroupName
                                        ? [msg.GroupName]
                                        : [],
                                    });
                                  }}
                                />

                                {/* Delete Icon - Border Only */}
                                <MdDelete
                                  title="Delete"
                                  size={17}
                                  color="green"
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setShowDeleteModal(true);
                                    setUserIdToDelete(msg._id);
                                  }}
                                />
                              </td>
                            </>
                          )}
                          components={{
  EmptyPlaceholder: () => (
  <div
    style={{
      height: "83vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      marginLeft:"30vw"
    }}
  >
    {isFetching ? (
      <div>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600" />
      <p>Loading...</p>
      </div>
    ) : (
      <p>No data available</p>
    )}
  </div>
),
  Table: VirtuosoTable,
  TableHead: VirtuosoTableHead,
  TableRow: VirtuosoTableRow,
}}
                        />
                      </div>
                    </div>

                    {/* Mobile Table */}
                    <div className="sm:hidden overflow-x-auto">
                      <table className="w-full divide-gray-200">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-[#075e54] uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-[#075e54] uppercase tracking-wider">
                              Profile
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-[#075e54] uppercase tracking-wider">
                              Phone
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-gray-200">
                          {filteredData.map((msg, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-2 py-2 text-xs text-gray-700">
                                {msg?.profile || "-"}
                              </td>
                              <td className="px-2 py-2 text-xs text-gray-700">
                                {msg?.profile || "-"}
                              </td>
                              <td className="px-2 py-2 text-xs text-gray-700">
                                {msg?.From || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {showDeleteModal && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-85">
                          <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Are you sure you want to delete?
                          </h2>
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => setShowDeleteModal(false)}
                              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                              No
                            </button>
                            <button
                              disabled={loadingBtn}
                              onClick={() => handleDeleteContact()}
                              className={`${
                                loadingBtn
                                  ? "px-4 py-2 bg-gray-400 text-white rounded"
                                  : "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                              } `}
                            >
                              Yes
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {showDeleteSelectedModal && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-85">
                          <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Delete Selected Contacts?
                          </h2>

                          <p className="text-sm text-gray-600 mb-4">
                            You are about to delete <b>{checkedItems.length}</b> contact(s).
                          </p>

                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => setShowDeleteSelectedModal(false)}
                              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                              disabled={deleteSelectedLoading}
                            >
                              Cancel
                            </button>

                            <button
                              disabled={deleteSelectedLoading}
                              onClick={() => handleDeleteSelectedContacts()}
                              className={`${
                                deleteSelectedLoading
                                  ? "px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
                                  : "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                              }`}
                            >
                              {deleteSelectedLoading ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {showEditModal && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="relative">
                          {/* ✅ Close button OUTSIDE the modal */}
                          <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute -top-11 right-0 text-white hover:text-gray-100 text-xl font-bold z-10  rounded-full w-10 h-10 flex items-center justify-center"
                          >
                            ✕
                          </button>

                          <div
                            style={{ scrollbarWidth: "none" }}
                            className="bg-white rounded-lg p-6 w-full h-[80vh] overflow-auto max-w-md shadow-lg"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                          >
                            <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-semibold">
                                Edit User
                              </h2>
                            </div>

                            {/* Your existing form content here */}
                            <label className="text-gray-400">Name</label>
                            <input
                              type="text"
                              value={editForm.Name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  Name: e.target.value,
                                })
                              }
                              className="w-full mb-3 p-2 border rounded"
                            />

                            <label className="text-gray-400">
                              Profile Name
                            </label>
                            <input
                              type="text"
                              value={editForm.Profile}
                              disabled
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  Profile: e.target.value,
                                })
                              }
                              className="w-full mb-3 p-2 border rounded"
                            />

                            <label className="text-gray-400">Mobile No</label>
                            <input
                              type="text"
                              value={editForm.From}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  From: e.target.value,
                                })
                              }
                              className="w-full mb-3 p-2 border rounded"
                            />

                            <label className="text-gray-400">
                              Company Name
                            </label>
                            <input
                              type="text"
                              value={editForm.CompanyName}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  CompanyName: e.target.value,
                                })
                              }
                              className="w-full mb-3 p-2 border rounded"
                            />

                            <label className="text-gray-400">Designation</label>
                            <input
                              type="text"
                              value={editForm.Designation}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  Designation: e.target.value,
                                })
                              }
                              className="w-full mb-3 p-2 border rounded"
                            />

                            <label className="text-gray-400">
                              Personal Email
                            </label>
                            <input
                              type="text"
                              value={editForm.PersonalEmail}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  PersonalEmail: e.target.value,
                                })
                              }
                              className="w-full mb-3 p-2 border rounded"
                            />

                            <label className="text-gray-400">
                              Company Email
                            </label>
                            <input
                              type="text"
                              value={editForm.CompanyEmail}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  CompanyEmail: e.target.value,
                                })
                              }
                              className="w-full mb-3 p-2 border rounded"
                            />

                            <label className="text-gray-400">Group Name</label>
                            <input
                              type="text"
                              value={editForm.newGroupName || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  newGroupName: e.target.value,
                                })
                              }
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  editForm.newGroupName.trim() !== ""
                                ) {
                                  const newName = editForm.newGroupName.trim();
                                  if (!editForm.GroupName.includes(newName)) {
                                    setEditForm((prev) => ({
                                      ...prev,
                                      GroupName: [...prev.GroupName, newName],
                                      newGroupName: "",
                                    }));
                                  } else {
                                    console.log("Group name already exists!");
                                  }
                                }
                              }}
                              placeholder="Press Enter to add group"
                              className="w-full mb-3 p-2 border rounded"
                            />

                            {/* Show existing groups below */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {editForm.GroupName.map((g, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-green-200 rounded text-sm text-gray-700 mt-1 flex items-center"
                                >
                                  {g}
                                  <button
                                    type="button"
                                    className="ml-2 text-red-500 hover:text-red-700"
                                    onClick={() =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        GroupName: prev.GroupName.filter(
                                          (_, i) => i !== idx
                                        ),
                                      }))
                                    }
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>

                            {/* Tags */}
                            <div className="mb-3">
                              <label className="block mb-1 font-medium text-gray-400">
                                Tags:
                              </label>

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editForm.newTag}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      newTag: e.target.value,
                                    })
                                  }
                                  className="flex-1 p-2 border rounded"
                                />
                                <button
                                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                  onClick={() => {
                                    if (editForm.newTag.trim()) {
                                      setEditForm((prev) => ({
                                        ...prev,
                                        tags: [
                                          ...new Set([
                                            ...prev.tags,
                                            prev.newTag.trim(),
                                          ]),
                                        ],
                                        newTag: "",
                                      }));
                                    }
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {editForm.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="flex items-center bg-blue-200 text-blue-800 text-sm rounded-full px-3 py-1"
                                  >
                                    {tag}
                                    <button
                                      className="ml-2 text-red-500 hover:text-red-700"
                                      onClick={() =>
                                        setEditForm((prev) => ({
                                          ...prev,
                                          tags: prev.tags.filter(
                                            (_, i) => i !== index
                                          ),
                                        }))
                                      }
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Update Button */}
                            <div className="flex justify-end gap-3 mt-4">
                              <button
                                disabled={loadingBtn}
                                onClick={async () => {
                                   if (!userId || !isValidObjectId(userId)) {
    toast.error("Invalid session");
    return;
  }
  
  if (!userToEdit || !isValidObjectId(userToEdit)) {
    toast.error("Invalid user ID");
    return;
  }
                                  try {
                                    setLoadingBtn(true);
                                    await axios.patch(
                                      ` http://localhost:7821/api/admin/updateUserDetails/${userId}/${userToEdit}`,
                                      {
                                        Name: editForm.Name,
                                        From: editForm.From,
                                        Tags: editForm.tags,
                                        CompanyName: editForm.CompanyName,
                                        Designation: editForm.Designation,
                                        PersonalEmail: editForm.PersonalEmail,
                                        CompanyEmail: editForm.CompanyEmail,
                                        GroupName: editForm.GroupName,
                                        dbType
                                      }
                                    );
                                    setLoadingBtn(false);
                                    setMessageReports((prev) =>
                                      prev.map((msg) =>
                                        msg._id === userToEdit
                                          ? {
                                              ...msg,
                                              Name: editForm.Name,
                                              From: editForm.From,
                                              tags: editForm.tags,
                                              CompanyName: editForm.CompanyName,
                                              Designation: editForm.Designation,
                                              PersonalEmail:
                                                editForm.PersonalEmail,
                                              CompanyEmail:
                                                editForm.CompanyEmail,
                                            }
                                          : msg
                                      )
                                    );
                                    toast.success(
                                      "Contact Details Updated Success"
                                    );
                                    setShowEditModal(false);
                                  } catch (error) {
                                    setLoadingBtn(false);
                                    console.error(error);
                                    toast.error("Update failed");
                                  }
                                }}
                                className={`${
                                  loadingBtn
                                    ? "px-4 py-2 bg-gray-400 text-white rounded"
                                    : "px-4 py-2 bg-[#25d366] hover:bg-[#128c7e] text-white rounded"
                                }`}
                              >
                                Update
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {showAddSingleContact && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div
                          style={{ scrollbarWidth: "none" }}
                          className="bg-white rounded-lg p-6 w-full h-[80%] overflow-auto max-w-md shadow-lg"
                        >
                          <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold mb-4">
                              Add User
                            </h2>
                            <button
                              onClick={() => setShowAddSingleContact(false)}
                              className=" text-gray-500 text-[30px] mb-4 hover:text-black"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Name */}
                          <label className="text-gray-400">Name</label>
                          <input
                            type="text"
                            value={addUserForm.Name}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                Name: e.target.value,
                              })
                            }
                            className="w-full mb-3 p-2 border rounded"
                          />

                          {/* Mobile No */}
                          <label className="text-gray-400">Mobile No</label>
                          <input
                            type="text"
                            value={addUserForm.MobileNo}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                MobileNo: e.target.value,
                              })
                            }
                            className="w-full mb-3 p-2 border rounded"
                          />

                          {/*Company Name*/}
                          <label className="text-gray-400">Company Name</label>
                          <input
                            type="text"
                            value={addUserForm.CompanyName}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                CompanyName: e.target.value,
                              })
                            }
                            className="w-full mb-3 p-2 border rounded"
                          />

                          <label className="text-gray-400">Designation</label>
                          <input
                            type="text"
                            value={addUserForm.Designation}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                Designation: e.target.value,
                              })
                            }
                            className="w-full mb-3 p-2 border rounded"
                          />

                          <label className="text-gray-400">
                            Personal Email
                          </label>
                          <input
                            type="text"
                            value={addUserForm.PersonalEmail}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                PersonalEmail: e.target.value,
                              })
                            }
                            className="w-full mb-3 p-2 border rounded"
                          />

                          <label className="text-gray-400">Company Email</label>
                          <input
                            type="text"
                            value={addUserForm.CompanyEmail}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                CompanyEmail: e.target.value,
                              })
                            }
                            className="w-full mb-3 p-2 border rounded"
                          />

                          <label className="text-gray-400">Group Name</label>
                          <input
                            type="text"
                            value={addUserForm.newGroupName || ""}
                            onChange={(e) =>
                              setAddUserForm({
                                ...addUserForm,
                                newGroupName: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                addUserForm.newGroupName.trim() !== ""
                              ) {
                                const newName = addUserForm.newGroupName.trim();

                                // ✅ Check uniqueness
                                if (!addUserForm.GroupName.includes(newName)) {
                                  setAddUserForm((prev) => ({
                                    ...prev,
                                    GroupName: [...prev.GroupName, newName],
                                    newGroupName: "", // clear input
                                  }));
                                } else {
                                  // optional: show a warning if duplicate
                                  console.log("Group name already exists!");
                                }
                              }
                            }}
                            placeholder="Press Enter to add group"
                            className="w-full mb-3 p-2 border rounded"
                          />

                          {/* Show existing groups below */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {addUserForm.GroupName.map((g, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-green-200 rounded text-sm text-gray-700 mt-1 flex items-center"
                              >
                                {g}
                                <button
                                  type="button"
                                  className="ml-2 text-red-500 hover:text-red-700"
                                  onClick={() =>
                                    setAddUserForm((prev) => ({
                                      ...prev,
                                      GroupName: prev.GroupName.filter(
                                        (_, i) => i !== idx
                                      ),
                                    }))
                                  }
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>

                          {/* Tags */}
                          <div className="mb-3">
                            <label className="block mb-1 font-medium text-gray-400">
                              Tags:
                            </label>

                            {/* Add new tag */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                className="flex-1 p-2 border rounded"
                                onChange={(e) =>
                                  setAddUserForm({
                                    ...addUserForm,
                                    newTag: e.target.value,
                                  })
                                }
                              />
                              <button
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                onClick={() => {
                                  if (addUserForm.newTag.trim()) {
                                    setAddUserForm((prev) => ({
                                      ...prev,
                                      tags: [
                                        ...new Set([
                                          ...prev.tags,
                                          prev.newTag.trim(),
                                        ]),
                                      ],
                                      newTag: "",
                                    }));
                                  }
                                }}
                              >
                                {/* <FiPlus/> */}+
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {addUserForm.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="flex items-center bg-blue-200 text-blue-800 text-sm rounded-full px-3 py-1"
                                >
                                  {tag}
                                  <button
                                    className="ml-2 text-red-500 hover:text-red-700"
                                    onClick={() =>
                                      setAddUserForm((prev) => ({
                                        ...prev,
                                        tags: prev.tags.filter(
                                          (_, i) => i !== index
                                        ),
                                      }))
                                    }
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Buttons */}
                          <div className="flex justify-end gap-3 mt-4">
                            {/* <button
                              onClick={() => setShowEditModal(false)}
                              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button> */}
                            <button
                              disabled={loadingBtn}
                              onClick={async () => {
                                 if (!userId || !isValidObjectId(userId)) {
    toast.error("Invalid session");
    return;
  }
  
  if (!addUserForm.MobileNo) {
    toast.error("Mobile number is required");
    return;
  }
                                try {
                                  setLoadingBtn(true);
                                  await axios.post(
                                    ` http://localhost:7821/api/admin/CreateNewContact/${userId}`,
                                    {
                                      Name: addUserForm.Name,
                                      MobileNo: addUserForm.MobileNo,
                                      Tags: addUserForm.tags,
                                      CompanyName: addUserForm.CompanyName,
                                      Designation: addUserForm.Designation,
                                      PersonalEmail: addUserForm.PersonalEmail,
                                      CompanyEmail: addUserForm.CompanyEmail,
                                      GroupName: addUserForm.GroupName,
                                      dbType
                                    }
                                  );
                                  setLoadingBtn(false);
                                  setMessageReports((prev) => [
                                    ...prev,
                                    {
                                      Name: addUserForm.Name,
                                      MobileNo: addUserForm.MobileNo,
                                      tags: addUserForm.tags,
                                      CompanyName: addUserForm.CompanyName,
                                      Designation: addUserForm.Designation,
                                      PersonalEmail: addUserForm.PersonalEmail,
                                      CompanyEmail: addUserForm.CompanyEmail,
                                      GroupName: addUserForm.GroupName,
                                    },
                                  ]);
                                  setTotalCount((prev) => prev + 1);
                                  setAddUserForm({
                                    Name: "",
                                    Profile: "",
                                    MobileNo: "",
                                    GroupName: [],
                                    newGroupName: "",
                                    tags: [],
                                    newTag: "",
                                    CompanyName: "",
                                    Designation: "",
                                    PersonalEmail: "",
                                    CompanyEmail: "",
                                  });
                                  toast.success("Contact Added Success");
                                  setShowAddSingleContact(false);
                                } catch (error) {
                                  setLoadingBtn(false);
                                  console.error(error);
                                  toast.error("Something Went Wrong");
                                }
                              }}
                              className={`${
                                loadingBtn
                                  ? "px-4 py-2 bg-gray-400 text-white rounded"
                                  : "px-4 py-2 bg-[#25d366] hover:bg-[#128c7e] text-white rounded"
                              }`}
                            >
                              Add User
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {showexcelModal && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                          <h2 className="text-lg font-semibold mb-4">
                            Upload CSV File
                          </h2>

                          {/* File Input */}
                          <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => setExcelFile(e.target.files[0])}
                            className="w-full mb-4 border border-gray-300 p-2 rounded"
                          />

                          {/* Buttons */}
                          <div className="flex justify-between mt-4">
                            <a
                              href="/ContactSheetSample.xlsx" // Replace with your actual file path
                              download
                              className="text-blue-600 hover:underline"
                            >
                              Download Sample
                            </a>

                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setShowExcelModal(false);
                                  setExcelFile(null);
                                }}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                disabled={loadingBtn}
                                onClick={handleUploadExcelContact}
                                className={`${
                                  loadingBtn
                                    ? "px-4 py-2 bg-gray-400 text-white rounded"
                                    : "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                                }`}
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {showCampaignModal && (
                      <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black bg-opacity-50">
                         <div className="relative left-[313px] -top-3">
                            <button
                              onClick={() => {
                                setShowCampaignModal(false);
                                setSelectedCampaigns([]);
                              }}
                              className="text-white text-xl hover:text-black absolute"
                            >
                              ✕
                            </button>
                         </div>
                        <div className="bg-white rounded-lg p-6 w-full max-w-[600px] shadow-lg overflow-y-hidden">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                              Campaign Details
                            </h2>
                          </div>

                          <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="px-3 py-2 text-left">
                                    Campaign
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Template
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {[...selectedCampaigns].reverse().map((campaign, index) => (
                                  <tr
                                    key={index}
                                    className="border-b border-gray-200"
                                  >
                                    <td className="px-3 py-2">
                                      {campaign.campaignName || "-"}
                                    </td>
                                    <td className="px-3 py-2">
                                      {campaign.Templatename || "-"}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                          campaign.status === "sent" ||
                                          campaign.status === "delivered"
                                            ? "bg-green-100 text-green-800"
                                            : campaign.status === "failed"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        {campaign.status || "unknown"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {showexcelModalGroup && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                          <h2 className="text-lg font-semibold mb-4">
                            Create Group
                          </h2>

                          <div className="mb-4">
                            <label className="block text-sm  font-medium text-gray-700">
                              Group Name
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 p-2 rounded mt-1"
                              placeholder="Enter Group name"
                              value={groupName}
                              onChange={(e) => setGroupName(e.target.value)}
                            />
                          </div>

                          {/* File Input */}
                          <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) =>
                              setExcelFileGroup(e.target.files[0])
                            }
                            className="w-full mb-4 border border-gray-300 p-2 rounded"
                          />

                          {/* Buttons */}
                          <div className="flex justify-between mt-4">
                            <a
                              href="/ContactSheetSample.xlsx" // Replace with your actual file path
                              download
                              className="text-blue-600 hover:underline"
                            >
                              Download Sample
                            </a>

                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setShowExcelModalGroup(false);
                                  setExcelFileGroup(null);
                                }}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                disabled={loadingBtn}
                                onClick={handleUploadExcelContactsGroup}
                                className={`${
                                  loadingBtn
                                    ? "px-4 py-2 bg-gray-400 text-white rounded"
                                    : "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                                }`}
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {showBroadCastMsg && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                          <div className="flex justify-between">
                            <h2 className="text-lg font-semibold mb-4">
                              New Campaign
                            </h2>
                            <RxCrossCircled
                              size={30}
                              onClick={() => {
                                setBroadCastMsg(false);
                              }}
                              className="cursor-pointer"
                            />
                          </div>

                          <form className="space-y-4 max-w-xl mx-auto">
                            {/* Campaign Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Campaign Name
                              </label>
                              <input
                                type="text"
                                className="w-full border border-gray-300 p-2 rounded mt-1"
                                placeholder="Enter campaign name"
                                value={campaignName}
                                onChange={(e) =>
                                  setCampaignName(e.target.value)
                                }
                              />
                            </div>

                            {/* Template Name Dropdown */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Template Name
                              </label>
                              <select
                                className="w-full border border-gray-300 p-2 rounded mt-1 font-normal"
                                value={selectedTemplate}
                                onChange={(e) =>
                                  setSelectedTemplate(e.target.value)
                                }
                              >
                                <option value="">--Select--</option>
                                {templates.map((template, idx) => (
                                  <option key={idx} value={template.name}>
                                    {template.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Scheduled Date */}
                            {/* <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Scheduled Date
                              </label>
                              <input
                                type="date"
                                className="w-full border border-gray-300 p-2 rounded mt-1"
                                onChange={handleDateChange}
                              />
                              {scheduledDate && (
                                <p className="text-sm mt-1 text-gray-500">
                                  Selected: {scheduledDate}
                                </p>
                              )}
                            </div> */}

                            {/* Scheduled Time */}
                            {/* <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Scheduled Time
                              </label>
                              <input
                                type="time"
                                className="w-full border border-gray-300 p-2 rounded mt-1"
                                value={scheduledTime}
                                onChange={(e) =>
                                  setScheduledTime(e.target.value)
                                }
                              />
                            </div> */}

                            {/* Submit Button */}
                            <div className="pt-2 flex justify-center">
                              <button
                                onClick={handleCreateCampaign}
                                // type="submit"
                                disabled={loadingBtn}
                                className={`${
                                  loadingBtn
                                    ? "bg-gray-400"
                                    : "w-full sm:w-auto bg-[#25d366] text-white px-4 py-2 rounded hover:bg-[#128c7e] transition"
                                } `}
                              >
                                Start Broadcast
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
      </div>
    </div>
  );
};
