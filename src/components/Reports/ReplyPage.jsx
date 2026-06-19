import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { RotatingLines } from "react-loader-spinner";
import Header from "../Header/Header";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import {
  IoDocumentText,
  IoSend,
  IoFilterCircleOutline,
  IoReturnDownForwardOutline,
} from "react-icons/io5";
import { io } from "socket.io-client";
import { RxCross2 } from "react-icons/rx";
import { FiPlus } from "react-icons/fi";
import { MdClose, MdInsertPhoto, MdOutlineEmojiEmotions } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { CgSpinner } from "react-icons/cg";
import Picker from "@emoji-mart/react";
import { CiCirclePlus } from "react-icons/ci";
import { FaSearch } from "react-icons/fa";
import { BusinessWhatsAppPlaceholder } from "./ChatPlaceholder";
import MessageItem from "./MessageItem";
import { CiEdit } from "react-icons/ci";
import PlusModal from "./PlusModal";
import "./styles.css";
import "./whatsappChatBg.css";
import { useNavigate } from "react-router-dom";



// Add this after your imports
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
const ReplyPage = () => {
  const navigate = useNavigate();
  const pageName = "Live Chats";
  const { id: userId, mobNo: ReplyedMobNo } = useParams();
  const effectiveUserId = userId;
  const location = useLocation();
  // const urlDbType = useMemo(() => {
  //   const sp = new URLSearchParams(location.search);
  //   const t = sp.get("dbType");
  //   if (!t) return null;
  //   if (t === "demo" || t === "company") return t;
  //   return null;
  // }, [location.search]);

  const urlDbType = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const t = sp.get("dbType");
    if (t === "demo" || t === "company") return t;
    return null;
  }, [location.search]);

  const [dbType, setDbType] = useState(() => urlDbType || "demo");
  const isMessagingDisabled = dbType !== "demo"; // disable only for company

  const [loading, setLoading] = useState(false);
  const [dbSwitching, setDbSwitching] = useState(false);
  // const [isMessagingDisabled, setIsMessagingDisabled] = useState(true);
  const [queryData, setQueryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);
  const [queryDataSingleUser, setQueryDataSingleUser] = useState([]);
  const [caseDetails, setCaseDetails] = useState([]);
  const [messageValue, setMessageValue] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [fromNo, setFromNo] = useState(ReplyedMobNo || "");
  const [Name, setName] = useState("");
  const [Designation, setDesignation] = useState("");
  const [CompanyName, setCompanyName] = useState("");
  const [lastTime, setLastTime] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replyId, setReplyId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery1, setSearchQuery1] = useState("");
  const [searchInput1, setSearchInput1] = useState("");
  const [timer, setTimer] = useState(0);
  const [filterModel, setFilterModel] = useState(false);
  const [plusModel, setPlusModel] = useState(false);
  const [lessThan24Checked, setLessThan24Checked] = useState(false);
  const [repliedChatChecked, setRepliedChatChecked] = useState(false);
  const [tagsChecked, setTagsChecked] = useState(false);
  const [msgCountUnread, setMsgCountUnread] = useState(0);
  const [onRead, setOnUnread] = useState(false);
  const [profileDetails, setProfileDetails] = useState({});
  const [profileModal, setProfileModal] = useState(false);
  const [loadingProfileDetails, setLoadingProfileDetails] = useState(false);
  const profileModalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pickerRef = useRef(null);
  const attachmentRef = useRef(null);
  const [currentDate, setCurrentDate] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [fetchTemp, setFetchTemp] = useState([]);
  const [allTemplates, setAllTemplates] = useState(false);
  const [allReplyMessages, setAllReplyMessages] = useState(false);
  const [fetchReplyMsg, setFetchReplyMsg] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [loadSendTemplate, setLoadSendTemplate] = useState(false);
  const [loadingSendMsg, setLoadingSendMsg] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const normalizePhone = (phone = "") => String(phone || "").replace(/\D/g, "");
  const isMatchingPhone = (a, b) => {
    const normA = normalizePhone(a);
    const normB = normalizePhone(b);
    return normA && normB && normA === normB;
  };
  const [newReplyText, setNewReplyText] = useState("");
  const dbSwitchTimeoutRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [optionLabel, setOptionLabel] = useState("");
  const [sendingFile, setSendingFile] = useState(false);
  const fileInputRef = useRef(null);
  const [calculatedTime, setCalculatedTime] = useState({});
  const [userToEdit, setUserToEdit] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);

  const messageRefs = useRef({});
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

  const attachmentOptions = [
    {
      icon: <MdInsertPhoto size={24} color="blue" />,
      label: "Photos / Videos",
      accept: "image/*,video/*",
    },
    {
      icon: <IoDocumentText size={24} color="purple" />,
      label: "Document",
      accept: ".pdf,.doc,.docx,.txt",
    },
  ];

  // Enhanced search that includes PDF captions, interactive messages, etc.
  const getMessageText = (msg) => {
    // Check for body
    if (typeof msg.body === "string") return msg.body;

    // Check for PDF captions
    if (msg.caption && typeof msg.caption === "string") return msg.caption;

    // Check for interactive messages
    if (msg.interactiveMsg) {
      if (msg.interactiveMsg.title) return msg.interactiveMsg.title;
      if (msg.interactiveMsg.body) return msg.interactiveMsg.body;
      if (msg.interactiveMsg.header) return msg.interactiveMsg.header;
      if (msg.interactiveMsg.footer) return msg.interactiveMsg.footer;

      // Button replies
      if (msg.interactiveMsg.buttonReply) return msg.interactiveMsg.buttonReply;

      // List replies
      if (msg.interactiveMsg.listReply) return msg.interactiveMsg.listReply;
    }

    // Check for document filename
    if (msg.document?.filename) return msg.document.filename;

    // Check for image caption
    if (msg.image?.caption) return msg.image.caption;

    // Check for video caption
    if (msg.video?.caption) return msg.video.caption;

    // Fallback to body as array
    if (Array.isArray(msg.body)) return msg.body.join(" ");

    return "";
  };

  const matchedMessages = caseDetails.filter((msg) => {
    const text = getMessageText(msg);
    return text.toLowerCase().includes(chatSearch.toLowerCase());
  });
  const scrollToMessage = (messageId) => {
    console.trace("SCROLL TO", messageId);
    const element = messageRefs.current[messageId];
    const container = chatContainerRef.current;

    if (!element || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const scrollTop =
      container.scrollTop +
      (elementRect.top - containerRect.top) -
      container.clientHeight / 2 +
      element.clientHeight / 2;

    const targetScroll = Math.max(0, scrollTop);

    console.log("TARGET:", targetScroll);

    container.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const goNext = () => {
    if (!matchedMessages.length) return;
    const next = (currentMatch + 1) % matchedMessages.length;
    setCurrentMatch(next);
    scrollToMessage(matchedMessages[next].id);
    console.log(
      matchedMessages[next].id,
      messageRefs.current[matchedMessages[next].id],
    );
  };

  const goPrev = () => {
    if (!matchedMessages.length) return;
    const prev =
      (currentMatch - 1 + matchedMessages.length) % matchedMessages.length;
    setCurrentMatch(prev);
    scrollToMessage(matchedMessages[prev].id);
  };

  // Highlight function with auto-jump to first result
  const highlight = (text) => {
    if (!chatSearch) return text;
    const regex = new RegExp(
      `(${chatSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  // Auto-jump to first search result
  useEffect(() => {
    if (matchedMessages.length > 0 && chatSearch) {
      setCurrentMatch(0);

      setTimeout(() => {
        scrollToMessage(matchedMessages[0].id);
      }, 100);
    }
  }, [chatSearch]);

  // Cleanup messageRefs when changing chats
  useEffect(() => {
    messageRefs.current = {};
  }, [selectedCase?._id]);

  // Socket event handlers
  const handleUpdateMsg = useCallback((data) => {
    if (
      fromNoRef.current &&
      isMatchingPhone(data.From || data.from, fromNoRef.current)
    ) {
      const uniqueMessages = [];
      const seenIds = new Set();
      const sortedMessages = [...(data.Messages || [])].sort(
        (a, b) => a.timestamp - b.timestamp,
      );
      for (const msg of sortedMessages) {
        if (!seenIds.has(msg.id)) {
          seenIds.add(msg.id);
          uniqueMessages.push(msg);
        }
      }
      setCaseDetails((prev) => {
        const prevLastId = prev[prev.length - 1]?.id;
        const newLastId = uniqueMessages[uniqueMessages.length - 1]?.id;
        if (prevLastId === newLastId) return prev;

        const lastMessage = uniqueMessages[uniqueMessages.length - 1];
        if (
          lastMessage?.userType === "User" ||
          lastMessage?.body?.endsWith?.(".jpg") ||
          lastMessage?.body?.endsWith?.(".pdf") ||
          lastMessage?.body?.endsWith?.(".mp4")
        ) {
          setLastTime(data.lastTimeStamp);
        }
        return uniqueMessages;
      });
    }
  }, []);

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    if (effectiveUserId && !isValidObjectId(effectiveUserId)) {
      console.error("Invalid ObjectId format:", effectiveUserId);
      toast.error("Invalid user ID format. Please login again.");
      // Optional: Redirect to login
      // navigate('/login');
    }
  }, [effectiveUserId]);

  const handleUpdateNewUser = useCallback(
    async (data) => {
      if (
        fromNoRef.current &&
        isMatchingPhone(data.From || data.from, fromNoRef.current)
      ) {
        const uniqueMessages = [];
        const seenIds = new Set();
        const sortedMessages = [...(data.Messages || [])].sort(
          (a, b) => a.timestamp - b.timestamp,
        );
        for (const msg of sortedMessages) {
          if (!seenIds.has(msg.id)) {
            seenIds.add(msg.id);
            uniqueMessages.push(msg);
          }
        }
        setCaseDetails((prev) => {
          const prevLastId = prev[prev.length - 1]?.id;
          const newLastId = uniqueMessages[uniqueMessages.length - 1]?.id;
          return prevLastId === newLastId ? prev : uniqueMessages;
        });

        try {
          await axios.patch(
            `http://localhost:7821/api/admin/userMessages/${effectiveUserId}/${data._id}`,
            {},
            { params: { dbType } },
          );
        } catch (error) {
          console.error("PATCH request failed:", error);
        }
      }

      setQueryData((prev) => {
        const index = prev.findIndex((item) =>
          isMatchingPhone(item.From, data.From || data.from),
        );

        if (index !== -1) {
          const existingItem = prev[index];

          const existingLastId =
            existingItem.Messages?.[existingItem.Messages.length - 1]?.id;
          const newLastId = data.Messages?.[data.Messages.length - 1]?.id;
          const shouldUpdateMessages = existingLastId !== newLastId;
          const shouldUpdateAdminReadLast =
            existingItem.adminReadLast !== data.adminReadLast;

          if (shouldUpdateMessages || shouldUpdateAdminReadLast) {
            const updatedItem = {
              ...existingItem,
              ...(shouldUpdateMessages && { Messages: data.Messages }),
              lastTimeStamp: data.lastTimeStamp,
              adminReadLast: data.adminReadLast,
              msgCount: data.msgCount,
            };

            const updatedData = [...prev];
            updatedData[index] = updatedItem;

            const unreadCount = updatedData.filter(
              (item) => item.adminReadLast === false,
            ).length;
            setMsgCountUnread(unreadCount);

            if (
              Array.isArray(data.Messages) &&
              data.Messages.length > 0 &&
              shouldUpdateMessages
            ) {
              const lastMessage = data.Messages[data.Messages.length - 1];
              if (lastMessage.userType === "User") {
                sendNotify(data.profile, unreadCount);
              }
            }

            return updatedData;
          }

          return prev;
        } else {
          return [data, ...prev];
        }
      });
    },
    [effectiveUserId, dbType],
  );

  const handleUpdateRead = useCallback((data) => {
    setQueryData((prev) => {
      const index = prev.findIndex(
  (item) =>
    item &&
    data &&
    isMatchingPhone(
      item?.From,
      data?.From || data?.from
    )
);

      if (index !== -1) {
        const existingItem = prev[index];

        const existingLastId =
          existingItem.Messages?.[existingItem.Messages.length - 1]?.id;
        const newLastId = data.Messages?.[data.Messages.length - 1]?.id;
        const shouldUpdateMessages = existingLastId !== newLastId;
        const shouldUpdateAdminReadLast =
          existingItem.adminReadLast !== data.adminReadLast;

        if (shouldUpdateMessages || shouldUpdateAdminReadLast) {
          const updatedItem = {
            ...existingItem,
            ...(shouldUpdateMessages && { Messages: data.Messages }),
            lastTimeStamp: data.lastTimeStamp,
            adminReadLast: data.adminReadLast,
            msgCount: data.msgCount,
          };

          const updatedData = [...prev];
          updatedData[index] = updatedItem;

          const unreadCount = updatedData.filter(
            (item) => item.adminReadLast === false,
          ).length;
          setMsgCountUnread(unreadCount);

          return updatedData;
        }

        return prev;
      } else {
        return [data, ...prev];
      }
    });
  }, []);

  const handleReplyTextSocket = useCallback((msg) => {
    setFetchReplyMsg(msg.ReplyMessages);
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (dbType) {
      const socket = io("http://localhost:7821", {
        query: { dbType },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        console.log("Socket connected with dbType:", dbType);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      socket.on("StatusChange", handleUpdateMsg);
      socket.on("UpdateMsg", handleUpdateNewUser);
      socket.on("UpdateRead", handleUpdateRead);
      socket.on("replyTxt", handleReplyTextSocket);

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("StatusChange", handleUpdateMsg);
        socketRef.current.off("UpdateMsg", handleUpdateNewUser);
        socketRef.current.off("UpdateRead", handleUpdateRead);
        socketRef.current.off("replyTxt", handleReplyTextSocket);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [
    dbType,
    handleUpdateMsg,
    handleUpdateNewUser,
    handleUpdateRead,
    handleReplyTextSocket,
  ]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      const headers = container.querySelectorAll(".date-header");
      let newDate = currentDate;

      for (let i = headers.length - 1; i >= 0; i--) {
        const header = headers[i];
        if (
          header.getBoundingClientRect().top <
          container.getBoundingClientRect().top + 10
        ) {
          newDate = header.dataset.date;
          break;
        }
      }

      if (newDate !== currentDate) {
        setCurrentDate(newDate);
      }
    };

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [currentDate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery1(searchInput1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput1]);

  useEffect(() => {
    if (chatSearch) return;

    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [caseDetails, chatSearch]);

  const fromNoRef = useRef(fromNo);
  useEffect(() => {
    fromNoRef.current = fromNo;
  }, [fromNo]);

  // useEffect(() => {
  //   // If dbType is provided via URL (e.g., /replyPage/:id?dbType=company),
  //   // sync it to localStorage + component state so chat switches immediately.
  //   if (!urlDbType) return;

  //   if (localStorage.getItem("dbType") !== urlDbType) {
  //     localStorage.setItem("dbType", urlDbType);
  //   }
  //   setDbType(urlDbType);

  //   window.dispatchEvent(
  //     new CustomEvent("dbChanged", { detail: urlDbType })
  //   );
  // }, [urlDbType]);

  // useEffect(() => {
  //   // If URL changes (dbType query changed), update state immediately
  //   if (urlDbType && urlDbType !== dbType) {
  //     setDbType(urlDbType);
  //   }
  // }, [urlDbType, dbType]);

useEffect(() => {
  const syncDbType = (event) => {
    const newDbType = event.detail;

    setDbType(newDbType);

    setSelectedCase(null);
    setCaseDetails([]);
    setFromNo("");
    setName("");
    setReplyMessage("");
    setReplyId("");
    setTimer(0);

    // REMOVE MOB NO FROM URL
    navigate(
      `/replyPage/${effectiveUserId}?dbType=${newDbType}`,
      { replace: true }
    );
  };

  window.addEventListener("dbChanged", syncDbType);

  return () =>
    window.removeEventListener("dbChanged", syncDbType);
}, [effectiveUserId, navigate]);

  const sendNotify = (Profile, Count) => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      showNotification();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showNotification();
        } else {
          alert("Notification permission denied.");
        }
      });
    } else {
      alert("Notification permission denied.");
    }

    function showNotification() {
      const options = {
        body: `${Profile} Send You ${Count} Message`,
        icon: `https://digilateral.com/images/digi-icon.png`,
        dir: "ltr",
      };
      new Notification("New Notification", options);
      const audio = new Audio(`${window.location.origin}/notify.mp3`);
      audio.play().catch((err) => console.log("Sound play error:", err));
    }
  };

  const renderTemplateMessageFromData = (
    index,
    template,
    item,
    isItemSelected,
    handleCheckboxChange,
  ) => {
    if (!template || !template.components) return null;

    const components = {
      header: template.components.find((c) => c.type === "HEADER"),
      body: template.components.find((c) => c.type === "BODY"),
      footer: template.components.find((c) => c.type === "FOOTER"),
      buttons: template.components.find((c) => c.type === "BUTTONS"),
    };

    const renderWithVariables = (text) =>
      text?.replace(/\{\{(\d+)\}\}/g, (_, i) => {
        const index = parseInt(i, 10) - 1;
        return components.body?.example?.body_text?.[0]?.[index] || `{{${i}}}`;
      });

    const parseWhatsAppFormatting = (text) => {
      if (!text) return null;
      const parts = text.split(/([_*~`])/);
      const elements = [];

      let inBold = false;
      let inItalic = false;
      let inStrike = false;
      let inCode = false;

      parts.forEach((part, i) => {
        if (part === "*") inBold = !inBold;
        else if (part === "_") inItalic = !inItalic;
        else if (part === "~") inStrike = !inStrike;
        else if (part === "`") inCode = !inCode;
        else if (part) {
          let element = part;
          if (inBold) element = <strong key={`b-${i}`}>{element}</strong>;
          if (inItalic) element = <em key={`i-${i}`}>{element}</em>;
          if (inStrike) element = <del key={`s-${i}`}>{element}</del>;
          if (inCode) element = <code key={`c-${i}`}>{element}</code>;
          elements.push(element);
        }
      });

      return elements;
    };

    const mediaUrl = components.header?.example?.header_handle?.[0];

    return (
      <div className="flex justify-between gap-2">
        <div>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={isItemSelected(item)}
            onChange={(e) => handleCheckboxChange(e, item)}
          />
        </div>
        <div className="bg-white w-full rounded-lg p-2 text-sm border-2 text-black mx-1 mb-4">
          <div className="flex font-bold items-center mb-2 gap-4 flex-wrap border-b-[3px]">
            {template?.name}
          </div>

          {components.header && components.header.format && mediaUrl && (
            <div className="mb-2">
              {components.header.format === "IMAGE" && (
                <img
                  src={mediaUrl}
                  alt="Header"
                  className="rounded-md max-h-52 w-full object-cover"
                />
              )}
              {components.header.format === "VIDEO" && (
                <video
                  controls
                  src={mediaUrl}
                  className="rounded-md max-h-52 w-full object-cover"
                />
              )}
              {components.header.format === "DOCUMENT" && (
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 rounded-md border text-sm text-blue-600 underline inline-block"
                >
                  View Document
                </a>
              )}
              {components.header.format === "TEXT" &&
                components.header.text && (
                  <h4 className="font-bold">{components.header.text}</h4>
                )}
            </div>
          )}

          {components.body?.text && (
            <div className="whitespace-pre-wrap break-words mb-1">
              {parseWhatsAppFormatting(
                renderWithVariables(components.body.text),
              )}
            </div>
          )}

          {components.footer?.text && (
            <div className="text-xs text-gray-500 mb-1">
              {parseWhatsAppFormatting(
                renderWithVariables(components.footer.text),
              )}
            </div>
          )}

          {components.buttons?.buttons?.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              {components.buttons.buttons.map((btn, idx) => (
                <React.Fragment key={idx}>
                  <button className="text-xs text-blue-600 text-center px-3 py-2 font-bold bg-white w-full border rounded">
                    {renderWithVariables(btn.text)}
                  </button>
                  {idx !== components.buttons.buttons.length - 1 && (
                    <hr className="border-t border-gray-300 mx-2" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const MemoizedTemplateMessage = ({
    index,
    template,
    isItemSelected,
    handleCheckboxChange,
  }) => {
    const rendered = useMemo(
      () =>
        renderTemplateMessageFromData(
          index,
          template,
          template,
          isItemSelected,
          handleCheckboxChange,
        ),
      [index, template, isItemSelected, handleCheckboxChange],
    );
    return rendered;
  };

  const handleCheckboxChange = (e, item) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedTemplates((prev) => [...prev, item]);
    } else {
      setSelectedTemplates((prev) => prev.filter((t) => t.id !== item.id));
    }
  };

  const handleCheckboxChange1 = (msg) => {
    setSelectedMessages((prev) => {
      if (prev.includes(msg)) {
        return prev.filter((m) => m !== msg);
      } else {
        return [...prev, msg];
      }
    });
  };

  const handleGetProfileData = async (MobileNo) => {
    if (!MobileNo || !effectiveUserId) {
      console.warn("Missing MobileNo or userId");
      return;
    }

    try {
      setProfileModal(true);
      setLoadingProfileDetails(true);
      const response = await axios.get(
        `http://localhost:7821/api/admin/getContactDetailsUsingMobile/${effectiveUserId}/${MobileNo}`,
        { params: { dbType } },
      );
      setProfileDetails(response.data);
      setLoadingProfileDetails(false);
    } catch (error) {
      console.error("Error fetching profile details:", error);
      setLoadingProfileDetails(false);
      toast.error("Failed to fetch profile details");
    }
  };

  const isItemSelected = (item) => {
    return selectedTemplates.some((t) => t.id === item.id);
  };

  const handleSendTemplate = async () => {
    // Add validation
    if (!effectiveUserId || !isValidObjectId(effectiveUserId)) {
      toast.error("Invalid session");
      return;
    }

    if (!fromNo) {
      toast.error("No recipient selected");
      return;
    }

    if (selectedTemplates.length === 0) {
      toast.error("No templates selected");
      return;
    }

    try {
      setLoadSendTemplate(true);
      const filteredTemplates = selectedTemplates.map((template) => ({
        tempName: template.name,
        id: template.id,
        langCode: template.language,
        to: fromNo,
      }));

      const response = await axios.post(
        `http://localhost:7821/api/admin/send-Template/${effectiveUserId}`,
        {
          filteredTemplates,
          dbType,
        },
      );
      setSelectedTemplates([]);
      setAllTemplates(false);
      setPlusModel(false);
      setLoadSendTemplate(false);
      toast.success("Templates sent successfully");
    } catch (error) {
      setLoadSendTemplate(false);
      console.log(error);
      toast.error("Failed to send templates");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetMsg = useCallback(async (e) => {
    if (e.target.value === "/templates") {
      setAllTemplates(true);
      setMessageValue("");
      return;
    }
    if (e.target.value === "/canned") {
      if (fetchReplyMsg.length === 0) {
        await fetchReplyMessages();
      }

      setAllReplyMessages(true);
      setMessageValue("");
      return;
    }
    setMessageValue(e.target.value);
  }, []);

  const handleEmojiSelect = (emoji) => {
    const cursorPos = textareaRef.current.selectionStart;
    const text = messageValue;
    const newText =
      text.slice(0, cursorPos) + emoji.native + text.slice(cursorPos);
    setMessageValue(newText);

    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.selectionEnd = cursorPos + emoji.native.length;
    }, 0);
  };

  useEffect(() => {
    if (replyMessage && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyMessage]);

  useEffect(() => {
    console.log("FETCH USERS CALLED");
    if (!effectiveUserId) return;

    setQueryData([]);
    setQueryDataSingleUser([]);
    setSelectedCase(null);
    setCaseDetails([]);
    setFromNo("");
    setName("");
     setReplyMessage("");
  setReplyId(""); 
    setCurrentPage(1);
    setHasMore(true);
    setDbSwitching(true);
    let isMounted = true;
    let timeoutId = null;

    const loadData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!isMounted) return;
        setCurrentPage(1);
        setHasMore(true);
        await fetchUsers(1);
      } catch (error) {
        console.error("Error loading data after DB switch:", error);
      } finally {
        if (isMounted) {
          setDbSwitching(false);
        }
      }
    };

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(loadData, 50);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    dbType,
    effectiveUserId,
    searchQuery,
    repliedChatChecked,
    tagsChecked,
    lessThan24Checked,
    searchQuery1,
    onRead,
  ]);

  const fetchUsers = async (page) => {
    console.log("Search:", searchQuery);
    console.log("DB:", dbType);
    if (loadingChats) return;

    if (page !== 1 && !hasMore) return;

    if (page === 1) {
      setLoadingChats(true);
    } else {
      setLoadingChats(true);
    }

    try {
      console.log("Fetching users with dbType:", dbType);
      const response = await axios.get(
        `http://localhost:7821/api/admin/allUsersNo/${effectiveUserId}`,
        {
          params: {
            page,
            limit: 30,
            search: searchQuery.toLowerCase() || searchQuery1.toLowerCase(),
            repliedChats: repliedChatChecked,
            lessThan24: lessThan24Checked,
            tagsPresent: tagsChecked,
            unread: onRead,
            dbType,
          },
        },
      );
      console.log("Response:", response.data);
      const newData = response.data.data;

      if (page === 1) {
        setQueryData(newData);
        setQueryDataSingleUser(newData);
        setMsgCountUnread(response.data.unreadCount || 0);
      } else {
        setQueryData((prev) => [...prev, ...newData]);
        setQueryDataSingleUser((prev) => [...prev, ...newData]);
      }

      setHasMore(page < response.data.totalPages);
      setCurrentPage(page);

      if (page === 1 && newData.length === 0) {
        toast(
          (t) => (
            <div>
              <strong>No contacts found</strong>
              <p>
                No data available for{" "}
                {dbType === "company" ? "Client" : "DigiLateral"} database.
              </p>
            </div>
          ),
          { duration: 3000 },
        );
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);

      // Handle 404 - Admin not found
      if (error.response?.status === 404) {
        toast.error("Admin session expired. Please login again.");
        handleInvalidSession();
      } else {
        toast.error("Failed to fetch data", { id: "failed-to-fetch" });
      }

      if (page === 1) {
        setQueryData([]);
      }
    } finally {
      setLoadingChats(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (
      scrollHeight - scrollTop <= clientHeight + 10 &&
      hasMore &&
      !loadingChats
    ) {
      fetchUsers(currentPage + 1);
    }
  };

  useEffect(() => {
    if (chatSearch) return;

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [caseDetails, chatSearch]);

  const fetchPlanDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:7821/api/admin/fetchAllTemplates/${effectiveUserId}`,
        {
          params: { dbType },
        },
      );

      setFetchTemp(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchReplyMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:7821/api/admin/getAllReplyMessages/${effectiveUserId}`,
        {
          params: { dbType },
        },
      );

      setFetchReplyMsg(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleGetCaseNo = useCallback(
    async (cNo) => {
      // Add validation
      if (!effectiveUserId || !isValidObjectId(effectiveUserId)) {
        toast.error("Invalid session");
        return;
      }

      if (!cNo?._id || !isValidObjectId(cNo._id)) {
        toast.error("Invalid conversation ID");
        return;
      }

      if (selectedCase?._id === cNo._id) return;

      setCaseDetails([]);
      setReplyMessage("");
      setReplyId(null);
      setTimer(0);
      setLoadingMessages(true);
      setSelectedCase(cNo);
      setFromNo(cNo.From);
      setChatSearch("");
      setCurrentMatch(0);

      try {
        const response = await axios.patch(
          `http://localhost:7821/api/admin/userMessages/${effectiveUserId}/${cNo._id}`,
          {},
          { params: { dbType } },
        );

        const lastUserMessage = [...(cNo?.Messages || [])]
          .reverse()
          .find(
            (msg) =>
              msg.userType === "User" ||
              msg.body?.endsWith?.(".jpg") ||
              msg.body?.endsWith?.(".pdf") ||
              msg.body?.endsWith?.(".mp4"),
          );

        setLastTime(lastUserMessage ? lastUserMessage.timestamp : "");
        setName(cNo?.Name || cNo?.profile);
        setDesignation(response.data?.data?.Designation);
        setCompanyName(response.data?.data?.CompanyName);

        const messages = response.data.data.Messages || [];
        // console.log("RAW MESSAGES:");
        // console.log(JSON.stringify(messages, null, 2));
        const uniqueMessages = [];
        const seenIds = new Set();

        for (const msg of messages) {
          if (!seenIds.has(msg.id)) {
            seenIds.add(msg.id);
            uniqueMessages.push(msg);
          }
        }

        setCaseDetails(uniqueMessages);
      } catch (error) {
        toast.error("Failed to load messages", { id: "failedMessageLoad" });
        setCaseDetails([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [effectiveUserId, selectedCase, dbType],
  );

  const handleSendMessage = useCallback(async () => {
    // Add validation
    if (!effectiveUserId || !isValidObjectId(effectiveUserId)) {
      toast.error("Invalid session");
      return;
    }

    if (!messageValue.trim()) return;
    if (!fromNo) {
      toast.error("No recipient selected");
      return;
    }

    setLoadingSendMsg(true);

    try {
      await axios.post(
        `http://localhost:7821/api/admin/replyToMessages/${effectiveUserId}`,
        {
          from: "919820770814",
          to: fromNo,
          message: messageValue,
          dbType,
        },
      );
      setMessageValue("");
      setReplyMessage("");
      setReplyId("");
      setAllReplyMessages(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message", { id: "messaagesentfailed" });
    } finally {
      setLoadingSendMsg(false);
    }
  }, [messageValue, effectiveUserId, fromNo, dbType]);

  const handleSendMessage1 = useCallback(async () => {
    if (selectedMessages.length === 0) return;
    setLoadingSendMsg(true);

    try {
      for (let i = 0; i < selectedMessages.length; i++) {
        const msg = selectedMessages[i];
        setMessageValue(msg);

        await axios.post(
          `http://localhost:7821/api/admin/replyToMessages/${effectiveUserId}`,
          {
            from: "919820770814",
            to: fromNo,
            message: msg,
            dbType,
          },
        );
      }

      setSelectedMessages([]);
      setReplyMessage("");
      setReplyId("");
      setAllReplyMessages(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send messages");
    } finally {
      setLoadingSendMsg(false);
    }
  }, [selectedMessages, effectiveUserId, fromNo, dbType]);

  const handleSendReplyMessage = useCallback(async () => {
    if (!messageValue.trim()) return;

    try {
      await axios.post(
        `http://localhost:7821/api/admin/replyParticularMessage/${effectiveUserId}`,
        {
          from: "919820770814",
          to: fromNo,
          message: messageValue,
          messageId: replyId,
          dbType,
        },
      );
      setMessageValue("");
      setReplyMessage("");
      setReplyId("");
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast.error("Failed to send reply");
    }
  }, [messageValue, effectiveUserId, fromNo, replyId, dbType]);

const filteredData = useMemo(() => {
    const lowerCaseSearchQuery =
      (searchQuery || searchQuery1)?.toLowerCase() || "";
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return (queryData || []).filter((item) => {
      // Guard against null entries inside queryData
      if (!item) return false;

      const matchesSearch = true;
      const matchesTags =
        (searchQuery || searchQuery1) &&
        Array.isArray(item?.tags) &&
        item.tags.some((tag) =>
          tag.toLowerCase().includes(lowerCaseSearchQuery),
        );
      const lastTimestampMs = item?.lastTimeStamp * 1000;
      const isWithin24Hours =
        !lessThan24Checked || now - lastTimestampMs < oneDayMs;

      const messages = item?.Messages || [];
      const lastMessage = messages[messages.length - 1];
      const isLastMessageFromAdmin =
        !repliedChatChecked || lastMessage?.userType === "User";
      const isTagsPresent =
        !tagsChecked || (Array.isArray(item?.tags) && item.tags.length > 0);

      const onreadCheck = onRead ? item?.adminReadLast === false : item;

      return (
        (matchesSearch &&
          isWithin24Hours &&
          isLastMessageFromAdmin &&
          onreadCheck &&
          isTagsPresent) ||
        matchesTags
      );
    });
  }, [
    queryData,
    searchQuery,
    searchQuery1,
    lessThan24Checked,
    repliedChatChecked,
    onRead,
    tagsChecked,
  ]);

  const filteredDataModal = useMemo(() => {
    const lowerCaseSearchQuery = searchQuery1?.toLowerCase() || "";
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return queryDataSingleUser.filter((item) => {
      const matchesSearch =
        !searchQuery1 ||
        item?.From?.toLowerCase()?.includes(lowerCaseSearchQuery) ||
        item?.profile?.toLowerCase()?.includes(lowerCaseSearchQuery) ||
        item?.Name?.toLowerCase()?.includes(lowerCaseSearchQuery);

      const matchesTags =
        searchQuery1 &&
        Array.isArray(item?.tags) &&
        item.tags.some((tag) =>
          tag.toLowerCase().includes(lowerCaseSearchQuery),
        );

      const lastTimestampMs = item?.lastTimeStamp * 1000;
      const isWithin24Hours =
        !lessThan24Checked || now - lastTimestampMs < oneDayMs;

      const messages = item?.Messages || [];
      const lastMessage = messages[messages.length - 1];
      const isLastMessageFromAdmin =
        !repliedChatChecked || lastMessage?.userType === "User";

      const onreadCheck = onRead ? item?.adminReadLast === false : item;

      return (
        (matchesSearch &&
          isWithin24Hours &&
          isLastMessageFromAdmin &&
          onreadCheck) ||
        matchesTags
      );
    });
  }, [
    queryDataSingleUser,
    searchQuery1,
    lessThan24Checked,
    repliedChatChecked,
    onRead,
    tagsChecked,
  ]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (ReplyedMobNo && filteredData.length > 0) {
        try {
          const matchingCase = await axios.get(
            `http://localhost:7821/api/admin/getContactDetailsUsingMobile/${effectiveUserId}/${ReplyedMobNo}`,
            { params: { dbType } },
          );
          handleGetCaseNo(matchingCase.data);
        } catch (error) {
          console.error("Failed to fetch contact details:", error);
          toast.error("Failed to load contact details");
        }
      }
    };
    fetchDetails();
  }, [
    ReplyedMobNo,
    handleGetCaseNo,
    filteredData.length,
    effectiveUserId,
    dbType,
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsidePicker =
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        event.target.getAttribute("data-toggle") !== "emoji";

      const clickedOutsideAttachment =
        attachmentRef.current && !attachmentRef.current.contains(event.target);

      if (clickedOutsidePicker) {
        setShowPicker(false);
      }

      if (clickedOutsideAttachment) {
        setShowAttachmentModal(false);
      }
    };

    if (showPicker || showAttachmentModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker, showAttachmentModal]);

  const handleFileSelect = (acceptType, optionlabel) => {
    setOptionLabel(optionlabel);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = acceptType;
    input.multiple = false;

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setShowPreviewModal(true);
      }
    };

    input.click();
  };

  const handleSendMedia = async () => {
    // Add validation
    if (!effectiveUserId || !isValidObjectId(effectiveUserId)) {
      toast.error("Invalid session");
      return;
    }

    if (!selectedFile) return;
    if (!fromNo) {
      toast.error("No recipient selected");
      return;
    }

    setSendingFile(true);
    try {
      const mimeType = selectedFile.type;
      let fileType = mimeType.split("/")[0];

      if (
        fileType === "application" ||
        mimeType.includes("pdf") ||
        mimeType.includes("document")
      ) {
        fileType = "document";
      }

      const fileExtension = selectedFile.name.split(".").pop();
      const uniqueFileName = `media_${uuidv4()}.${fileExtension}`;

      const formData = new FormData();
      formData.append("file", selectedFile, uniqueFileName);
      formData.append("filename", uniqueFileName);
      formData.append("to", fromNo);
      formData.append("from", "919820770814");
      formData.append("type", fileType);

      const response = await axios.post(
        `http://localhost:7821/api/admin/sendMediaToNumber/${effectiveUserId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: { dbType },
        },
      );

      if (response.status === 200 || response.data?.success) {
        const successMessage =
          optionLabel === "Document"
            ? "Document sent successfully!"
            : "Photo/Video sent successfully!";
        toast.success(successMessage);
      }
      setShowPreviewModal(false);
      setSelectedFile(null);
      setPreviewUrl("");
    } catch (error) {
      console.error("File send error:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to send file";
      toast.error(errorMsg);
    } finally {
      setSendingFile(false);
    }
  };

  // Add this function
  const handleInvalidSession = useCallback(() => {
    localStorage.removeItem("UserId");
    localStorage.removeItem("Id");
    localStorage.removeItem("UserName");
    localStorage.removeItem("UserType");
    localStorage.removeItem("BusinessUnit");
    toast.error("Session expired. Please login again.");
    // Navigate to login page
    // navigate('/login');
  }, []);

  const renderTime = ({ remainingTime }) => {
    if (remainingTime <= 0) {
      return <div className="timer">0</div>;
    }

    if (remainingTime < 60) {
      const secStr = remainingTime.toString().padStart(2, "0");
      return <div className="timer text-xs">{secStr}s</div>;
    }

    const hrs = Math.floor(remainingTime / 3600);
    const min = Math.floor((remainingTime % 3600) / 60);

    const hourStr = hrs.toString().padStart(2, "0");
    const minStr = min.toString().padStart(2, "0");

    return (
      <div className="timer text-xs">
        {hourStr}:{minStr}
      </div>
    );
  };

  const isEmoji = (char) => {
    const emojiRegex = /[\p{Emoji}\uFE0F]/u;
    return emojiRegex.test(char);
  };

  const isNumber = (char) => {
    return /^[0-9]$/.test(char);
  };

  const splitChars = (str) => {
    const regex = /([\p{Emoji}\uFE0F]|[\uD800-\uDBFF][\uDC00-\uDFFF])/gu;
    return str.match(regex) || [];
  };

  const hashToHue = (str) => {
    const s = String(str || "");
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    return Math.abs(hash) % 360;
  };

  const avatarGradientForName = (name) => {
    const hue = hashToHue(name);
    const hue2 = (hue + 40) % 360;
    return `linear-gradient(135deg, hsl(${hue} 70% 35%), hsl(${hue2} 70% 45%))`;
  };

  const renderAvatarContent = (name) => {
    if (!name) return "";

    if (/^[0-9]+$/.test(name)) {
      return name.substring(0, 1);
    }

    const chars = splitChars(name);
    const emojis = chars.filter(isEmoji);
    const lastEmoji = emojis.length > 0 ? emojis[emojis.length - 1] : null;

    const textParts = name.split(/[\s\p{Emoji}\uFE0F0-9]+/u).filter(Boolean);

    let initials = "";
    if (textParts.length > 0) {
      initials = textParts[0].substring(0, 1).toUpperCase();
      if (textParts.length > 1 && !lastEmoji) {
        initials += textParts[textParts.length - 1]
          .substring(0, 1)
          .toUpperCase();
      }
    }

    return (
      <span className="flex items-center text-[11px] font-medium">
        {initials}
        {lastEmoji && <span className="text-[10px]">{lastEmoji}</span>}
      </span>
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const yesterdayStart = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );
    const messageStart = new Date(
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate(),
    );

    if (messageStart.getTime() === todayStart.getTime()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (messageStart.getTime() === yesterdayStart.getTime()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const sortedCaseDetails = [...caseDetails].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  const formatDateHeader = (timestamp) => {
    const messageDate = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(messageDate, today)) return "Today";
    if (isSameDay(messageDate, yesterday)) return "Yesterday";

    return messageDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const calculateRemainingTime = (timestamp) => {
    const messageTime = timestamp * 1000;
    const now = Date.now();
    const elapsed = now - messageTime;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    return elapsed >= twentyFourHours
      ? 0
      : Math.floor((twentyFourHours - elapsed) / 1000);
  };

  useEffect(() => {
    const times = {};
    caseDetails.forEach((msg) => {
      times[msg.id] = calculateRemainingTime(msg.timestamp);
    });
    setCalculatedTime(times);
  }, [caseDetails]);

  const handleSendTemplates = async (item) => {
    await handleGetCaseNo(item);

    if (fetchTemp.length === 0) {
      await fetchPlanDetails();
    }

    setAllTemplates(true);
    setMessageValue("");
  };

  const handleAddReplyMessage = async () => {
    if (!newReplyText.trim()) return alert("Message cannot be empty");

    try {
      await fetch(
        `http://localhost:7821/api/admin/addReplyMessagesClient/${effectiveUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ReplyText: newReplyText }),
        },
      );

      setNewReplyText("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding reply message:", error);
    }
  };

  const handleUpdateUser = async () => {
    // Add validation
    if (!effectiveUserId || !isValidObjectId(effectiveUserId)) {
      toast.error("Invalid user session. Please login again.");
      return;
    }

    if (!userToEdit || !isValidObjectId(userToEdit)) {
      toast.error("Invalid user ID for update");
      return;
    }

    try {
      setLoadingBtn(true);
      await axios.patch(
        `http://localhost:7821/api/admin/updateUserDetails/${effectiveUserId}/${userToEdit}`,
        {
          Name: editForm.Name,
          From: editForm.From,
          Tags: editForm.tags,
          CompanyName: editForm.CompanyName,
          Designation: editForm.Designation,
          PersonalEmail: editForm.PersonalEmail,
          CompanyEmail: editForm.CompanyEmail,
          GroupName: editForm.GroupName,
          dbType,
        },
      );
      setLoadingBtn(false);
      setProfileDetails((prev) => ({
        ...prev,
        Name: editForm.Name,
        From: editForm.From,
        tags: editForm.tags,
        CompanyName: editForm.CompanyName,
        Designation: editForm.Designation,
        PersonalEmail: editForm.PersonalEmail,
        CompanyEmail: editForm.CompanyEmail,
        GroupName: editForm.GroupName,
      }));

      toast.success("Contact Details Updated Success");
      setShowEditModal(false);
    } catch (error) {
      setLoadingBtn(false);
      console.error(error);
      toast.error("Update failed");
    }
  };
  useEffect(() => {
    const pdfMessages = caseDetails.filter(
      (m) => m.body === "Whatsapp Document",
    );

    pdfMessages.forEach((m, index) => {
      // console.log(`PDF ${index}`, {
      //   timestamp: m.timestamp,
      //   time: new Date(m.timestamp * 1000).toLocaleString(),
      //   id: m.id,
      //   status: m.status,
      //   full: m,
      // });
    });
  }, [caseDetails]);

  console.log({
    dbType,
    isMessagingDisabled,
    timer,
  });
  return (
    <>
      {dbSwitching && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
          <CgSpinner className="h-10 w-10 animate-spin text-[#247f32]" />
          <p>Loading Chats...</p>
        </div>
      )}

      <div className="h-screen flex flex-col">
        <div className="bg-[#dcf8c6]">
          <Header pageName={pageName} />
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="bg-cover bg-no-repeat">
            <div className="">
              {loading ? (
                <div className="m-32 text-center text-7xl flex justify-center">
                  <RotatingLines
                    visible={true}
                    height="56"
                    width="56"
                    strokeColor="grey"
                    strokeWidth="5"
                    animationDuration="0.75"
                    ariaLabel="rotating-lines-loading"
                  />
                </div>
              ) : (
                <div className="flex">
                  <div className="chat-list-panel">
                    <div className="chat-list-topbar">
                      <div className="chat-filter-tabs">
                        <button
                          onClick={() => setOnUnread(false)}
                          className={`filter-tab${!onRead ? " active" : ""}`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setOnUnread(true)}
                          className={`filter-tab${onRead ? " active" : ""}`}
                          style={{ position: "relative" }}
                        >
                          Unread
                          {msgCountUnread > 0 && (
                            <span
                              style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                background: "#ef4444",
                                color: "#fff",
                                fontSize: "9px",
                                fontWeight: 700,
                                borderRadius: "9999px",
                                minWidth: "16px",
                                height: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "0 3px",
                              }}
                            >
                              {msgCountUnread > 99 ? "99+" : msgCountUnread}
                            </span>
                          )}
                        </button>
                      </div>
                      <div className="chat-search-row">
                        <div className="chat-search-box">
                          <FaSearch
                            style={{
                              color: "#9ca3af",
                              flexShrink: 0,
                              fontSize: "13px",
                            }}
                          />
                          <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search name or number…"
                          />
                          {searchInput && (
                            <button
                              onClick={() => setSearchInput("")}
                              style={{ display: "flex", color: "#6b7280" }}
                            >
                              <RxCross2 size={14} />
                            </button>
                          )}
                        </div>
                        <div
                          className="icon-btn"
                          onClick={() => setPlusModel(true)}
                        >
                          <CiCirclePlus size={22} />
                        </div>
                        <div
                          className="icon-btn"
                          style={{ position: "relative" }}
                          onClick={() => setFilterModel((prev) => !prev)}
                        >
                          <IoFilterCircleOutline size={22} />
                          {(repliedChatChecked ||
                            lessThan24Checked ||
                            tagsChecked) && (
                            <span
                              style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#25d366",
                                border: "1.5px solid #fff",
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div
                        className={`transition-all duration-200 overflow-hidden ${filterModel ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}
                      >
                        <div
                          className="filter-dropdown"
                          style={{ marginTop: "8px" }}
                        >
                          <label>
                            <input
                              type="checkbox"
                              checked={repliedChatChecked}
                              onChange={(e) =>
                                setRepliedChatChecked(e.target.checked)
                              }
                            />{" "}
                            Replied Chat
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              checked={lessThan24Checked}
                              onChange={(e) =>
                                setLessThan24Checked(e.target.checked)
                              }
                            />{" "}
                            Less than 24 hours
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              checked={tagsChecked}
                              onChange={(e) => setTagsChecked(e.target.checked)}
                            />{" "}
                            Has Tags
                          </label>
                        </div>
                      </div>
                    </div>

                    {plusModel && (
                      <PlusModal
                        userId={effectiveUserId}
                        plusModel={plusModel}
                        setPlusModel={setPlusModel}
                        fromNo={fromNo}
                        handleSendTemplates={handleSendTemplates}
                        repliedChatChecked={repliedChatChecked}
                        lessThan24Checked={lessThan24Checked}
                        tagsChecked={tagsChecked}
                        onRead={onRead}
                      />
                    )}

                    {allTemplates && (
                      <div className="fixed inset-0 z-10 bg-black/40 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-3 rounded-2xl overflow-auto">
                          <div className="flex w-fit p-1 rounded-lg justify-end text-xs text-gray-100 bg-gray-400">
                            <h1>
                              Send To: {Name} [{fromNo}]
                            </h1>
                          </div>
                          <div className="flex justify-between items-center">
                            <h2 className="text-lg text-center font-bold">
                              Templates
                            </h2>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="30"
                              height="30"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                              className="bi bi-x cursor-pointer text-gray-500"
                              onClick={() => setAllTemplates(false)}
                            >
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                            </svg>
                          </div>
                          <div className="w-[350px] h-[350px] overflow-auto scrollbar-hidden">
                            <div className="flex flex-col justify-center items-center">
                              {fetchTemp.map((template, index) => (
                                <div key={index}>
                                  <MemoizedTemplateMessage
                                    index={index}
                                    template={template}
                                    isItemSelected={isItemSelected}
                                    handleCheckboxChange={handleCheckboxChange}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-center items-center">
                            <button
                              disabled={loadSendTemplate}
                              onClick={handleSendTemplate}
                              className={`rounded-full py-2 mt-2 px-6 ${
                                loadSendTemplate
                                  ? "bg-gray-300"
                                  : "bg-[#128c7e] hover:bg-[#25d366]"
                              }   text-white flex justify-center items-center gap-2`}
                            >
                              Send
                              <IoSend />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {allReplyMessages && (
                      <div className="fixed inset-0 z-10 bg-[#ffefe6] bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-4 rounded-lg overflow-auto">
                          <div className="flex justify-end mb-2">
                            <h1>
                              Send To: {Name}({fromNo})
                            </h1>
                          </div>
                          <div className="flex justify-between items-center">
                            <h2 className="text-lg text-center font-bold">
                              Canned Messages
                            </h2>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="40"
                              height="40"
                              fill="currentColor"
                              className="bi bi-x cursor-pointer"
                              viewBox="0 0 16 16"
                              onClick={() => setAllReplyMessages(false)}
                            >
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                            </svg>
                          </div>
                          <div className="w-[350px] h-[350px] overflow-auto">
                            <div className="flex flex-col justify-center items-start w-full">
                              {fetchReplyMsg.map((msg, index) => {
                                const isSelected =
                                  selectedMessages.includes(msg);
                                const number =
                                  selectedMessages.indexOf(msg) + 1;
                                return (
                                  <label
                                    key={index}
                                    className="flex items-center gap-2 w-full cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() =>
                                        handleCheckboxChange1(msg)
                                      }
                                    />
                                    <span className="break-words flex">
                                      {isSelected ? (
                                        <h1 className="items-center flex justify-center bg-yellow-400 text-red-600 w-4 h-4 p-2 rounded-full">
                                          {number}
                                        </h1>
                                      ) : (
                                        ""
                                      )}
                                      {msg}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex justify-center gap-4 items-center">
                            <button
                              className={`rounded-full py-2 mt-4 px-3 ${
                                loadingSendMsg
                                  ? "bg-gray-300"
                                  : "bg-[#128c7e] hover:bg-[#25d366]"
                              }   text-black`}
                              onClick={() => setShowAddModal(true)}
                            >
                              Add
                            </button>
                            <button
                              disabled={loadingSendMsg}
                              onClick={handleSendMessage1}
                              className={`rounded-full py-2 mt-4 px-3 ${
                                loadingSendMsg
                                  ? "bg-gray-300"
                                  : "bg-[#128c7e] hover:bg-[#25d366]"
                              }   text-black`}
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {showAddModal && (
                      <div className="fixed inset-0 z-20 bg-[#ffefe6] bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-4 rounded-lg w-[300px]">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">
                              Add Reply Message
                            </h2>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="currentColor"
                              className="cursor-pointer"
                              onClick={() => setShowAddModal(false)}
                              viewBox="0 0 16 16"
                            >
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                            </svg>
                          </div>

                          <textarea
                            value={newReplyText}
                            onChange={(e) => setNewReplyText(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full border p-2 rounded"
                          />

                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              className="bg-gray-300 px-4 py-2 rounded"
                              onClick={() => setShowAddModal(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="bg-[#128c7e] hover:bg-[#25d366] px-4 py-2 rounded text-white"
                              onClick={handleAddReplyMessage}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      onScroll={handleScroll}
                      className="scrollbar-hidden"
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        scrollbarWidth: "none",
                      }}
                    >
                      {filteredData

                        .slice()
                        .sort(
                          (a, b) =>
                            (b.lastTimeStamp || 0) - (a.lastTimeStamp || 0),
                        )
                        .map((item) => (
                          <div
                            key={item._id}
                            className={`chat-item ${fromNo === item.From ? "selected" : ""}`}
                            onClick={() => {
                              handleGetCaseNo(item);
                              setProfileModal(false);
                            }}
                          >
                            <div
                              className="chat-avatar"
                              style={{
                                background: avatarGradientForName(
                                  item?.Name || item?.profile || item?.From,
                                ),
                              }}
                            >
                              {renderAvatarContent(
                                item?.Name || item?.profile || item?.From,
                              )}
                            </div>

                            <div className="chat-item-content">
                              <div className="chat-item-header">
                                <span className="chat-item-name">
                                  {item?.Name || item?.profile || item?.From}
                                </span>
                                <span className="chat-item-time">
                                  {item.lastTimeStamp
                                    ? formatTimestamp(item.lastTimeStamp)
                                    : ""}
                                </span>
                              </div>

                              <div className="chat-item-footer">
                                <div
                                  className={`chat-item-preview ${
                                    !item?.adminReadLast ? "unread" : ""
                                  }`}
                                >
                                  {(() => {
                                    const messages = item?.msgCount || [];
                                    const lastMessage =
                                      messages[messages.length - 1];

                                    if (!lastMessage) return "No messages";

                                    if (
                                      lastMessage.body?.endsWith?.(".jpg") ||
                                      lastMessage.body?.startsWith?.("image_")
                                    )
                                      return "📷 Photo";

                                    if (lastMessage.body?.endsWith?.(".mp4"))
                                      return "🎥 Video";

                                    if (lastMessage.body?.endsWith?.(".pdf"))
                                      return "📄 Document";

                                    if (lastMessage.interactiveMsg) {
                                      if (
                                        lastMessage.interactiveMsg.type ===
                                        "flow"
                                      )
                                        return "📋 Flow message";

                                      if (
                                        lastMessage.interactiveMsg.type ===
                                        "button"
                                      )
                                        return "🔘 Button";

                                      if (
                                        lastMessage.interactiveMsg.type ===
                                        "list"
                                      )
                                        return "📋 List";
                                    }

                                    if (lastMessage.body?.includes("Template:"))
                                      return "📝 Template";

                                    const text = lastMessage.body || "";

                                    if (lastMessage.userType === "Admin") {
                                      return `You: ${
                                        text.length > 30
                                          ? text.substring(0, 30) + "..."
                                          : text
                                      }`;
                                    }

                                    return text.length > 35
                                      ? text.substring(0, 35) + "..."
                                      : text;
                                  })()}
                                </div>

                                {!item?.adminReadLast &&
                                  item?.msgCount?.length > 0 && (
                                    <span className="unread-badge">
                                      {item.msgCount.length}
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}

                      {loadingChats && (
                        <div className="">
                          {Array.from({
                            length:
                              filteredData.length > 0
                                ? filteredData.length < 15
                                  ? 15 - filteredData.length
                                  : 6
                                : 15,
                          }).map((_, index) => (
                            <div
                              key={index}
                              className="flex flex-col justify-start items-start w-30 h-auto overflow-hidden bg-white relative mx-1"
                            >
                              <div className="absolute inset-0 transform -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100 to-transparent z-10"></div>

                              <div className="flex justify-start items-center mt-1 pl-3 pr-2 w-full relative z-20">
                                <div className=" w-5/6 flex items-center gap-2">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300"></div>
                                  <div className="h-4 bg-gray-300 rounded w-4/5"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <div className="h-3 bg-gray-300 rounded w-full mt-1"></div>
                                  </div>
                                  <div className="flex justify-end mt-1">
                                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full h-[1px] bg-gray-100 mt-1 z-20 relative"></div>
                            </div>
                          ))}
                        </div>
                      )}
                      {filteredData.length === 0 &&
                        !loadingChats &&
                        onRead &&
                        msgCountUnread === 0 && (
                          <div className="flex flex-col items-center justify-center h-[500px] text-center p-6">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 shadow-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                />
                              </svg>
                            </div>

                            <h2 className="text-lg font-semibold text-gray-700 mb-1">
                              No Unread Messages
                            </h2>

                            <p className="text-sm text-gray-500 max-w-xs">
                              You're all caught up! When you receive new
                              messages, they'll show up here.
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="sm:w-[96dvw] sm:h-[93dvh] flex flex-col whatsapp-chat-bg">
                    {fromNo && (
                      <div
                        className="chat-header"
                        onClick={() => handleGetProfileData(fromNo)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flex: 1,
                          }}
                        >
                          <div
                            className="chat-avatar"
                            style={{
                              width: "36px",
                              height: "36px",
                              fontSize: "13px",
                              background: avatarGradientForName(Name),
                            }}
                          >
                            {renderAvatarContent(Name)}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="chat-header-name">{Name}</div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginLeft: "auto",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    background: "#dfdfdf",
                                    padding: "4px 8px",
                                    borderRadius: "20px",
                                    marginRight: "12px",
                                    marginTop: "14px",
                                  }}
                                >
                                  <input
                                    type="text"
                                    placeholder="Search in chat..."
                                    value={chatSearch}
                                    onChange={(e) =>
                                      setChatSearch(e.target.value)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      padding: "4px 8px",
                                      fontSize: "13px",
                                      outline: "none",
                                      width: "140px",
                                    }}
                                  />
                                  {matchedMessages.length > 0 && (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "#666",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {currentMatch + 1}/
                                      {matchedMessages.length}
                                    </span>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      goPrev();
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: "2px 4px",
                                    }}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      goNext();
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: "2px 4px",
                                    }}
                                  >
                                    ↓
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="chat-header-meta">
                              {fromNo && <span>+91-{fromNo.slice(2, 12)}</span>}
                              {CompanyName && (
                                <>
                                  <span style={{ margin: "0 5px" }}>•</span>
                                  <span>{CompanyName}</span>
                                </>
                              )}
                              {Designation && (
                                <>
                                  <span style={{ margin: "0 5px" }}>•</span>
                                  <span>{Designation}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <CountdownCircleTimer
                          size={38}
                          strokeWidth={2}
                          isPlaying
                          duration={timer}
                          initialRemainingTime={timer}
                          colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                          colorsTime={[10, 6, 3, 0]}
                          onComplete={() => ({ shouldRepeat: false })}
                        >
                          {renderTime}
                        </CountdownCircleTimer>
                      </div>
                    )}

                    <div
                      className="flex-1 overflow-auto bg-[#ece5dd] scrollbar-hidden chat-message-container"
                      ref={chatContainerRef}
                    >
                      <div className="sticky top-0 z-0 flex justify-center py-1">
                        {selectedCase && (
                          <span className="bg-white text-gray-500 tracking-wide rounded-full px-4 py-1 text-xs shadow-md">
                            {currentDate}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col w-full p-2">
                        {!loadingMessages && !fromNo && (
                          <BusinessWhatsAppPlaceholder />
                        )}
                        {loadingMessages ? (
                          <div className="flex h-[70vh] items-center justify-center">
                            <CgSpinner className="h-10 w-10 animate-spin" />
                          </div>
                        ) : (
                          sortedCaseDetails.map((msg, index) => {
                            const currentDateObj = new Date(
                              msg.timestamp * 1000,
                            );
                            const prevDateObj =
                              index > 0
                                ? new Date(
                                    sortedCaseDetails[index - 1].timestamp *
                                      1000,
                                  )
                                : null;

                            const isOldest = index === 0;
                            const showHeader =
                              !prevDateObj ||
                              !isSameDay(currentDateObj, prevDateObj);

                            return (
                              <React.Fragment
                                key={`${msg.id}-${msg.timestamp}-${index}`}
                              >
                                {showHeader && (
                                  <div
                                    className={`date-header w-full flex justify-center my-3 ${isOldest ? "invisible" : ""}`}
                                    data-date={formatDateHeader(msg.timestamp)}
                                  >
                                    <div className="bg-white tracking-wide text-gray-500 shadow-md rounded-full px-4 py-1 text-xs">
                                      {formatDateHeader(msg.timestamp)}
                                    </div>
                                  </div>
                                )}

                                <div
                                  ref={(el) =>
                                    (messageRefs.current[msg.id] = el)
                                  }
                                >
                                  <MessageItem
                                    name={Name || selectedCase?.Name}
                                    msg={msg}
                                    isAdmin={msg.userType === "Admin"}
                                    setReplyMessage={setReplyMessage}
                                    setReplyId={setReplyId}
                                    setTimer={setTimer}
                                    caseDetails={caseDetails}
                                    lastTime={lastTime}
                                    userId={effectiveUserId}
                                    isLastMessage={
                                      index === caseDetails.length - 1
                                    }
                                    scrollToBottom={scrollToBottom}
                                    chatSearch={chatSearch}
                                    highlight={highlight}
                                  />
                                </div>
                              </React.Fragment>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {fromNo && (
                      <div className="msg-input-wrapper">
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "flex-end",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            {replyMessage && (
                              <div className="reply-preview">
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "2px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      color: "#075e54",
                                    }}
                                  >
                                    {Name || selectedCase?.Name}
                                  </span>
                                  <RxCross2
                                    size={14}
                                    onClick={() => {
                                      setReplyMessage("");
                                      setReplyId("");
                                    }}
                                    style={{
                                      cursor: "pointer",
                                      color: "#6b7280",
                                    }}
                                  />
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <IoReturnDownForwardOutline
                                    size={13}
                                    style={{ color: "#6b7280", flexShrink: 0 }}
                                  />
                                  <span className="reply-preview-text">
                                    {replyMessage.length > 230
                                      ? replyMessage.slice(0, 230) + "..."
                                      : replyMessage}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div
                              className={`msg-input-box${replyMessage ? " has-reply" : ""}`}
                              style={{ position: "relative" }}
                            >
                              {timer > 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "4px",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => setShowPicker((p) => !p)}
                                    style={{
                                      color: "#6b7280",
                                      display: "flex",
                                    }}
                                  >
                                    <MdOutlineEmojiEmotions size={20} />
                                  </button>
                                  <FiPlus
                                    size={18}
                                    onClick={() =>
                                      setShowAttachmentModal((p) => !p)
                                    }
                                    style={{
                                      cursor: "pointer",
                                      color: "#6b7280",
                                    }}
                                  />
                                </div>
                              )}
                              <textarea
                                value={messageValue}
                                ref={textareaRef}
                                onChange={handleGetMsg}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();

                                    if (!isMessagingDisabled) {
                                      replyMessage
                                        ? handleSendReplyMessage()
                                        : handleSendMessage();
                                    }
                                  }
                                }}
                                placeholder={
                                  dbType === "company"
                                    ? "Reply disabled for company database"
                                    : timer <= 0
                                      ? ""
                                      : "Type a message…"
                                }
                                className="msg-textarea"
                                disabled={timer <= 0 || isMessagingDisabled}
                                style={
                                  timer <= 0 || isMessagingDisabled
                                    ? {
                                        background: "#f3f4f6",
                                        cursor: "not-allowed",
                                      }
                                    : {}
                                }
                              />
                              {showPicker && (
                                <div
                                  ref={pickerRef}
                                  className="absolute bottom-[5.2rem] left-0 z-10"
                                >
                                  <Picker onEmojiSelect={handleEmojiSelect} />
                                </div>
                              )}
                              {showAttachmentModal && (
                                <div
                                  ref={attachmentRef}
                                  className="absolute bottom-[5.2rem] left-0 w-auto bg-white rounded-2xl border border-gray-200 z-50"
                                >
                                  <div className="grid grid-rows-2 p-3 gap-2">
                                    {attachmentOptions.map((option, index) => (
                                      <div
                                        key={index}
                                        className="flex flex-row items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                                        onClick={() => {
                                          setShowAttachmentModal(false);
                                          handleFileSelect(
                                            option.accept,
                                            option.label,
                                          );
                                        }}
                                      >
                                        {option.icon}
                                        <span className="text-sm text-gray-600">
                                          {option.label}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            {showPreviewModal && (
                              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                <div className="bg-gray-100 rounded-lg sm:w-fit sm:h-[85vh] overflow-hidden">
                                  <div className="flex justify-end items-center p-2">
                                    <button
                                      onClick={() => {
                                        setShowPreviewModal(false);
                                        setSelectedFile(null);
                                        setPreviewUrl("");
                                      }}
                                      className="text-gray-500 hover:text-gray-700"
                                    >
                                      <MdClose size={24} />
                                    </button>
                                  </div>
                                  <div className="p-4 flex justify-center items-center h-[70vh]">
                                    {selectedFile?.type.startsWith("image/") ? (
                                      <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain border"
                                      />
                                    ) : selectedFile?.type.startsWith(
                                        "video/",
                                      ) ? (
                                      <video
                                        controls
                                        className="max-w-full max-h-full"
                                      >
                                        <source
                                          src={previewUrl}
                                          type={selectedFile.type}
                                        />
                                      </video>
                                    ) : (
                                      <div className="text-center">
                                        <IoDocumentText
                                          size={48}
                                          className="mx-auto text-gray-400"
                                        />
                                        <p className="mt-2">
                                          {selectedFile?.name}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex justify-end items-center p-3">
                                    <button
                                      onClick={handleSendMedia}
                                      disabled={sendingFile}
                                      className="text-white text-sm font-medium flex items-center gap-2 bg-green-700 hover:bg-green-800 px-3 py-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {sendingFile ? (
                                        <>
                                          <div
                                            style={{
                                              width: "15px",
                                              height: "15px",
                                              border: "2px solid white",
                                              borderTopColor: "transparent",
                                              borderRadius: "50%",
                                              animation:
                                                "spin 0.7s linear infinite",
                                            }}
                                          />
                                          Sending...
                                        </>
                                      ) : (
                                        <>
                                          Send <IoSend size={15} />
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              flexShrink: 0,
                            }}
                          >
                            <button
                              className="msg-send-btn"
                              onClick={
                                replyMessage
                                  ? handleSendReplyMessage
                                  : handleSendMessage
                              }
                              disabled={
                                loadingSendMsg ||
                                !messageValue ||
                                dbType === "company"
                              }
                            >
                              {!loadingSendMsg ? (
                                <IoSend size={16} color="white" />
                              ) : (
                                <div
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid #fff",
                                    borderTopColor: "transparent",
                                    borderRadius: "50%",
                                    animation: "spin 0.7s linear infinite",
                                  }}
                                />
                              )}
                            </button>
                            <button
                              className="msg-template-btn"
                              disabled={dbType === "company"}
                              onClick={async () => {
                                setAllTemplates(true);
                                if (fetchTemp.length === 0) {
                                  await fetchPlanDetails();
                                }
                              }}
                              title="Templates"
                            >
                              📄
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {profileModal && (
                      <div
                        className="fixed inset-0 z-50 flex justify-end"
                        onClick={() => setProfileModal(false)}
                      >
                        {!loadingProfileDetails ? (
                          <div
                            ref={profileModalRef}
                            className="h-fit w-fit max-h-[75vh] bg-white shadow-lg border mr-1 mt-[4rem] rounded-xl overflow-y-auto scrollbar-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-between items-center gap-2 px-3 py-2 bg-gray-100">
                              <div className="flex justify-start items-center gap-2">
                                <div className="flex-shrink-0 w-[2rem] h-[2rem] rounded-full bg-gray-600 flex items-center justify-center text-white text-xl font-medium">
                                  {renderAvatarContent(
                                    profileDetails?.Name ||
                                      profileDetails?.profile ||
                                      profileDetails?.From,
                                  )}
                                </div>
                                {profileDetails?.Name ||
                                  profileDetails?.profile ||
                                  profileDetails?.From ||
                                  "-"}
                              </div>
                              <div className="flex justify-end mr-2 text-gray-500 hover:text-black">
                                <CiEdit
                                  size={25}
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setShowEditModal(true);
                                    setUserToEdit(profileDetails._id);
                                    setEditForm({
                                      Name: profileDetails.Name || "",
                                      Profile: profileDetails.profile || "",
                                      From: profileDetails.From || "",
                                      tags: profileDetails.tags || [],
                                      CompanyName:
                                        profileDetails.CompanyName || "",
                                      CompanyEmail:
                                        profileDetails.CompanyEmail || "",
                                      PersonalEmail:
                                        profileDetails.PersonalEmail || "",
                                      Designation:
                                        profileDetails.Designation || "",
                                      newTag: "",
                                      GroupName: Array.isArray(
                                        profileDetails.GroupName,
                                      )
                                        ? profileDetails.GroupName
                                        : profileDetails.GroupName
                                          ? [profileDetails.GroupName]
                                          : [],
                                    });
                                  }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-gray-700 px-4 py-3">
                              <div>
                                <div className="text-sm text-gray-500">
                                  Name
                                </div>
                                <div className="text-base font-medium">
                                  {profileDetails?.Name ||
                                    profileDetails?.profile ||
                                    "-"}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">
                                  Phone No
                                </div>
                                <div className="text-base font-medium">
                                  {profileDetails?.From?.slice(2, 12) || "-"}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">
                                  Designation
                                </div>
                                <div className="text-base font-medium">
                                  {profileDetails?.Designation || "-"}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">
                                  Company Name
                                </div>
                                <div className="text-base font-medium">
                                  {profileDetails?.CompanyName || "-"}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">
                                  Company Email
                                </div>
                                <div className="text-base font-medium">
                                  {profileDetails?.CompanyEmail || "-"}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">
                                  Personal Email
                                </div>
                                <div className="text-base font-medium">
                                  {profileDetails?.PersonalEmail || "-"}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-sm text-gray-500">
                                  Group Name
                                </div>
                                <div className="text-base font-medium flex flex-wrap gap-2 mb-2">
                                  {profileDetails.GroupName?.length > 0
                                    ? profileDetails.GroupName.map((g, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-green-200 rounded text-sm text-gray-700 mt-1 flex items-center"
                                        >
                                          {g}
                                        </span>
                                      ))
                                    : "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-[18vw] h-[45vh] bg-white shadow-lg border mr-1 mt-[4rem] rounded-xl overflow-y-auto scrollbar-hidden flex items-center justify-center">
                            <div className="w-[40px] h-[40px] border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {showEditModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                  <div
                    style={{ scrollbarWidth: "none" }}
                    className="bg-white rounded-lg p-6 w-full h-[80%] overflow-auto max-w-md shadow-lg"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                      <button
                        onClick={() => setShowEditModal(false)}
                        className=" text-gray-500 text-[20px] mb-4 hover:text-black"
                      >
                        ✕
                      </button>
                    </div>

                    <label className="text-gray-400">Name</label>
                    <input
                      type="text"
                      value={editForm.Name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, Name: e.target.value })
                      }
                      className="w-full mb-3 p-2 border rounded"
                    />

                    <label className="text-gray-400">Profile Name</label>
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
                        setEditForm({ ...editForm, From: e.target.value })
                      }
                      className="w-full mb-3 p-2 border rounded"
                    />

                    <label className="text-gray-400">Company Name</label>
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

                    <label className="text-gray-400">Personal Email</label>
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

                    <label className="text-gray-400">Company Email</label>
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
                                  (_, i) => i !== idx,
                                ),
                              }))
                            }
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

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
                      <div className="flex flex-wrap gap-2 mb-2 mt-1">
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
                                  tags: prev.tags.filter((_, i) => i !== index),
                                }))
                              }
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        disabled={loadingBtn}
                        onClick={handleUpdateUser}
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
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default ReplyPage;
