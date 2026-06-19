import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import "./Header.css";
// Add this after your imports
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
const Header = ({ pageName }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { id: userId } = useParams();
  const [adminName, setAdminName] = useState("");
  const [Id, setId] = useState("");

  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const tolerance = 2; // small buffer for rounding errors
    const maxScrollLeft = el.scrollWidth - el.clientWidth;

    // left arrow only if not at start
    setCanScrollLeft(el.scrollLeft > tolerance);

    // right arrow only if not at end
    setCanScrollRight(el.scrollLeft < maxScrollLeft - tolerance);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
    setTimeout(checkScroll, 300); // give time for smooth scroll to settle
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  const socketRef = useRef(null);
  const [recentContact, setRecentContacts] = useState([]);
  const [dbType, setDbType] = useState(
  localStorage.getItem("dbType") || "company"
);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const pendingDbTimeoutRef = useRef(null);

  const templatePageNames = new Set([
    "Create Template",
    "All Templates",
    // other template pages can be added here if needed
  ]);

  const campaignPageNames = new Set([
    "Campaigns",
    "Campaign Detail",
    // other campaign pages can be added here if needed
  ]);

  const isDbSwitchDisabled =
    templatePageNames.has(pageName) ||
    campaignPageNames.has(pageName);

 // In Header.js, modify the handleDbChange function:
const handleDbChange = (e) => {
  const value = e.target.value;

  // Prevent any change when DB switch is disabled for the current tab/page
  if (isDbSwitchDisabled) return;

  // Prevent double toggles while loading
  if (value === dbType || isDbLoading) return;

  setIsDbLoading(true);
  
  // Clear any existing timeout
  if (pendingDbTimeoutRef.current) {
    clearTimeout(pendingDbTimeoutRef.current);
  }
  
  // Set a longer timeout for safety (10 seconds)
  pendingDbTimeoutRef.current = setTimeout(() => {
    console.warn("DB switch timeout - forcing loading to stop");
    setIsDbLoading(false);
  }, 10000);
  
  setDbType(value);
  localStorage.setItem("dbType", value);

  // Notify the rest of the app
  window.dispatchEvent(
    new CustomEvent("dbChanged", {
      detail: value,
    })
  );
};
  useEffect(() => {
    requestAnimationFrame(() => checkScroll());
  }, [recentContact]);
// Add this after your other useEffects
useEffect(() => {
  if (userId && !isValidObjectId(userId)) {
    console.error('Invalid ObjectId format in Header:', userId);
  }
}, [userId]);


 useEffect(() => {
  // Add dbType to socket connection
  socketRef.current = io("http://localhost:7821", {
    query: { dbType }
  });

  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };
}, [dbType]); // Add dbType as dependency

  // Turn off spinner when DB actually propagates
  // (We turn it off on the next successful fetch that happens after dbType changes.)
  // In Header.js, modify the useEffect that sets isDbLoading
useEffect(() => {
  if (!isDbLoading) return;

  const t = setTimeout(() => {
    // fallback: ensure spinner shows long enough for slow internet
    setIsDbLoading(false);
  }, 5000); // Increased from 3000 to 5000ms

  return () => clearTimeout(t);
}, [dbType, isDbLoading]);

// Also ensure fetch completes properly
useEffect(() => {
  let isMounted = true;
  
  const fetchRecentContats = async () => {
     if (!userId || !isValidObjectId(userId)) {
      console.error('Invalid userId for fetching recent contacts');
      if (isMounted) setIsDbLoading(false);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:7821/api/admin/getRecentContactDetails/${userId}`, {
        params: { dbType }
      });
      if (isMounted) {
        setRecentContacts(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      // When this fetch completes, DB has propagated to the UI.
      if (isMounted) {
        setIsDbLoading(false);
      }
    }
  };

  if (pageName === "Live Chats") {
    fetchRecentContats();
  }

  return () => {
    isMounted = false;
  };
}, [userId, dbType, pageName]);

useEffect(() => {
  if (!socketRef.current) return;

  const handleRecentContactsUpdate = (contacts) => {
    setRecentContacts((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(contacts)) {
        return contacts;
      }
      return prev;
    });
  };

  socketRef.current.on("UpdateRecentContact", handleRecentContactsUpdate);

  return () => {
    if (socketRef.current) {
      socketRef.current.off("UpdateRecentContact", handleRecentContactsUpdate);
    }
  };
}, [dbType]); // Add dbType as dependency

  const userType = localStorage.getItem("UserType");

useEffect(() => {
  const storedAdminName = localStorage.getItem("UserName");
  // 🔥 Change this - use UserId instead of Id
  const storedUserId = localStorage.getItem("UserId"); // ObjectId
  const storedStringId = localStorage.getItem("Id"); // Legacy string ID (for backward compatibility)

  if (storedAdminName) {
    setAdminName(storedAdminName);
  }

  // You might not need this state anymore
  if (storedUserId) {
    setId(storedUserId);
  } else if (storedStringId) {
    setId(storedStringId);
  }
}, []); // Empty dependency array means this runs once on mount

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
 const handleOpenProfile = () => {
  // Add validation
  if (userType === "Admin") return;
  
  if (!userId || !isValidObjectId(userId)) {
    console.error('Invalid userId for profile navigation');
    return;
  }
  
  navigate(`/profile/${userId}`);
};
const handleOpenNotification = () => {
  // Add validation
  if (!userId || !isValidObjectId(userId)) {
    console.error('Invalid userId for notification navigation');
    return;
  }
  
  navigate(`/Readnotification/${userId}`);
};

  const handleClick = (contactNo) => {
    if (!userId || !isValidObjectId(userId)) {
    console.error('Invalid userId for navigation');
    return;
  }
  
  if (!contactNo) {
    console.error('Invalid contact number');
    return;
  }
    navigate(
    `/replyPage/${userId}/${contactNo}?dbType=${dbType}`
  );
  };

  const splitChars = (str) => {
    const regex = /([\p{Emoji}\uFE0F]|[\uD800-\uDBFF][\uDC00-\uDFFF])/gu;
    return str.match(regex) || [];
  };
  const isEmoji = (char) => {
    const emojiRegex = /[\p{Emoji}\uFE0F]/u;
    return emojiRegex.test(char);
  };
  const renderAvatarContent = (name) => {
    if (!name) return "";

    // Check if entire string is numbers
    if (/^[0-9]+$/.test(name)) {
      return name.substring(0, 1); // Return first digit only
    }

    const chars = splitChars(name);
    const emojis = chars.filter(isEmoji);
    const lastEmoji = emojis.length > 0 ? emojis[emojis.length - 1] : null;

    // Get text parts (non-emoji, non-number)
    const textParts = name.split(/[\s\p{Emoji}\uFE0F0-9]+/u).filter(Boolean);

    // Get initials
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
      <span className="flex justify-center items-center">
        {initials}
        {lastEmoji && <span className="text-xs">{lastEmoji}</span>}
      </span>
    );
  };
  return (
    <div
      className="header-bar"
      style={{ left: userType === "Admin" ? "62px" : "0", position: "relative" , marginTop:"2px" }}
    >
      {/* Page Title */}
      <span className="header-page-title">{pageName}</span>

      {/* Recent Contacts Strip — only on Live Chats */}
      {pageName === "Live Chats" && recentContact.length > 0 && (
        <div className="header-recent-strip">
          {canScrollLeft && (
            <button className="header-scroll-btn" onClick={scrollLeft}>
              <FaArrowAltCircleLeft size={14} />
            </button>
          )}
          <div className="header-recent-list" ref={scrollRef}>
            {recentContact.map((contact, i) => (
              <div
                key={i}
                className="header-recent-contact"
                onClick={() => handleClick(contact?.From)}
              >
                <div className="header-recent-avatar">
                  {renderAvatarContent(contact?.Name || contact?.profile || contact?.From)}
                </div>
                <span className="header-recent-name">
                  {contact?.Name || contact?.profile || contact?.From}
                </span>
              </div>
            ))}
          </div>
          {canScrollRight && (
            <button className="header-scroll-btn" onClick={scrollRight}>
              <FaArrowAltCircleRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* Right: user badge + db switcher */}
      <div className="header-right">
        {adminName && (
          <div className="header-user-badge">
            <div className="header-user-avatar">
              {adminName.substring(0, 1).toUpperCase()}
            </div>
            {adminName}
          </div>
        )}
        <div className="header-db-switcher" style={{ position: "relative" }}>
          {isDbLoading && <div className="header-db-overlay" aria-hidden="true" />}

          <span style={{ opacity: isDbLoading ? 0.6 : 1 }}>DB</span>
          <select
            value={dbType}
            onChange={handleDbChange}
            disabled={isDbLoading || isDbSwitchDisabled}
            style={{
              opacity: isDbLoading || isDbSwitchDisabled ? 0.5 : 1,
              cursor: isDbLoading || isDbSwitchDisabled ? "not-allowed" : "pointer",
            }}
          >
            <option value="demo">DigiLateral</option>
            <option value="company">Aristo</option>
          </select>

          {isDbLoading && (
            <div className="header-db-spinner" role="status" aria-label="Loading" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
