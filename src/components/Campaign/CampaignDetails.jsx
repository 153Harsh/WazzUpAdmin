import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import { FiArrowLeft } from "react-icons/fi";
import { useEffect, useState } from "react";
import { TableVirtuoso } from "react-virtuoso";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { IoRefreshCircleOutline } from "react-icons/io5";
import { FaDownload } from "react-icons/fa";
import ReplyPage from "../Reports/ReplyPage";

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const CampaignDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { msg } = location.state || {};
  const pageName = "Campaign Detail";
  const { id: userId } = useParams();
  const [loading, setLoading] = useState(false);

  const [campaignData, setCampaignData] = useState([]);
  const [contactDetails, setContactDetails] = useState([]);

  const [showModal, setShowModal] = useState(false);
  // Legacy flag kept but no longer used for per-row tag rendering
  const [showAllTags, setShowAllTags] = useState(false);
  const [refreshCampaignData, setRefreshCampaignData] = useState(false);


  const [selectedFilter, setSelectedFilter] = useState(null);

  // Contact list request state/progress (for perceived speed)
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsProgress, setContactsProgress] = useState({ done: 0, total: 0 });
  const [tagsExpandedByPhone, setTagsExpandedByPhone] = useState(() => new Map());

  // ✅ FORCE DEMO DATABASE ONLY
  const dbType = "demo";

  console.log("CampaignDetails Rendered - Using Demo DB");

  const statusFilterFn = (contact) => {
    const status = contact?.status?.toLowerCase();

    if (selectedFilter === "sent") {
      return status === "sent" || status === "delivered" || status === "read";
    }
    if (selectedFilter === "delivered") {
      return status === "delivered" || status === "read";
    }
    if (selectedFilter === "read") {
      return status === "read";
    }
    if (selectedFilter === "failed") {
      return status === "failed";
    }
    if (selectedFilter === "replied") {
      return contact?.Replayed === true;
    }

    // default ("all" / empty string / null)
    return true;
  };

  const filteredContacts = (() => {
    if (!selectedFilter) return contactDetails;
    return contactDetails.filter(statusFilterFn);
  })();

  const sortedFilteredContacts = (() => {
    // never mutate state array via reverse()
    return [...filteredContacts].sort((a, b) => {
      const at = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bt = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bt - at;
    });
  })();

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!userId || !isValidObjectId(userId)) {
        console.error("Invalid userId for fetching campaign details");
        toast.error("Invalid session");
        return;
      }

      if (!msg?._id) {
        console.error("No campaign ID provided");
        toast.error("Invalid campaign data");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:7821/api/admin/SigleCampaignDetails/${userId}/${msg._id}`,
          { params: { dbType: "demo" } } // ✅ Force demo
        );
        setCampaignData([response.data]);
      } catch (err) {
        console.error("Error fetching campaign details:", err);
        toast.error(err.message || "Failed to fetch campaign details");
      }
    };

    if (msg?._id) {
      fetchPlanDetails();
    }
  }, [msg, refreshCampaignData, userId]);


  useEffect(() => {
    const fetchContactDetails = async () => {
      if (!userId || !isValidObjectId(userId)) {
        console.error("Invalid userId for fetching contact details");
        toast.error("Invalid session");
        return;
      }

      if (!campaignData[0]?.CampainName) {
        console.error("No campaign name found");
        return;
      }

      const contactEntries = campaignData.flatMap((item) =>
        (item.CampaignDetails || []).map((detail) => ({
          contactNo: detail?.ContactNo,
          timestamp: detail?.timestamp,
          status: detail?.status,
          FailureCount: detail?.FailureCount,
          FailureReason: detail?.FailureReason,
        }))
      );

      // Basic guard: nothing to load
      const filteredEntries = contactEntries.filter((e) => e?.contactNo);
      if (filteredEntries.length === 0) {
        setContactDetails([]);
        return;
      }

      setContactsLoading(true);
      setContactsProgress({ done: 0, total: filteredEntries.length });

      // Fast + safe batching: run more requests concurrently,
      // but keep a cap to avoid overwhelming backend.
      const BATCH_SIZE = 25;
      const CONCURRENCY = 5; // within each batch

      const batchedResults = [];
      try {
        for (let i = 0; i < filteredEntries.length; i += BATCH_SIZE) {
          const batch = filteredEntries.slice(i, i + BATCH_SIZE);
          // concurrency-limited within the batch
          for (let j = 0; j < batch.length; j += CONCURRENCY) {
            const chunk = batch.slice(j, j + CONCURRENCY);

            const chunkPromises = chunk.map((entry) =>
              axios
                .get(
                  `http://localhost:7821/api/admin/getContactDetailsUsingMobile/${userId}/${entry.contactNo}?campName=${campaignData[0]?.CampainName}`,
                  { params: { dbType: "demo" } }
                )
                .then((res) => ({
                  ...res.data,
                  timestamp: entry.timestamp,
                  status: entry.status,
                  FailureCount: entry.FailureCount,
                  FailureReason: entry.FailureReason,
                }))
                .catch((err) => {
                  console.error("Error for contact:", entry.contactNo, err.message);
                  return null;
                })
            );

            const result = await Promise.all(chunkPromises);
            batchedResults.push(...result.filter(Boolean));

            setContactsProgress((p) => ({
              done: Math.min(p.total, p.done + chunk.length),
              total: p.total,
            }));
          }
        }

        setContactDetails(batchedResults);
      } catch (err) {
        console.error("Error fetching contact details:", err);
        toast.error(err?.message || "Failed to fetch contacts");
      } finally {
        setContactsLoading(false);
      }
    };

    if (campaignData.length > 0) {
      fetchContactDetails();
    }
  }, [campaignData, userId]);


  const formatDateStamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    return messageDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getUniqueColor = (tag) => {
    const colors = [
      "#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6",
      "#14B8A6", "#E11D48", "#7C3AED", "#F97316", "#059669", "#EC4899"
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getStatusCounts = (details = []) => {
    const counts = { Read: 0, Delivered: 0, Failed: 0, Sent: 0, Replayed: 0 };


    details.forEach((item) => {
      const status = item.status?.toLowerCase();
      const Replayed = item?.Replayed;

      if (status === "read") counts.Read++;
      else if (status === "failed") counts.Failed++;

      if (Replayed === true) counts.Replayed++;

      if (status === "read" || status === "delivered" || status === "sent")
        counts.Sent++;

      if (status === "delivered" || status === "read") counts.Delivered++;
    });

    return counts;
  };

  const formatDatestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day} ${month} ${year}`;
  };

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp * 1000);
    return messageDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDateStamp1 = (timestamp) => {
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

  const exportToExcel = (data) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    
    const formattedData = data.map((item) => ({
      Name: item?.Name,
      ProfileName: item?.profile,
      PhoneNo: item?.From,
      DateOfCreation: item?.createdAt ? formatDateStamp(item?.createdAt) : "-",
      Time: item?.timestamp ? formatTimestamp(item?.timestamp) : "-",
      Designation: item?.Designation,
      CompanyName: item?.CompanyName,
      CompanyEmail: item?.CompanyEmail,
      PersonalEmail: item?.PersonalEmail,
      Status: item?.status,
      "Retry Attempt": item?.FailureCount,
      "Failure Reason": item?.FailureReason,
      "Start At": campaignData[0]?.createdAt
        ? formatDateStamp1(campaignData[0]?.createdAt)
        : "" || "-",
      "Completed At": item?.timestamp
        ? formatTimestamp(item?.timestamp)
        : "" || "-",
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

    saveAs(blob, "Contacts.xlsx");
  };

  const handleRetrySendingMessage = async (campaignId) => {
    if (!userId || !isValidObjectId(userId)) {
      toast.error("Invalid session. Please login again.");
      return;
    }
    
    if (!campaignId || !isValidObjectId(campaignId)) {
      toast.error("Invalid campaign ID");
      return;
    }
    
    try {
      setLoading(true);
      const failedContacts = campaignData[0]?.CampaignDetails?.filter(
        (item) => item.status === "failed"
      )?.map((item) => item.ContactNo);

      const response = await axios.post(
        `http://localhost:7821/api/admin/retrySendingTemplate/${userId}/${campaignId}`,
        {
          FailedContactNo: failedContacts,
          dbType: "demo" // ✅ Force demo
        }
      );
      setLoading(false);
      setShowModal(false);
      toast.success("Retry Success");
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleToggleTags = (phoneNo) => {
    if (!phoneNo) return;
    setTagsExpandedByPhone((prev) => {
      const next = new Map(prev);
      next.set(phoneNo, !next.get(phoneNo));
      return next;
    });
  };

  // Keep legacy showAllTags state, but no longer used for row rendering.
  useEffect(() => {
    console.log(contactDetails[0]);
  }, [contactDetails]);

  
  const handleClick = (contactNo) => {
    if (!userId || !isValidObjectId(userId)) {
      toast.error("Invalid session");
      return;
    }
    
    if (!contactNo) {
      toast.error("Invalid contact number");
      return;
    }
    navigate(`/replyPage/${userId}`);
    localStorage.setItem("ReplyedMobNo", contactNo);
  };

  useEffect(() => {
    if (userId && !isValidObjectId(userId)) {
      console.error('Invalid ObjectId format in CampaignDetails:', userId);
      toast.error('Invalid user session. Please login again.');
    }
  }, [userId]);

  return (
    <>
      <div className="w-full">
        <div className="bg-[#ece5dd] h-[100dvh] overflow-hidden">
          <div className="bg-[#dcf8c6] mb-[-5px]">
            <Header pageName={pageName} />
          </div>
          <nav className="block w-full max-w-full bg-transparent text-black shadow-none rounded-xl transition-all px-0 py-1">
            <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
              <div className="relative top-[-10px] w-[100vw] sm:w-[100vw] ml-4 mr-4">
                {campaignData.map((data, index) => {
                  const { Read, Delivered, Failed, Sent, Replayed } =
                    getStatusCounts(data.CampaignDetails);
                  return (
                    <div key={index} className="flex gap-4 justify-center my-4">
                      <div
                        onClick={() => setSelectedFilter("")}
                        className="w-32 h-24 cursor-pointer bg-orange-100 text-orange-800 border border-orange-500 rounded-md shadow flex flex-col items-center justify-center"
                      >

                        <span className="text-2xl font-semibold">
                          {campaignData[0]?.ContactNo?.length}
                        </span>
                        <span className="text-sm font-medium">
                          Total Contacts
                        </span>
                      </div>
                      <div
                        onClick={() => setSelectedFilter("sent")}
                        className="w-32 h-24 cursor-pointer bg-yellow-100 text-yellow-800 border border-yellow-500 rounded-md shadow flex flex-col items-center justify-center"
                      >
                        <span className="text-2xl font-semibold">{Sent}</span>
                        <span className="text-sm font-medium">Sent</span>
                      </div>
                      <div
                        onClick={() => setSelectedFilter("delivered")}
                        className="w-32 h-24 cursor-pointer bg-blue-100 text-blue-800 border border-blue-500 rounded-md shadow flex flex-col items-center justify-center"
                      >
                        <span className="text-2xl font-semibold">
                          {Delivered}
                        </span>
                        <span className="text-sm font-medium">Delivered</span>
                      </div>
                      <div
                        onClick={() => setSelectedFilter("read")}
                        className="w-32 h-24 cursor-pointer bg-green-100 text-green-800 border border-green-500 rounded-md shadow flex flex-col items-center justify-center"
                      >
                        <span className="text-2xl font-semibold">{Read}</span>
                        <span className="text-sm font-medium">Read</span>
                      </div>
                      <div
                        onClick={() => setSelectedFilter("failed")}
                        className="w-32 h-24 cursor-pointer bg-red-100 text-red-800 border border-red-500 rounded-md shadow flex flex-col items-center justify-center"
                      >
                        <span className="text-2xl font-semibold">{Failed}</span>
                        <span className="text-sm font-medium">Failed</span>
                      </div>
                      <div
                        onClick={() => setSelectedFilter("replied")}
                        className="w-32 h-24 cursor-pointer bg-pink-100 text-pink-800 border border-pink-500 rounded-md shadow flex flex-col items-center justify-center"
                      >
                        <span className="text-2xl font-semibold">
                          {Replayed}
                        </span>
                        <span className="text-sm font-medium">Replied</span>
                      </div>
                    </div>
                  );
                })}

                <div className="w-full flex justify-between gap-4 mb-2">
                  <div className="flex items-center justify-center gap-4">
                    <IoRefreshCircleOutline
                      size={30}
                      className="cursor-pointer"
                      onClick={() => setRefreshCampaignData((prev) => !prev)}
                    />
                    <h1 className="font-bold">
                      Campaign Name:{" "}
                      <span className="font-normal">
                        {campaignData[0]?.CampainName}
                      </span>
                    </h1>
                  </div>

                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() => setShowModal(true)}
                      disabled={loading}
                      className={`${
                        loading
                          ? "rounded-full py-2 px-3 bg-gray-500 text-sm text-white"
                          : "rounded-full py-2 px-3 bg-red-500 hover:bg-red-600 text-sm text-white"
                      }`}
                    >
                      Retry Failed
                    </button>
                    <button
                      title="Download Excel"
                      onClick={() => exportToExcel(contactDetails)}
                      className="rounded-full py-2 px-3 bg-[#25d366] hover:bg-[#128c7e] text-sm text-white"
                    >
                      <FaDownload size={20} />
                    </button>
                  </div>
                </div>

                {showModal && (
                  <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded">
                      <p className="mb-2">
                        Are you sure you want to Resend Template?
                      </p>
                      <div className="flex justify-center">
                        <button
                          onClick={() =>
                            handleRetrySendingMessage(campaignData[0]?._id)
                          }
                          disabled={loading}
                          className={`${
                            loading ? "bg-gray-300" : "bg-red-500"
                          } text-white px-4 py-2 rounded mr-2`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setShowModal(false)}
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-[65vh] overflow-x-auto bg-white">
                  {contactsLoading && (
                    <div className="p-4 text-center">
                      Loading contacts... {contactsProgress.done}/{contactsProgress.total}
                    </div>
                  )}
                  <TableVirtuoso
                    data={contactsLoading ? [] : sortedFilteredContacts}

                    fixedHeaderContent={() => (

                      <tr>
                        <th className="px-12 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Name
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Profile Name
                        </th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Retry Attempt
                        </th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Failure Reason
                        </th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Phone Number
                        </th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Date of Creation
                        </th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Modified Date
                        </th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Tags
                        </th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Company Name
                        </th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Designation
                        </th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Personal Email
                        </th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Company Email
                        </th>
                        <th className="px-[4rem] py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Start At
                        </th>
                        <th className="px-8 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-100 z-10 whitespace-nowrap">
                          Completed On
                        </th>
                      </tr>
                    )}
                    itemContent={(index, msg) => (
                      <>
                        {/* Guard UI: render tags only when msg has tags etc. */}

                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.Name || "-"}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.profile || "-"}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.status || "-"}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.FailureCount || "0"}
                        </td>
                        <td className="py-2 px-4 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.FailureReason || "-"}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.From || "-"}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.createdAt ? formatDateStamp(msg?.createdAt) : "-"}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.updatedAt ? formatDateStamp(msg?.updatedAt) : "-"}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {Array.isArray(msg?.tags) && msg.tags.length > 0 ? (
                            <div
                              className={`flex ${
                                tagsExpandedByPhone.get(msg?.From) ? "flex-col" : "flex-row"
                              } justify-center items-center gap-1`}
                            >
                              {(tagsExpandedByPhone.get(msg?.From)
                                ? msg.tags
                                : msg.tags.slice(-2)
                              ).map((tag, i) => (

                                <span
                                  key={i}
                                  className="px-2 py-1 rounded-full text-white text-xs font-medium"
                                  style={{
                                    backgroundColor: getUniqueColor(tag),
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}

                              {!showAllTags && msg.tags.length > 2 && (
                                <span
                                  className="px-2 py-1 rounded-full bg-gray-300 text-gray-700 text-xs font-medium cursor-pointer"
                                  onClick={() => handleToggleTags(msg?.From)}
                                >
                                  +{msg.tags.length - 2}
                                </span>

                              )}

                              {tagsExpandedByPhone.get(msg?.From) && msg.tags.length > 2 && (
                                <span
                                  className="px-2 py-1 rounded-full bg-gray-300 text-gray-700 text-xs font-medium cursor-pointer"
                                  onClick={() => handleToggleTags(msg?.From)}
                                >
                                  Show less
                                </span>
                              )}

                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.CompanyName || "-"}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.Designation || "-"}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.PersonalEmail || "-"}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          {msg?.CompanyEmail || "-"}
                        </td>
                        <td className="py-2 text-center text-sm text-gray-700 bg-white">
                          {campaignData[0]?.createdAt
                            ? formatDateStamp1(campaignData[0]?.createdAt)
                            : "" || "-"}
                        </td>
                        <td className="py-2 text-center text-sm text-gray-700 bg-white">
                          {msg?.timestamp
                            ? formatTimestamp(msg?.timestamp)
                            : "" || "-"}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap text-sm text-gray-700 bg-white">
                          
                        </td>
                      </>
                    )}
                    components={{
                      Table: (props) => (
                        <table
                          {...props}
                          className="min-w-full table-fixed divide-y divide-gray-300"
                        />
                      ),
                      TableHead: (props) => (
                        <thead
                          {...props}
                          className="bg-gray-100 fixed top-0 z-10"
                        />
                      ),
                      TableRow: (props) => (
                        <tr
                          {...props}
                          className="hover:bg-gray-50 transition-colors border-b"
                        />
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default CampaignDetails;