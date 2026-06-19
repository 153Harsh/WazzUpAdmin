import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { IoCheckmark, IoCheckmarkDoneSharp, IoCall } from "react-icons/io5";
import { MdErrorOutline, MdContentCopy } from "react-icons/md";
import { LuReply } from "react-icons/lu";
import { IoMdDownload } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { FaFilePdf, FaFileAlt } from "react-icons/fa";
import { BsPlayCircleFill } from "react-icons/bs";
import TranslationImg from "../../../public/Translation_on_us_digiLATERAL.jpg";
import PropTypes from 'prop-types';
// Add this after your imports
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
const ENABLE_VERBOSE_LOGGING = false;
const ENABLE_MESSAGE_LOGGING = true;

const log = (level, component, message, data = null) => {
  if (level === 'debug' && !ENABLE_VERBOSE_LOGGING) return;
  if (level === 'info' && !ENABLE_MESSAGE_LOGGING) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}] [${component}]`;
  
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

const getDbType = () => {
  const dbType = localStorage.getItem("dbType");
  // Validate dbType
  return dbType === "company" ? "company" : "demo";
};
const formatTimestamp = (ts) => {
  const d = new Date(ts * 1000);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

const parseWA = (text) => {
  if (!text) return null;
  return text.split("\n").map((line, li, arr) => {
    const tokens = [];
    let remaining = line;
    const patterns = [
      { re: /\*([^*]+)\*/, tag: "strong" },
      { re: /_([^_]+)_/, tag: "em" },
      { re: /~([^~]+)~/, tag: "del" },
      { re: /`([^`]+)`/, tag: "code" },
    ];
    let safe = 0;
    while (remaining.length > 0 && safe++ < 500) {
      let earliest = null, idx = Infinity;
      for (const p of patterns) {
        const m = p.re.exec(remaining);
        if (m && m.index < idx) { earliest = { match: m, tag: p.tag }; idx = m.index; }
      }
      if (!earliest) { tokens.push(remaining); break; }
      if (idx > 0) tokens.push(remaining.slice(0, idx));
      const Tag = earliest.tag;
      tokens.push(React.createElement(Tag, { key: `${li}-${idx}` }, earliest.match[1]));
      remaining = remaining.slice(idx + earliest.match[0].length);
    }
    return (
      <React.Fragment key={li}>
        {tokens}
        {li < arr.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

const StatusTick = ({ status }) => {
  if (!status) return null;
  if (status === "read") return <IoCheckmarkDoneSharp size={15} style={{ color: "#53bdeb", marginLeft: 2 }} />;
  if (status === "delivered") return <IoCheckmarkDoneSharp size={15} style={{ color: "#8696a0", marginLeft: 2 }} />;
  if (status === "sent") return <IoCheckmark size={15} style={{ color: "#8696a0", marginLeft: 2 }} />;
  if (status === "failed") return <MdErrorOutline size={15} style={{ color: "#ef4444", marginLeft: 2 }} />;
  return null;
};

const MsgMeta = ({ timestamp, isAdmin, status, light = false }) => {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 2, gap: 1 }}>
      <span style={{ fontSize: "11px", color: light ? "rgba(255,255,255,0.8)" : "#8696a0", lineHeight: 1 }}>
        {formatTimestamp(timestamp)}
      </span>
      {isAdmin && <StatusTick status={status} />}
    </div>
  );
};

const Tail = ({ isAdmin, color }) => {
  return (
    <div style={{
      position: "absolute",
      [isAdmin ? "right" : "left"]: -7,
      bottom: 0,
      width: 8,
      height: 13,
      overflow: "hidden",
    }}>
      {isAdmin ? (
        <svg viewBox="0 0 8 13" width="8" height="13">
          <path d="M 8 0 L 8 13 L 0 13" fill={color} />
        </svg>
      ) : (
        <svg viewBox="0 0 8 13" width="8" height="13">
          <path d="M 0 0 L 0 13 L 8 13" fill={color} />
        </svg>
      )}
    </div>
  );
};

const DocCard = ({ url, filename, timestamp, isAdmin, status }) => {
  const isPdf = filename?.toLowerCase().endsWith(".pdf");
  return (
    <div>
      <a href={url} download={filename} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(0,0,0,0.06)", borderRadius: 8,
          padding: "10px 12px", minWidth: 180, maxWidth: 240,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: isPdf ? "#e53e3e" : "#4a5568",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {isPdf ? <FaFilePdf size={20} color="#fff" /> : <FaFileAlt size={20} color="#fff" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {filename || "Document"}
            </div>
            <div style={{ fontSize: 11, color: "#8696a0", marginTop: 2 }}>
              {isPdf ? "PDF" : "Document"}
            </div>
          </div>
          <IoMdDownload size={18} color="#8696a0" />
        </div>
      </a>
      <MsgMeta timestamp={timestamp} isAdmin={isAdmin} status={status} />
    </div>
  );
};

const TemplateBtns = ({ buttons, renderWithVars, userId, msgFrom, msgId }) => {
 // In TemplateBtns component (line ~100-120)
const handleButtonClick = async (btn) => {
  // Add validation
  if (!userId || !isValidObjectId(userId)) {
    console.error('Invalid userId for button click');
    return;
  }
  
  const buttonTitle = btn.text || btn.reply?.title;
  const buttonId = btn.reply?.id || btn.id;
  
  try {
    await axios.post(`http://localhost:7821/api/admin/replyParticularMessage/${userId}`, {
      to: msgFrom,
      message: buttonTitle,
      messageId: msgId
    }, {
      params: { dbType: getDbType() }
    });
  } catch (error) {
    console.error('Failed to send button response:', error);
  }
};
  
  return (
    <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: 4 }}>
      {buttons.map((btn, i) => (
        <React.Fragment key={i}>
          <button 
            onClick={() => handleButtonClick(btn)}
            style={{
              width: "100%", padding: "9px 4px", background: "none", border: "none",
              color: "#009de2", fontSize: "13px", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {btn.type === "QUICK_REPLY" && <LuReply size={14} />}
            {btn.type === "URL" && <FaArrowUpRightFromSquare size={13} />}
            {btn.type === "COPY_CODE" && <MdContentCopy size={13} />}
            {btn.type === "PHONE_NUMBER" && <IoCall size={13} />}
            {btn.type === "FLOW" && <BsPlayCircleFill size={14} />}
            {renderWithVars(btn.text || btn.reply?.title)}
          </button>
          {i < buttons.length - 1 && (
            <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.08)", margin: "0 8px" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const MessageItem = React.memo(({
  name, msg, isAdmin,
  setReplyMessage, setReplyId, setTimer,
  caseDetails, lastTime, userId,
  isLastMessage, scrollToBottom,
}) => {
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const [replyTemplateData, setReplyTemplateData] = useState(null);
  const [loadingReplyTemplate, setLoadingReplyTemplate] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [showListOptions, setShowListOptions] = useState(false);
  const [loggedId, setLoggedId] = useState(null);
    const messagesEndRef = useRef(null);
    
  const getMessageText = (messageBody, fullMsg = null) => {
    if (!messageBody) return '[Empty]';
    
    if (fullMsg?.interactiveMsg) {
      const interactive = fullMsg.interactiveMsg;
      if (interactive.type === 'flow' && interactive.body?.text) {
        return `[FLOW] ${interactive.body.text}`;
      }
      if (interactive.type === 'button' && interactive.body?.text) {
        return `[BUTTON] ${interactive.body.text}`;
      }
      if (interactive.type === 'list' && interactive.body?.text) {
        return `[LIST] ${interactive.body.text}`;
      }
    }
    
    if (Array.isArray(messageBody)) {
      const textParts = messageBody.filter(item => 
        typeof item === 'string' && 
        !item.endsWith('.jpg') && 
        !item.endsWith('.mp4') && 
        !item.endsWith('.pdf') && 
        !item.startsWith('image_')
      );
      if (textParts.length > 0) return textParts.join(' | ');
      return '[Media Message]';
    }
    
    if (typeof messageBody === 'string') {
      if (messageBody === '**$$Interactive Flow$$**') return '[Flow Message]';
      const buttonMatch = messageBody.match(/^\*{0,2}\$+\s*(?:Button|Selected|Flow):\s*(.*?)\$+\*{0,2}$/i);
      if (buttonMatch) return `[Button Reply] ${buttonMatch[1].trim()}`;
      if (messageBody.startsWith('*Interactive')) return `[Interactive] ${messageBody.substring(0, 50)}`;
      if (messageBody.endsWith('.jpg') || messageBody.endsWith('.mp4') || messageBody.endsWith('.pdf') || messageBody.startsWith('image_')) {
        return `[Media] ${messageBody}`;
      }
      return messageBody;
    }
    
    return '[Unknown Format]';
  };

  // if (loggedId !== msg.id && ENABLE_MESSAGE_LOGGING) {
  //   setLoggedId(msg.id);
  //   const messageText = getMessageText(msg.body, msg);
  //   const sender = isAdmin ? '👤 Admin' : '👥 User';
  //   const time = formatTimestamp(msg.timestamp);
    
  //   // console.groupCollapsed(`📨 ${sender} | ${time} | ${msg.status || 'pending'}`);
  //   // console.log('Message Text:', messageText);
  //   // console.log('Message ID:', msg.id);
  //   // console.log('Timestamp:', msg.timestamp);
  //   if (msg.interactiveMsg) {
  //     // console.log('Interactive Type:', msg.interactiveMsg.type);
  //     // if (msg.interactiveMsg.body?.text) console.log('Body Text:', msg.interactiveMsg.body.text);
  //     if (msg.interactiveMsg.buttons) console.log('Buttons:', msg.interactiveMsg.buttons.map(b => b.text || b.reply?.title));
  //   }
  //   console.groupEnd();
  // }

  useEffect(() => {
    if (msg.interactiveMsg && ENABLE_MESSAGE_LOGGING) {
      // console.log(`[INTERACTIVE] Type: ${msg.interactiveMsg.type}`, msg.interactiveMsg);
    }
  }, [msg.interactiveMsg]);

  const lastUserMessage = caseDetails.slice().reverse().find((m) => m.userType === "User");
  const lastUserTimestamp = lastUserMessage?.timestamp || 0;
  
  useEffect(() => {
    const elapsed = Date.now() - lastUserTimestamp * 1000;
    const limit = 24 * 60 * 60 * 1000;
    const newTimer = elapsed >= limit || !elapsed ? 0 : Math.floor((limit - elapsed) / 1000);
    setTimer(newTimer);
  }, [lastUserTimestamp, setTimer]);

// Add this after your other useEffect hooks
useEffect(() => {
  if (userId && !isValidObjectId(userId)) {
    console.error('Invalid ObjectId format in MessageItem:', userId);
    // Optionally show a toast or handle error
  }
}, [userId]);
  const replyReferenceId =
    msg.replyId || msg.interactiveMsg?.id;

  const repliedMessage = msg.interactiveMsg?.id
    ? caseDetails.find((m) => m.statusId === msg.interactiveMsg.id)
    : replyReferenceId
      ? caseDetails.find((m) => m.id === replyReferenceId)
      : null;
  

  
if (msg.body?.includes("Request Demo")) {
  console.log("replyReferenceId:", replyReferenceId);

  const allMatches = caseDetails.filter(
    (m) =>
      m.id === replyReferenceId ||
      m.interactiveMsg?.id === replyReferenceId ||
      m.statusId === replyReferenceId
  );

  console.log("ALL MATCHES:", allMatches);
}
useEffect(() => {
  console.log(
  "ALL IDS:",
  caseDetails.map((m) => ({
    id: m.id,
    statusId: m.statusId,
    interactiveId: m.interactiveMsg?.id,
    body: m.body,
  }))
);
  const target =
    "wamid.HBgMOTE3MDM5NzA5NTgwFQIAERgSQjlBQzY3NUQ4QzI4RjRDNEVGAA==";

  const matches = caseDetails.filter(
    (m) =>
      m.id === target ||
      m.interactiveMsg?.id === target
  );

  console.log("MATCHES:", matches);

  const possibleMessages = caseDetails.filter(
    (m) =>
      m.body?.includes?.("Choose one") ||
      m.interactiveMsg?.type
  );

  console.log("POSSIBLE INTERACTIVE MSGS:", possibleMessages);
}, []);
  const interactiveRepliedMsg = msg?.interactiveMsg?.id ? caseDetails.find((m) => m.statusId === msg?.interactiveMsg?.id) : null;
  
  const body = msg.body;
  
  const isInteractiveButton = typeof body === "string" && body.startsWith("*Interactive Button*");
  const isInteractiveList = typeof body === "string" && body.startsWith("*Interactive List*");
  const isInteractiveFlow = typeof body === "string" && body.startsWith("*Interactive Flow*");
  const isInteractiveButtonReply = typeof body === "string" && body.startsWith("*Interactive Button Reply*");
  const isInteractiveListReply = typeof body === "string" && body.startsWith("*Interactive List Reply*");
  const isInteractiveFlowReply = /\*+\$*Interactive Flow Reply\$*\*+/i.test(body);

  const getCleanButtonText = (t) => {
    if (!t || typeof t !== "string") return null;
    let m = t.match(/^\*{0,2}\$+\s*Button:\s*(.*?)\$+\*{0,2}$/i);
    if (m) return m[1].trim();
    m = t.match(/^\*{0,2}\$+\s*Selected:\s*(.*?)\$+\*{0,2}$/i);
    if (m) return m[1].trim();
    m = t.match(/^\*{0,2}\$+\s*Flow:\s*(.*?)\$+\*{0,2}$/i);
    if (m) return m[1].trim();
    return null;
  };
const scrollToMessage = (messageId) => {
  const element = document.getElementById(`message-${messageId}`);

  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    element.classList.add("message-highlight");

    setTimeout(() => {
      element.classList.remove("message-highlight");
    }, 2000);
  }
};
  const cleanButtonText = getCleanButtonText(body);
  const isButtonReplyMessage = cleanButtonText !== null;

const handlePreviewImage = useCallback(async (imageKey) => {
  const isMedia = (k) => k.endsWith(".jpg") || k.endsWith(".pdf") || k.endsWith(".mp4") || k.endsWith("_temp") || k.startsWith("image_");
  if (!isMedia(imageKey)) return null;

  if (imageKey.endsWith("_temp")) {
    // Add validation before API call
    if (!userId || !isValidObjectId(userId)) {
      console.error('Invalid userId for template fetch');
      return null;
    }
    
    setLoadingTemplate(true);
    try {
      const res = await axios.get(`http://localhost:7821/api/admin/getTemplateData/${userId}/${imageKey}`, {
        params: { dbType: getDbType() },
      });
      setTemplateData(res.data.data);
    } catch (e) {
      console.error('Template load error:', e);
    } finally {
      setLoadingTemplate(false);
    }
    return null;
  }

    if (imageKey.endsWith(".jpg") || imageKey.startsWith("image_")) {
      try {
        const res = await axios.get(`https://somprazquiz.digilateral.com/downloadObjectgc/${imageKey}`);
        const url = res?.data?.downloadUrl?.url;
        if (url) return { type: "image", url };
      } catch (e) { return null; }
    }
    if (imageKey.endsWith(".mp4")) {
      try {
        const res = await axios.get(`https://somprazquiz.digilateral.com/downloadObjectgc/${imageKey}`);
        const url = res?.data?.downloadUrl?.url;
        if (url) return { type: "video", url };
      } catch (e) { return null; }
    }
    if (imageKey.endsWith(".pdf")) {
      try {
        const res = await axios.get(`https://somprazquiz.digilateral.com/downloadObjectgc/${imageKey}`);
        const url = res?.data?.downloadUrl?.url;
        if (url) return { type: "document", url, filename: imageKey.split("/").pop() };
      } catch (e) { return null; }
    }
    return null;
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const previews = [];
        if (msg.document?.link) {
          previews.push({ type: "document", url: msg.document.link, filename: msg.document.filename || msg.document.link.split("/").pop() });
        } else {
          const mediaCheck = (k) => k.endsWith(".jpg") || k.endsWith(".pdf") || k.endsWith(".mp4") || k.endsWith("_temp") || k.startsWith("image_");
          if (Array.isArray(body)) {
            const results = await Promise.all(body.filter(mediaCheck).map(handlePreviewImage));
            previews.push(...results.filter(Boolean));
          } else if (typeof body === "string" && mediaCheck(body)) {
            const m = await handlePreviewImage(body);
            if (m) previews.push(m);
          }
        }
        if (mounted) {
          setPreviewImages(previews);
          setContentLoaded(true);
        }
      } catch (e) {
        if (mounted) setContentLoaded(true);
      }
    };
    load();
    return () => { mounted = false; };
  }, [msg.body, msg.document, handlePreviewImage]);

  useEffect(() => {
    if (isLastMessage && contentLoaded && scrollToBottom) {
      const t = setTimeout(scrollToBottom, templateData ? 500 : 100);
      return () => clearTimeout(t);
    }
  }, [isLastMessage, contentLoaded, templateData, scrollToBottom]);
  const fetchReplyTemplate = useCallback(async () => {
    
    if (!userId || !isValidObjectId(userId)) return;
    if (!repliedMessage?.body || typeof repliedMessage.body !== 'string') return;

    const templateName = repliedMessage.body;

    if (!templateName) return;

    setLoadingReplyTemplate(true);
    setReplyTemplateData(null);
    try {
     const res = await axios.get(
  `http://localhost:7821/api/admin/getTemplateData/${userId}/${templateName}`,
  {
    params: { dbType: getDbType() },
  }
);

console.log("REPLY TEMPLATE RESPONSE", res.data);

setReplyTemplateData(res.data.data);
    } catch (e) {
      console.error('Reply template load error:', e);
    } finally {
      setLoadingReplyTemplate(false);
    }
  }, [repliedMessage, userId]);

  useEffect(() => {
    if (repliedMessage?.body && typeof repliedMessage.body === 'string' && repliedMessage.body.endsWith('_temp')) {
      console.log(
  "FETCHING REPLY TEMPLATE",
  repliedMessage
);
      fetchReplyTemplate();
    }
  }, [repliedMessage, fetchReplyTemplate]);

  const renderInteractiveReplyPreview = () => {
    if (!repliedMessage) return null;

   const bodyComponent = replyTemplateData?.components?.find(
  (c) => c.type === "BODY"
);

const previewText = (
  bodyComponent?.text ||
  repliedMessage?.body ||
  ""
)
  .replace(/\*/g, "") // remove bold markers
  .replace(/_/g, " ") // remove italic markers
  .replace(/\{\{\d+\}\}/g, "") // remove template variables
  .replace(/\s+/g, " ")
  .trim();

    const headerComponent = replyTemplateData?.components?.find((c) => c.type === 'HEADER');
    const hasImage = headerComponent?.format === 'IMAGE';

    return (
      <div
      onClick={() => scrollToMessage(repliedMessage.id)}
        style={{
          background: 'rgba(0,0,0,0.08)',
          borderLeft: `4px solid ${'#a855f7'}`,
          borderRadius: 6,
          padding: '6px 10px',
          marginBottom: 4,
          maxWidth: 260,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', marginBottom: 2 }}>
          digiLATERAL
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#555',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {hasImage && '📷 '}
          {previewText}
        </div>
      </div>
    );
  };

  const handleReplyMessage = useCallback(() => {
  if (userId && !isValidObjectId(userId)) {
    console.error('Invalid userId for reply');
    return;
  }
  setReplyMessage(typeof body === "string" ? body : "Media");
  setReplyId(msg.id);
}, [body, msg.id, userId, setReplyMessage, setReplyId]);

  const adminBg = "#d9fdd3";
  const userBg = "#ffffff";
  const bubbleBg = isAdmin ? adminBg : userBg;

  const renderTemplateMessage = () => {
    if (!templateData?.components) return null;
    
    const comps = {
      header: templateData.components.find((c) => c.type === "HEADER"),
      body: templateData.components.find((c) => c.type === "BODY"),
      footer: templateData.components.find((c) => c.type === "FOOTER"),
      buttons: templateData.components.find((c) => c.type === "BUTTONS"),
    };
    
    const renderWithVars = (t) => t?.replace(/\{\{(\d+)\}\}/g, (_, i) =>
      comps.body?.example?.body_text?.[0]?.[parseInt(i) - 1] || `{{${i}}}`
    );
    const mediaUrl = comps.header?.example?.header_handle?.[0];

    return (
      <div style={{ width: 260 }}>
        {comps.header?.format === "IMAGE" && mediaUrl && (
          <img src={mediaUrl} alt="header" style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block", borderRadius: "8px 8px 0 0" }} />
        )}
        {comps.header?.format === "VIDEO" && mediaUrl && (
          <video controls src={mediaUrl} style={{ width: "100%", maxHeight: 180, borderRadius: "8px 8px 0 0" }} />
        )}
        {comps.header?.format === "DOCUMENT" && mediaUrl && (
          <DocCard url={mediaUrl} filename="Document" timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />
        )}
        {comps.header?.format === "TEXT" && comps.header.text && (
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 4 }}>
            {comps.header.text}
          </div>
        )}
        {comps.body?.text && (
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "#111", marginBottom: 2 }}>
            <span className={isExpanded ? "" : "line-clamp-5"}>
              {parseWA(renderWithVars(comps.body.text))}
            </span>
            {comps.body.text.split(/\s+/).length > 30 && (
              <button onClick={() => setIsExpanded(!isExpanded)} style={{ color: "#009de2", fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0, display: "block", marginTop: 2 }}>
                {isExpanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        )}
        {comps.footer?.text && (
          <div style={{ fontSize: 11, color: "#8696a0", marginBottom: 2 }}>
            {parseWA(renderWithVars(comps.footer.text))}
          </div>
        )}
        <MsgMeta timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />
        {comps.buttons?.buttons?.length > 0 && (
          <TemplateBtns 
            buttons={comps.buttons.buttons} 
            renderWithVars={renderWithVars}
            userId={userId}
            msgFrom={msg.from || msg.From}
            msgId={msg.id}
          />
        )}
      </div>
    );
  };

  const renderInteractiveMessage = () => {
    if (!msg.interactiveMsg) return null;
    
    const { type, body: iBody, action, header, footer, buttons } = msg.interactiveMsg;
    
    // FLOW MESSAGE HANDLER
    if (type === "flow") {
      // Extract buttons from all possible locations
      let flowButtons = [];
      if (buttons && buttons.length > 0) flowButtons = buttons;
      else if (action?.buttons && action.buttons.length > 0) flowButtons = action.buttons;
      else if (msg.interactiveMsg?.buttons && msg.interactiveMsg.buttons.length > 0) flowButtons = msg.interactiveMsg.buttons;
      else if (msg.interactiveMsg?.action?.buttons && msg.interactiveMsg.action.buttons.length > 0) flowButtons = msg.interactiveMsg.action.buttons;
      
      const getButtonText = (btn) => btn.text || btn.title || btn.reply?.title || btn.buttonText || "Continue";
      
      return (
        <div style={{ width: 260 }}>
          {iBody?.text && (
            <div style={{ fontSize: 13, lineHeight: 1.6, color: "#111", marginBottom: 12 }}>
              {parseWA(iBody.text)}
            </div>
          )}
          
          {flowButtons.length > 0 && (
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.12)", marginTop: 8, marginLeft: -8, marginRight: -8 }}>
              {flowButtons.map((b, i) => {
                const buttonTitle = getButtonText(b);
                return (
                  <button 
                    key={i}
                    onClick={async () => {
  if (!userId || !isValidObjectId(userId)) {
    console.error('Invalid userId');
    return;
  }
  try {
    await axios.post(`http://localhost:7821/api/admin/replyParticularMessage/${userId}`, {
      to: msg.from || msg.From,
      message: buttonTitle,
      messageId: msg.id
    }, {
      params: { dbType: getDbType() }
    });
  } catch (error) {
    console.error('Failed to send button response:', error);
  }
}}
                    style={{ 
                      width: "100%", padding: "10px 8px", border: "none", borderRadius: "6px",
                      color: "#009de2", fontSize: 14, fontWeight: 400, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                    }}
                  >
                    <BsPlayCircleFill size={16} />
                    {buttonTitle || "Start Flow"}
                  </button>
                );
              })}
              <MsgMeta timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />
            </div>
          )}
        </div>
      );
    }

    // BUTTON MESSAGE HANDLER
    if (type === "button") {
      const buttonList = buttons || action?.buttons || [];
      
      return (
        <div style={{ width: 260 }}>
          {iBody?.text && (
            <div style={{ fontSize: 13, lineHeight: 1.6, color: "#111", marginBottom: 8 }}>
              {parseWA(iBody.text)}
            </div>
          )}
          
          <MsgMeta timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />
          
          {buttonList.length > 0 && (
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: 6 }}>
              {buttonList.map((btn, i) => {
                const buttonTitle = btn.title || btn.reply?.title;
                if (!buttonTitle) return null;
                
                return (
                  <React.Fragment key={i}>
                    <button 
                      onClick={async () => {
  if (!userId || !isValidObjectId(userId)) {
    console.error('Invalid userId');
    return;
  }
  try {
    await axios.post(`http://localhost:7821/api/admin/replyParticularMessage/${userId}`, {
      to: msg.from || msg.From,
      message: buttonTitle,
      messageId: msg.id
    }, {
      params: { dbType: getDbType() }
    });
  } catch (error) {
    console.error('Failed to send button response:', error);
  }
}}

                      style={{ 
                        width: "100%", padding: "9px 8px", background: "none", border: "none",
                        color: "#009de2", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                      }}
                    >
                      <LuReply size={14} />
                      {buttonTitle}
                    </button>
                    {i < buttonList.length - 1 && (
                      <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.08)", margin: "0 8px" }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // LIST MESSAGE HANDLER
    if (type === "list") {
      return (
        <>
          <div style={{ width: 260 }}>
            {header?.text && <div style={{ fontWeight: 700, fontSize: 13, color: "#111", marginBottom: 4 }}>{parseWA(header.text)}</div>}
            {iBody?.text && <div style={{ fontSize: 13, lineHeight: 1.6, color: "#111", marginBottom: 4 }}>{parseWA(iBody.text)}</div>}
            {footer?.text && <div style={{ fontSize: 11, color: "#8696a0", marginBottom: 4 }}>{footer.text}</div>}
            <MsgMeta timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />
            {action?.button && (
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: 4 }}>
                <button onClick={() => setShowListOptions(true)} style={{ width: "100%", padding: "9px 8px", background: "none", border: "none", color: "#009de2", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  {action.button}
                </button>
              </div>
            )}
          </div>
          {showListOptions && (
            <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 999, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#075e54", color: "#fff" }}>
                <button onClick={() => setShowListOptions(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex" }}>
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Select an option</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", background: "#f0f2f5", padding: 12 }}>
                {action?.sections?.map((section, si) => (
                  <div key={si} style={{ background: "#fff", borderRadius: 10, marginBottom: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    {section.title && <div style={{ padding: "10px 16px", background: "#f0f2f5", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>{section.title}</div>}
                    {section.rows?.map((row, ri) => (
                      <button key={ri} onClick={() => setShowListOptions(false)} style={{ width: "100%", textAlign: "left", padding: "12px 16px", background: "none", border: "none", borderTop: ri > 0 ? "1px solid #f0f2f5" : "none", cursor: "pointer" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>{row.title}</div>
                        {row.description && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{row.description}</div>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }
    return null;
  };

  const renderInteractiveReply = () => {
    if (!msg.interactiveMsg?.reply) return null;

    const reply = msg.interactiveMsg.reply;
    let title = "Response";

    if (reply.button_reply?.title) {
      title = reply.button_reply.title;
    } else if (reply.list_reply?.title) {
      title = reply.list_reply.title;
    } else if (reply.nfm_reply) {
      const originalFlow = [...caseDetails].reverse().find(
        (m) => m.userType === "Admin" && m.interactiveMsg?.type === "flow" && Number(m.timestamp) < Number(msg.timestamp)
      );
      title = originalFlow?.interactiveMsg?.buttons?.[0]?.text ||
              originalFlow?.interactiveMsg?.action?.buttons?.[0]?.reply?.title ||
              originalFlow?.interactiveMsg?.buttons?.[0]?.title ||
              "Flow Response";
    }

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e7f5ec", display: "flex", alignItems: "center", justifyContent: "center", color: "#25D366", fontWeight: 700 }}>
            📄
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
            <div style={{ fontSize: 12, color: "#8696a0" }}>Response sent</div>
          </div>
        </div>
        <MsgMeta timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />
      </>
    );
  };

  const renderContent = () => {
    if (
  typeof body === "string" &&
  body.includes("Request Demo")
) {
  console.log("REQUEST DEMO MSG FULL:", JSON.stringify(msg, null, 2));
}
    if (loadingTemplate) {
      return (
        <div style={{ width: 240, height: 100, background: "#f0f2f5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#8696a0" }}>
          Loading…
        </div>
      );
    }
    
    if (msg.button?.payload || msg.interactiveMsg?.reply?.button_reply) {
      const buttonReply = msg.button?.text || msg.interactiveMsg?.reply?.button_reply?.title;
      return (
        <>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "#111" }}>
            {parseWA(buttonReply || "Button clicked")}
          </div>
          <MsgMeta timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />
        </>
      );
    }
    
    if (msg.interactiveMsg?.type === 'flow') {
      return renderInteractiveMessage();
    }
    
    if (msg.interactiveMsg?.type === 'button') {
      return renderInteractiveMessage();
    }
    
    if (templateData) {
      return renderTemplateMessage();
    }
    
    if ((isInteractiveButtonReply || isInteractiveListReply || isInteractiveFlowReply) && !isButtonReplyMessage) {
      return renderInteractiveReply();
    }
    
    if ((isInteractiveButton || isInteractiveList || isInteractiveFlow) && !isButtonReplyMessage) {
      return renderInteractiveMessage();
    }
    
    if (cleanButtonText) {
      return (
        <>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "#111" }}>{parseWA(cleanButtonText)}</div>
          <MsgMeta timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />
        </>
      );
    }

    if (Array.isArray(body)) {
      const texts = body.filter((i) => !i.endsWith(".jpg") && !i.endsWith(".mp4") && !i.endsWith(".pdf") && !i.startsWith("image_"));
      return (
        <>
          {texts.map((item, i) => (
            <p key={i} style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: "#111", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {parseWA(item)}
            </p>
          ))}
          {previewImages.length === 0 && <MsgMeta timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />}
        </>
      );
    }

    if (typeof body === "string" && !body.endsWith(".jpg") && !body.endsWith(".mp4") && !body.endsWith(".pdf") && !body.startsWith("image_")) {
      if (body === "translate11_languages Template") {
        return (
          <>
            <img onClick={() => setSelectedImage("Translation")} src={TranslationImg}
              style={{ width: 220, height: 220, objectFit: "cover", borderRadius: 6, cursor: "pointer", display: "block" }} alt="Preview" />
            <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
              <em>1 Design, 11 Indian Languages</em><br />
              <strong>Translation Bills?</strong><br /><em>On Us</em><br /><br />
              <em>Team</em> <strong>digiLATERAL</strong><br />
              <span style={{ fontSize: 12 }}>Think Lateral - Think Digital</span>
            </div>
            <MsgMeta timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />
          </>
        );
      }
      return (
        <>
          <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: "#111", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {parseWA(body)}
          </p>
          <MsgMeta timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />
        </>
      );
    }

    return null;
  };

  const renderMediaPreviews = () => {
    if (templateData) return null;
    return previewImages.map((media, i) => (
      <div key={i} style={{ marginTop: 2 }}>
        {media?.type === "image" ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img onClick={() => setSelectedImage(media.url)} src={media.url}
              style={{ width: 240, height: 190, objectFit: "cover", borderRadius: 8, cursor: "pointer", display: "block" }} alt="Media" />
            <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.45)", borderRadius: 10, padding: "2px 6px", display: "flex", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 11, color: "#fff" }}>{formatTimestamp(msg.timestamp)}</span>
              {isAdmin && <StatusTick status={msg.status} />}
            </div>
          </div>
        ) : media?.type === "video" ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <video controls style={{ width: 240, height: 180, borderRadius: 8, display: "block", background: "#000" }}>
              <source src={media.url} type="video/mp4" />
            </video>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)", borderRadius: 8 }}>
              <BsPlayCircleFill size={42} color="rgba(255,255,255,0.9)" />
            </div>
            <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.45)", borderRadius: 10, padding: "2px 6px", display: "flex", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 11, color: "#fff" }}>{formatTimestamp(msg.timestamp)}</span>
              {isAdmin && <StatusTick status={msg.status} />}
            </div>
          </div>
        ) : media?.type === "document" ? (
          <DocCard url={media.url} filename={media.filename} timestamp={msg.timestamp} isAdmin={isAdmin} status={msg.status} />
        ) : null}
      </div>
    ));
  };

  const hasOnlyMedia = previewImages.length > 0 && (typeof body === "string" && (body.endsWith(".jpg") || body.endsWith(".mp4") || body.endsWith(".pdf") || body.startsWith("image_")));

  const renderReplyPreview = () => {
    if (!msg.replyId || !repliedMessage) return null;
    const accent = isAdmin ? "#009de2" : "#25d366";
    const replyText = Array.isArray(repliedMessage.body)
      ? repliedMessage.body.find((i) => !i.startsWith("image_")) || "Media"
      : !repliedMessage.body?.startsWith("image_") ? repliedMessage.body : "📷 Photo";
console.log("CURRENT MESSAGE:", msg.id);
console.log("replyId:", msg.replyId);
console.log("repliedMessage:", repliedMessage);
    return (
      <div style={{
        background: isAdmin ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.05)",
        borderLeft: `4px solid ${accent}`,
        borderRadius: "6px 6px 0 0",
        padding: "6px 10px",
        marginBottom: 4,
        maxWidth: 260,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: accent, marginBottom: 2 }}>
          {repliedMessage.userType === "Admin" ? "You" : name}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 230 }}>
          {replyText}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      flexDirection: isAdmin ? "row-reverse" : "row",
      marginBottom: 2,
      padding: "1px 8px",
      gap: 4,
    }}>
      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isAdmin ? "flex-end" : "flex-start" }}>
        
        
        <div
          id={`message-${msg.id}`}
 
        style={{
          
          background: bubbleBg,
          borderRadius: isAdmin
            ? (msg.replyId || interactiveRepliedMsg ? "12px 2px 12px 12px" : "12px 2px 12px 12px")
            : (msg.replyId || interactiveRepliedMsg ? "2px 12px 12px 12px" : "2px 12px 12px 12px"),
          padding: hasOnlyMedia ? "3px 3px 0" : "6px 8px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.13)",
          position: "relative",
          minWidth: hasOnlyMedia ? "unset" : 70,
          maxWidth: 280,
        }}>
          <Tail isAdmin={isAdmin} color={bubbleBg} />
          {msg.replyId && repliedMessage && renderReplyPreview()}

{!msg.replyId &&
 msg.interactiveMsg?.id &&
 repliedMessage &&
 renderInteractiveReplyPreview()}
          {renderContent()}
          {renderMediaPreviews()}
        </div>
      </div>
      <div
        onClick={handleReplyMessage}
        style={{
          cursor: "pointer", color: "#8696a0", alignSelf: "flex-end",
          paddingBottom: 4, opacity: 0.7, transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
      >
        <LuReply size={16} />
      </div>
      {selectedImage && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", flexDirection: "column" }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
            <a href={selectedImage === "Translation" ? TranslationImg : selectedImage} download style={{ color: "#fff", display: "flex" }}>
              <IoMdDownload size={26} />
            </a>
            <RxCross1 size={24} onClick={() => setSelectedImage(null)} style={{ color: "#fff", cursor: "pointer" }} />
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage === "Translation" ? TranslationImg : selectedImage}
              style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 4 }} alt="Full" />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
});

export default MessageItem;

MessageItem.propTypes = {
  name: PropTypes.string,
  msg: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  setReplyMessage: PropTypes.func.isRequired,
  setReplyId: PropTypes.func.isRequired,
  setTimer: PropTypes.func.isRequired,
  caseDetails: PropTypes.array.isRequired,
  lastTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userId: PropTypes.string.isRequired,
  isLastMessage: PropTypes.bool,
  scrollToBottom: PropTypes.func,
};