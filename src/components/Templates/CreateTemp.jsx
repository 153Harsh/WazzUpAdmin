import React, { useEffect, useState, useMemo } from "react";
import Header from "../Header/Header";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { RxCrossCircled } from "react-icons/rx";
import { IoMdCall } from "react-icons/io";
import { v4 as uuidv4 } from "uuid";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { MdContentCopy } from "react-icons/md";
import { LuReply } from "react-icons/lu";
import { FiPlus, FiTrash2, FiAlertCircle, FiInfo } from "react-icons/fi";
import { HiOutlineVariable } from "react-icons/hi";
import TemplateBg from "../../assets/templateBg.png";

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const getTemplateHealthCheck = (bodyText) => {
  const variables = bodyText.match(/\{\{\d+\}\}/g) || [];
  const varCount = variables.length;
  const textLength = bodyText.replace(/\{\{\d+\}\}/g, "").length;
  const ratio = varCount > 0 ? textLength / varCount : Infinity;

  const validations = {
    missingBraces: variables.some((v) => !/^\{\{\d+\}\}$/.test(v)),
    specialChars: variables.some((v) => /[#$%]/.test(v)),
    nonSequential: (() => {
      const nums = variables.map((v) => parseInt(v.match(/\d+/)[0]));
      return nums.some((num, i) => num !== i + 1);
    })(),
    badRatio: varCount > 0 && (ratio < 5 || textLength === 0),
    endsWithParam: /(\{\{\d+\}\})\s*$/.test(bodyText),
    emptyWithVars: varCount > 0 && textLength === 0,
    maxLengthExceeded: bodyText.length > 1024,
  };

  const hasErrors = Object.values(validations).some(Boolean);
  return { validations, hasErrors };
};

const CreateTemp = () => {
  const pageName = "Create Template";
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [templateData, setTemplateData] = useState({
    name: "",
    category: "MARKETING",
    language: "en_US",
    components: {
      header: { type: "HEADER", text: "", format: "" },
      body: {
        text: "",
        type: "BODY",
        example: {
          body_text: [[]],
        },
      },
      footer: { type: "FOOTER", text: "" },
      buttons: [],
    },
  });
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (userId && !isValidObjectId(userId)) {
      console.error('Invalid ObjectId format in CreateTemp:', userId);
      toast.error('Invalid session. Please login again.');
    }
  }, [userId]);

  const variables = useMemo(() => {
    const vars = templateData.components.body.text.match(/\{\{\d+\}\}/g) || [];
    return vars.map((varName, index) => ({
      name: varName,
      value: templateData.components.body.example.body_text[0]?.[index] || "",
    }));
  }, [templateData.components.body.text, templateData.components.body.example.body_text]);

  const healthCheck = useMemo(() => 
    getTemplateHealthCheck(templateData.components.body.text),
    [templateData.components.body.text]
  );

  const TemplateHealthCheck = () => {
    if (!healthCheck.hasErrors) return null;

    return (
      <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-2">
          <FiAlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={16} />
          <div className="space-y-1 text-sm">
            {healthCheck.validations.missingBraces && (
              <div className="text-amber-700">• Invalid variable format</div>
            )}
            {healthCheck.validations.specialChars && (
              <div className="text-amber-700">• Variables cannot contain special characters (#, $, %)</div>
            )}
            {healthCheck.validations.nonSequential && (
              <div className="text-amber-700">• Variables must be sequential ({"{{1}}"}, {"{{2}}"}, {"{{3}}"}...)</div>
            )}
            {healthCheck.validations.badRatio && (
              <div className="text-amber-700">• Text-to-variable ratio too low. Need ≥5 chars per variable</div>
            )}
            {healthCheck.validations.endsWithParam && (
              <div className="text-amber-700">• Template cannot end with a variable</div>
            )}
            {healthCheck.validations.emptyWithVars && (
              <div className="text-amber-700">• Please add message text before variables</div>
            )}
            {healthCheck.validations.maxLengthExceeded && (
              <div className="text-amber-700">• Template body exceeds 1024 character limit</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const addVariable = () => {
    const currentText = templateData.components.body.text;
    const currentVars = currentText.match(/\{\{\d+\}\}/g) || [];
    const varCount = currentVars.length + 1;
    const newVar = `{{${varCount}}}`;

    const newText = `${currentText}${newVar}`;
    
    const newExample = [
      ...templateData.components.body.example.body_text[0],
      "",
    ];
    
    setTemplateData(prev => ({
      ...prev,
      components: {
        ...prev.components,
        body: {
          ...prev.components.body,
          text: newText,
          example: { body_text: [newExample] },
        },
      },
    }));
  };

  const removeVariable = (index) => {
    setTemplateData((prev) => {
      const currentText = prev.components.body.text;
      const variables = currentText.match(/\{\{\d+\}\}/g) || [];
      const varToRemove = variables[index];

      if (!varToRemove) return prev;

      const newText = currentText.replace(varToRemove, "");

      let varCounter = 1;
      const renumberedText = newText.replace(
        /\{\{\d+\}\}/g,
        () => `{{${varCounter++}}}`
      );

      const currentExamples = [...prev.components.body.example.body_text[0]];
      currentExamples.splice(index, 1);

      return {
        ...prev,
        components: {
          ...prev.components,
          body: {
            ...prev.components.body,
            text: renumberedText,
            example: {
              body_text: [currentExamples.length ? currentExamples : [""]],
            },
          },
        },
      };
    });
  };

  const handleVariableChange = (index, value) => {
    const newExample = [...templateData.components.body.example.body_text[0]];
    newExample[index] = value;
    
    setTemplateData(prev => ({
      ...prev,
      components: {
        ...prev.components,
        body: {
          ...prev.components.body,
          example: { body_text: [newExample] },
        },
      },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTemplateData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleComponentChange = (component, field, value) => {
    setTemplateData((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: {
          ...prev.components[component],
          [field]: value,
        },
      },
    }));
  };

  const addButton = () => {
    setTemplateData((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        buttons: [
          ...prev.components.buttons,
          {
            type: "QUICK_REPLY",
            text: "",
            url: "",
            phone_number: "",
            example: [""],
          },
        ],
      },
    }));
  };

  const removeButton = (index) => {
    setTemplateData((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        buttons: prev.components.buttons.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId || !isValidObjectId(userId)) {
      toast.error("Invalid session. Please login again.");
      return;
    }
    
    setLoading(true);
    
    try {
      let mediaKey = null;
      
      if (selectedFile) {
        const formData = new FormData();
        const fileExtension = selectedFile.name.split(".").pop();
        const uniqueFileName = `${templateData.name}_${uuidv4()}.${fileExtension}`;
        
        formData.append('file', selectedFile, uniqueFileName);
        
        const uploadResponse = await axios.post(
          `http://localhost:7821/api/admin/upload-media`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        mediaKey = uploadResponse.data.filename || uniqueFileName;
      }
      
      const payload = {
        templateData: {
          ...templateData,
          name: templateData.name.toLowerCase().trim(),
        },
        dbType: "demo",
      };
      
      if (mediaKey) {
        payload.key = mediaKey;
      }
      
      const response = await axios.post(
        `http://localhost:7821/api/admin/create-template/${userId}`,
        payload
      );
      
      toast.success("Template created successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage = error.response?.data?.error?.error_user_msg 
        || error.response?.data?.error?.error?.error_user_msg
        || error.response?.data?.message
        || "Failed to create template";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const TemplatePreview = () => {
    const bodyComponent = templateData.components.body;
    const footerComponent = templateData.components.footer;
    const buttonComponent = { buttons: templateData.components.buttons };

    const renderHeader = () => {
      const header = templateData?.components?.header;
      if (!header || !header.format) return null;

      const format = header.format.toUpperCase();
      const mediaUrl = selectedFile
        ? URL.createObjectURL(selectedFile)
        : header.example?.header_handle?.[0];

      if (format === "TEXT") {
        return (
          <div className="font-semibold text-sm px-2 py-1 text-gray-800 bg-gray-50 rounded-lg">
            {renderWithVariables(header.text)}
          </div>
        );
      }

      if (format === "IMAGE" && mediaUrl) {
        return (
          <img
            src={mediaUrl}
            alt="Header"
            className="rounded-lg max-h-32 w-full object-cover border border-gray-200"
          />
        );
      }

      if (format === "VIDEO" && mediaUrl) {
        return (
          <video
            controls
            src={mediaUrl}
            className="rounded-lg max-h-32 w-full object-cover border border-gray-200"
          />
        );
      }

      if (format === "DOCUMENT" && mediaUrl) {
        return (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-blue-600 hover:text-blue-700 hover:bg-gray-200 transition-colors"
          >
            <FiInfo size={16} />
            View Document
          </a>
        );
      }

      return null;
    };

    const parseWhatsAppFormatting = (text) => {
      if (!text || typeof text !== 'string') return text;

      const FORMAT_MAP = {
        '*': { tag: 'strong', style: { fontWeight: 'bold' } },
        '_': { tag: 'em', style: { fontStyle: 'italic' } },
        '~': { tag: 'del', style: { textDecoration: 'line-through' } },
        '`': { tag: 'code', style: { fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '0 4px', borderRadius: '4px' } }
      };

      const result = [];
      let buffer = '';
      let currentFormats = [];
      let i = 0;

      while (i < text.length) {
        const char = text[i];
        
        if (FORMAT_MAP[char] && (i === 0 || text[i - 1] !== '\\')) {
          const lastFormat = currentFormats[currentFormats.length - 1];
          if (lastFormat?.char === char) {
            currentFormats.pop();
            i++;
            
            if (currentFormats.length === 0 && buffer) {
              const format = FORMAT_MAP[char];
              result.push(
                React.createElement(
                  format.tag, 
                  { 
                    key: `fmt-${i}-${result.length}`, 
                    style: format.style 
                  }, 
                  buffer
                )
              );
              buffer = '';
            }
            continue;
          } else {
            currentFormats.push({ char, pos: i });
            i++;
            continue;
          }
        }
        
        buffer += char;
        i++;
      }

      if (buffer) {
        result.push(buffer);
      }

      if (currentFormats.length > 0) {
        return text;
      }

      return result.length > 1 ? result : result[0] || '';
    };
    
    const renderWithVariables = (text) =>
      text?.replace(/\{\{(\d+)\}\}/g, (_, i) => {
        const index = parseInt(i, 10) - 1;
        return bodyComponent.example?.body_text?.[0]?.[index] || `{{${i}}}`;
      });

    return (
      <div className="flex justify-center items-center w-full">
        <div
          className="relative w-[320px] h-[600px] bg-no-repeat bg-center bg-contain"
          style={{
            backgroundImage: `url(${TemplateBg})`,
          }}
        >
          <div className="absolute inset-[40px_20px_20px_20px] overflow-y-auto rounded-xl px-2 py-3 bg-white/95 backdrop-blur-sm">
            {renderHeader()}

            {bodyComponent?.text && (
              <div className="mt-2 px-2 py-2 text-sm text-gray-800 w-fit max-w-full">
                {parseWhatsAppFormatting(
                  renderWithVariables(bodyComponent.text)
                )}
              </div>
            )}

            {footerComponent?.text && (
              <div className="mt-2 text-xs text-gray-500 px-2">
                {parseWhatsAppFormatting(
                  renderWithVariables(footerComponent.text)
                )}
              </div>
            )}

            {buttonComponent?.buttons?.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {buttonComponent.buttons.map((btn, idx) => (
                  <button 
                    key={idx}
                    className="px-3 py-2 text-sm text-blue-600 text-center font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors bg-white"
                    type="button"
                  >
                    <div className="flex justify-center items-center gap-2">
                      {btn.type === "QUICK_REPLY" && <LuReply size={14} />}
                      {btn.type === "URL" && <FaArrowUpRightFromSquare size={14} />}
                      {btn.type === "COPY_CODE" && <MdContentCopy size={14} />}
                      {btn.type === "PHONE_NUMBER" && <IoMdCall size={14} />}
                      {renderWithVariables(btn.text)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const sections = [
    { id: "basic", label: "Basic Info", icon: "📝" },
    { id: "header", label: "Header", icon: "🖼️" },
    { id: "body", label: "Body", icon: "💬" },
    { id: "footer", label: "Footer", icon: "📌" },
    { id: "buttons", label: "Buttons", icon: "🔘" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm fixed w-full z-[9999]">
        <Header pageName={pageName} />
      </div>

      <div className="pt-20 pb-8 px-6">
        <div className="max-w-[1300px] mx-auto">
          {/* Header Section */}
          {/* <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Create WhatsApp Template</h1>
            <p className="text-gray-500 text-sm mt-1">Fill in the details below to create a new message template</p>
          </div> */}

          <div className="flex gap-8">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Template Sections</h3>
                  <p className="text-xs text-gray-500 mt-1">Complete all required fields</p>
                </div>
                <nav className="p-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all mb-1 flex items-center gap-3 ${
                        activeSection === section.id
                          ? "bg-green-50 text-green-700 font-medium border-l-4 border-green-500"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">{section.icon}</span>
                      <span className="text-sm">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Form */}
            <div className="flex-1 min-w-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Section */}
                {activeSection === "basic" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
                      <p className="text-sm text-gray-500">Essential template details</p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Template Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={templateData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                          placeholder="e.g., welcome_message, order_confirmation"
                          required
                        />
                        <p className="text-xs text-gray-400 mt-1">Use lowercase letters and underscores</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          value={templateData.category}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                          required
                        >
                          <option value="MARKETING">📢 Marketing</option>
                          <option value="UTILITY">⚙️ Utility</option>
                          <option value="AUTHENTICATION">🔐 Authentication</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Language <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="language"
                          value={templateData.language}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                          required
                        >
                         <option value="en_US">English (US)</option>
                <option value="en_GB">English (UK)</option>
                <option value="af">Afrikaans</option>
                <option value="sq">Albanian</option>
                <option value="ar">Arabic</option>
                <option value="az">Azerbaijani</option>
                <option value="bn">Bengali</option>
                <option value="bg">Bulgarian</option>
                <option value="ca">Catalan</option>
                <option value="zh_CN">Chinese (CHN)</option>
                <option value="zh_HK">Chinese (HKG)</option>
                <option value="zh_TW">Chinese (TAI)</option>
                <option value="hr">Croatian</option>
                <option value="cs">Czech</option>
                <option value="da">Danish</option>
                <option value="nl">Dutch</option>
                <option value="en_AE">English (UAE)</option>
                <option value="en_AU">English (AUS)</option>
                <option value="en_CA">English (CAN)</option>
                <option value="en_IN">English (IND)</option>
                <option value="et">Estonian</option>
                <option value="fil">Filipino</option>
                <option value="fi">Finnish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="el">Greek</option>
                <option value="gu">Gujarati</option>
                <option value="he">Hebrew</option>
                <option value="hi">Hindi</option>
                <option value="hu">Hungarian</option>
                <option value="id">Indonesian</option>
                <option value="ga">Irish</option>
                <option value="it">Italian</option>
                <option value="ja">Japanese</option>
                <option value="kn">Kannada</option>
                <option value="kk">Kazakh</option>
                <option value="ko">Korean</option>
                <option value="lo">Lao</option>
                <option value="lv">Latvian</option>
                <option value="lt">Lithuanian</option>
                <option value="mk">Macedonian</option>
                <option value="ms">Malay</option>
                <option value="ml">Malayalam</option>
                <option value="mr">Marathi</option>
                <option value="no">Norwegian</option>
                <option value="fa">Persian</option>
                <option value="pl">Polish</option>
                <option value="pt_BR">Portuguese (BR)</option>
                <option value="pt_PT">Portuguese (POR)</option>
                <option value="pa">Punjabi</option>
                <option value="ro">Romanian</option>
                <option value="ru">Russian</option>
                <option value="sr">Serbian</option>
                <option value="sk">Slovak</option>
                <option value="sl">Slovenian</option>
                <option value="es">Spanish</option>
                <option value="sw">Swahili</option>
                <option value="sv">Swedish</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="th">Thai</option>
                <option value="tr">Turkish</option>
                <option value="uk">Ukrainian</option>
                <option value="ur">Urdu</option>
                <option value="uz">Uzbek</option>
                <option value="vi">Vietnamese</option>
                <option value="zu">Zulu</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header Section */}
                {activeSection === "header" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Header Configuration</h2>
                      <p className="text-sm text-gray-500">Optional header with media or text</p>
                    </div>
                    <div className="p-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Header Type
                        </label>
                        <select
                          value={templateData.components.header.format || "none"}
                          onChange={(e) => {
                            const newFormat = e.target.value;
                            setTemplateData((prev) => ({
                              ...prev,
                              components: {
                                ...prev.components,
                                header: {
                                  ...prev.components.header,
                                  format: newFormat === "none" ? "" : newFormat,
                                  text: newFormat === "TEXT" ? prev.components.header.text : "",
                                },
                              },
                            }));
                          }}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                        >
                          <option value="none">None</option>
                          <option value="TEXT">Text Header</option>
                          <option value="IMAGE">Image Header</option>
                          <option value="VIDEO">Video Header</option>
                          <option value="DOCUMENT">Document Header</option>
                        </select>
                      </div>

                      {templateData.components.header.format === "TEXT" && (
                        <div className="mt-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Header Text
                          </label>
                          <input
                            type="text"
                            value={templateData.components.header.text || ""}
                            onChange={(e) =>
                              handleComponentChange("header", "text", e.target.value)
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                            placeholder="Enter header text"
                          />
                        </div>
                      )}

                      {["IMAGE", "VIDEO", "DOCUMENT"].includes(
                        templateData.components.header.format
                      ) && (
                        <div className="mt-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Upload File
                          </label>
                          <input
                            type="file"
                            accept={
                              templateData.components.header.format === "IMAGE"
                                ? ".png,.jpg,.jpeg"
                                : templateData.components.header.format === "VIDEO"
                                ? ".mp4"
                                : ".pdf"
                            }
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                if (e.target.files[0].size > 10 * 1024 * 1024) {
                                  toast.error("File size should be less than 10MB");
                                  e.target.value = "";
                                  return;
                                }
                                setSelectedFile(e.target.files[0]);
                                setTemplateData((prev) => ({
                                  ...prev,
                                  components: {
                                    ...prev.components,
                                    header: {
                                      ...prev.components.header,
                                      text: e.target.files[0].name,
                                    },
                                  },
                                }));
                              }
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Max file size: 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Body Section */}
                {activeSection === "body" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Message Body</h2>
                      <p className="text-sm text-gray-500">Main content of your template</p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Body Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={templateData.components.body.text}
                          onChange={(e) =>
                            handleComponentChange("body", "text", e.target.value)
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                          rows={6}
                          placeholder="Enter your message content... Use {{1}}, {{2}} for variables"
                          required
                        />
                        <TemplateHealthCheck />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                          💡 Tip: Use <code className="bg-gray-200 px-1 rounded">{"{{1}}"}</code>,{" "}
                          <code className="bg-gray-200 px-1 rounded">{"{{2}}"}</code> for dynamic content
                        </div>
                        <button
                          type="button"
                          onClick={addVariable}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all font-medium text-sm"
                        >
                          <FiPlus size={16} />
                          Add Variable
                        </button>
                      </div>

                      {variables.length > 0 && (
                        <div className="border-t border-gray-200 pt-5">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                              <HiOutlineVariable size={16} />
                              Variable Values
                            </h4>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              {variables.length} variable(s)
                            </span>
                          </div>

                          <div className="space-y-3">
                            {variables.map((variable, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="flex-1">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    {variable.name}
                                  </label>
                                  <input
                                    type="text"
                                    value={variable.value}
                                    onChange={(e) =>
                                      handleVariableChange(index, e.target.value)
                                    }
                                    placeholder={`Example value for ${variable.name}`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none text-sm"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeVariable(index)}
                                  className="mt-5 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Section */}
                {activeSection === "footer" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Footer</h2>
                      <p className="text-sm text-gray-500">Optional footer text</p>
                    </div>
                    <div className="p-6">
                      <input
                        type="text"
                        value={templateData.components.footer.text}
                        onChange={(e) =>
                          handleComponentChange("footer", "text", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                        placeholder="Enter footer text (e.g., Terms and conditions apply)"
                      />
                    </div>
                  </div>
                )}

                {/* Buttons Section */}
                {activeSection === "buttons" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Interactive Buttons</h2>
                      <p className="text-sm text-gray-500">Add up to 3 buttons for user interaction</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {templateData.components.buttons.map((button, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-medium text-gray-800">Button {index + 1}</h3>
                            <button
                              type="button"
                              onClick={() => removeButton(index)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                                Button Type
                              </label>
                              <select
                                value={button.type}
                                onChange={(e) => {
                                  const newButtons = [...templateData.components.buttons];
                                  newButtons[index].type = e.target.value;
                                  setTemplateData((prev) => ({
                                    ...prev,
                                    components: {
                                      ...prev.components,
                                      buttons: newButtons,
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                              >
                                <option value="QUICK_REPLY">Quick Reply</option>
                                <option value="URL">Visit Website</option>
                                <option value="PHONE_NUMBER">Call Phone Number</option>
                                <option value="COPY_CODE">Copy Offer Code</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                                Button Text <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={button.text}
                                onChange={(e) => {
                                  const newButtons = [...templateData.components.buttons];
                                  newButtons[index].text = e.target.value;
                                  setTemplateData((prev) => ({
                                    ...prev,
                                    components: {
                                      ...prev.components,
                                      buttons: newButtons,
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                placeholder="Button label"
                                required
                              />
                            </div>

                            {button.type === "URL" && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                                  Website URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="url"
                                  value={button.url || ""}
                                  onChange={(e) => {
                                    const newButtons = [...templateData.components.buttons];
                                    newButtons[index].url = e.target.value;
                                    setTemplateData((prev) => ({
                                      ...prev,
                                      components: {
                                        ...prev.components,
                                        buttons: newButtons,
                                      },
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                  placeholder="https://example.com"
                                  required
                                />
                              </div>
                            )}

                            {button.type === "PHONE_NUMBER" && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                                  Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="tel"
                                  value={button.phone_number || ""}
                                  onChange={(e) => {
                                    const newButtons = [...templateData.components.buttons];
                                    newButtons[index].phone_number = e.target.value;
                                    setTemplateData((prev) => ({
                                      ...prev,
                                      components: {
                                        ...prev.components,
                                        buttons: newButtons,
                                      },
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                  placeholder="+1234567890"
                                  required
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {templateData.components.buttons.length >= 3 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center gap-2">
                          <FiAlertCircle size={16} />
                          Maximum 3 buttons allowed per template
                        </div>
                      )}

                      <button                        type="button"
                        onClick={() => {
                          if (templateData.components.buttons.length >= 3) {
                            toast.error("Maximum 3 buttons allowed per template");
                            return;
                          }
                          addButton();
                        }}
                        disabled={templateData.components.buttons.length >= 3}
                        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 bg-white text-gray-600 px-4 py-3 rounded-xl hover:border-green-400 hover:text-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        <FiPlus size={18} />
                        Add Button
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center pt-4 pb-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all transform hover:scale-105 ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {loading && (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {loading ? "Creating Template..." : "Submit Template for Review"}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Panel */}
            <div className="w-[380px] flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800 text-center">Live Preview</h3>
                    <p className="text-xs text-gray-500 text-center">See how your template looks</p>
                  </div> */}
                  <div className="p-4 bg-gray-50">
                    <TemplatePreview />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTemp;