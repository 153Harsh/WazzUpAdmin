import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../Header/Header";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { MdContentCopy, MdCreateNewFolder, MdDelete } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import { RiFileCopyLine } from "react-icons/ri";
import { PreviewTemp } from "./PreviewTemp";
import { RxCrossCircled } from "react-icons/rx";
import { BsReplyFill } from "react-icons/bs";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { v4 as uuidv4 } from "uuid";

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// CopyTemplate Component (same as before, but with demo DB)
const CopyTemplate = ({ data }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    if (userId && !isValidObjectId(userId)) {
      console.error('Invalid ObjectId format in CopyTemplate:', userId);
      toast.error('Invalid session. Please login again.');
    }
  }, [userId]);
  
  const { id: userId } = useParams();
  const [variables, setVariables] = useState([]);
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
  const [copyTemplateData, setCopyTemplateData] = useState({});
  const [mediaUrl, setMediaUrl] = useState(null);
  const [oldMediaKey, setMediaKey] = useState(null);
  
  // ✅ FORCE DEMO DATABASE ONLY
  const dbType = "demo";

  useEffect(() => {
    const fetchTemplateDetails = async () => {
      if (!userId || !isValidObjectId(userId)) {
        console.error('Invalid userId for fetching template details');
        toast.error('Invalid session');
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:7821/api/admin/getSingleTemplateDetails/${userId}/${data}`,
          { params: { dbType: "demo" } } // ✅ Force demo
        );
        const template = response.data[0];
        setCopyTemplateData(template);

        if (template.components[0]?.MediaUrl) {
          setMediaKey(template.components[0].MediaUrl);
          try {
            const mediaResponse = await axios.get(
              `https://somprazquiz.digilateral.com/downloadObjectgc/${template.components[0].MediaUrl}`
            );
            const fileUrl = mediaResponse?.data?.downloadUrl?.url;

            if (fileUrl) {
              const isImage = /\.(jpe?g|png|webp|gif)$/i.test(template.components[0].MediaUrl);
              const isVideo = /\.(mp4|webm|mov)$/i.test(template.components[0].MediaUrl);

              if (isVideo) {
                const videoResponse = await axios.get(fileUrl, { responseType: "blob" });
                const videoBlobUrl = URL.createObjectURL(videoResponse.data);
                setMediaUrl({ type: "video", url: videoBlobUrl });
              } else if (isImage) {
                setMediaUrl({ type: "image", url: fileUrl });
              } else {
                const fileResponse = await axios.get(fileUrl, { responseType: "blob" });
                const blobUrl = URL.createObjectURL(fileResponse.data);
                setMediaUrl({ type: "file", url: blobUrl });
              }
            }
          } catch (mediaError) {
            console.error("Error fetching media:", mediaError);
          }
        }

        const mappedData = {
          name: template.name,
          category: template.category,
          language: template.language,
          components: {
            header: {
              type: "HEADER",
              format: template.components[0]?.format || "",
              text: template.components[0]?.text || "",
              example: template.components[0]?.example || {},
            },
            body: {
              type: "BODY",
              text: template.components[1]?.text || "",
              example: template.components[1]?.example || { body_text: [[]] },
            },
            footer: {
              type: "FOOTER",
              text: template.components[2]?.text || "",
            },
            buttons: template.components[3]?.buttons || [],
          },
        };

        setTemplateData(mappedData);

        const bodyText = template.components[1]?.text || "";
        const vars = bodyText.match(/\{\{\d+\}\}/g) || [];
        setVariables(
          vars.map((v, i) => ({
            name: v,
            value: template.components[1]?.example?.body_text?.[0]?.[i] || "",
          }))
        );
      } catch (err) {
        console.error("Error fetching template:", err);
      }
    };
    fetchTemplateDetails();
  }, [userId, data]);

  const [loading, setLoading] = useState(false);

  const TemplateHealthCheck = () => {
    const bodyText = templateData.components.body.text;
    const variables = bodyText.match(/\{\{\d+\}\}/g) || [];
    const varCount = variables.length;
    const textLength = bodyText.replace(/\{\{\d+\}\}/g, "").length;
    const ratio = varCount > 0 ? textLength / varCount : Infinity;
    const maxLengthExceeded = bodyText.length > 1024;

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
    };

    const hasErrors = Object.values(validations).some(Boolean);
    if (!hasErrors) return null;

    return (
      <div className="p-2 rounded bg-yellow-100 text-red-500 mt-1 space-y-2">
        {validations.missingBraces && <div>• Invalid variable format</div>}
        {validations.specialChars && <div>• Variables cannot contain special characters (#, $, %)</div>}
        {validations.nonSequential && <div>• Variables must be sequential...</div>}
        {validations.badRatio && <div>• Text-to-variable ratio too low ({ratio.toFixed(1)}). Need ≥5 chars per variable</div>}
        {validations.endsWithParam && <div>• Template cannot end with a variable</div>}
        {validations.emptyWithVars && <div>• Please add message text before variables</div>}
        {validations.maxLengthExceeded && <div>• Template body exceeds 1024 character limit</div>}
      </div>
    );
  };

  const addVariable = () => {
    const varCount = variables.length + 1;
    const newVar = `{{${varCount}}}`;
    setVariables([...variables, { name: newVar, value: "" }]);
    const newText = `${templateData.components.body.text}${newVar}`;
    handleComponentChange("body", "text", newText);
    const newExample = [...templateData.components.body.example.body_text[0], ""];
    handleComponentChange("body", "example", { body_text: [newExample] });
  };

  const removeVariable = (index) => {
    setTemplateData((prev) => {
      const currentText = prev.components.body.text;
      const variables = currentText.match(/\{\{\d+\}\}/g) || [];
      const varToRemove = variables[index];
      if (!varToRemove) return prev;
      const newText = currentText.replace(varToRemove, "");
      let varCounter = 1;
      const renumberedText = newText.replace(/\{\{\d+\}\}/g, () => `{{${varCounter++}}}`);
      const currentExamples = [...prev.components.body.example.body_text[0]];
      currentExamples.splice(index, 1);
      return {
        ...prev,
        components: {
          ...prev.components,
          body: {
            ...prev.components.body,
            text: renumberedText,
            example: { body_text: [currentExamples.length ? currentExamples : [""]] },
          },
        },
      };
    });
    setVariables((prev) => {
      const newVars = [...prev];
      newVars.splice(index, 1);
      return newVars.map((v, i) => ({ name: `{{${i + 1}}}`, value: v.value }));
    });
  };

  const handleVariableChange = (index, value) => {
    const updatedVariables = [...variables];
    updatedVariables[index].value = value;
    setVariables(updatedVariables);
    const newExample = [...templateData.components.body.example.body_text[0]];
    newExample[index] = value;
    handleComponentChange("body", "example", { body_text: [newExample] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTemplateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (component, field, value) => {
    setTemplateData((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: { ...prev.components[component], [field]: value },
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
          { type: "QUICK_REPLY", text: "", url: "", phone_number: "", example: [""] },
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
    
    if (selectedFile !== null) {
      setLoading(true);
      const fileExtension = selectedFile.name.split(".").pop();
      const uniqueFileName = `${templateData?.name}_${uuidv4()}.${fileExtension}`;
      
      try {
        const response = await axios.post(
          `http://localhost:7821/api/admin/create-template/${userId}`,
          {
            templateData: { ...templateData, name: templateData.name.toLowerCase() },
            key: uniqueFileName,
            dbType: "demo" // ✅ Force demo
          }
        );
        toast.success("Template created successfully!");
        setLoading(false);
        setSelectedFile(null);
        setTimeout(() => window.location.reload(), 1200);
      } catch (error) {
        setLoading(false);
        console.log(error.response);
        toast.error(error.response?.data?.error?.error?.error_user_msg || "Failed to create template");
      }
    } else if (oldMediaKey !== null) {
      try {
        setLoading(true);
        const response = await axios.post(
          `http://localhost:7821/api/admin/create-template/${userId}`,
          {
            templateData: { ...templateData, name: templateData.name.toLowerCase() },
            dbType: "demo" // ✅ Force demo
          }
        );
        toast.success("Template created successfully!");
        setLoading(false);
        setSelectedFile(null);
      } catch (error) {
        setLoading(false);
        toast.error(error.response?.data?.error?.error?.error_user_msg || "Failed to create template");
        console.error("API Error:", error);
      }
    } else {
      try {
        setLoading(true);
        const response = await axios.post(
          `http://localhost:7821/api/admin/create-template/${userId}`,
          {
            templateData: { ...templateData, name: templateData.name.toLowerCase() },
            dbType: "demo" // ✅ Force demo
          }
        );
        toast.success("Template created successfully!");
        setLoading(false);
        setSelectedFile(null);
        setTimeout(() => window.location.reload(), 1200);
      } catch (error) {
        setLoading(false);
        toast.error(error.response?.data?.error?.error?.error_user_msg || "Failed to create template");
        console.error("API Error:", error);
      }
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

      if (format === "TEXT") {
        return (
          <div className="font-semibold text-sm px-1 text-gray-700">
            {renderWithVariables(header.text)}
          </div>
        );
      }

      if (["IMAGE", "VIDEO", "DOCUMENT"].includes(format)) {
        if (selectedFile) {
          const url = URL.createObjectURL(selectedFile);
          if (format === "IMAGE") return <img src={url} alt="Header" className="rounded-md max-h-52 w-full object-cover" />;
          if (format === "VIDEO") return <video src={url} controls className="rounded-md max-h-52 w-full object-cover" />;
          return <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-md border text-sm text-blue-600 underline inline-block">View Document</a>;
        }
        if (mediaUrl) {
          if (mediaUrl.type === "image") return <img src={mediaUrl.url} alt="Header" className="rounded-md max-h-52 w-full object-cover" />;
          if (mediaUrl.type === "video") return <video src={mediaUrl.url} controls className="rounded-md max-h-52 w-full object-cover" />;
          return <a href={mediaUrl.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-md border text-sm text-blue-600 underline inline-block">View Document</a>;
        }
        return <div className="text-sm text-gray-500 italic">{`No ${format.toLowerCase()} selected`}</div>;
      }
      return null;
    };

    const parseWhatsAppFormatting = (text) => {
      if (!text) return null;
      const parts = text.split(/([_*~`])/);
      const elements = [];
      let inBold = false, inItalic = false, inStrike = false, inCode = false;
      parts.forEach((part, i) => {
        if (part === "*") inBold = !inBold;
        else if (part === "_") inItalic = !inItalic;
        else if (part === "~") inStrike = !inStrike;
        else if (part === "`") inCode = !inCode;
        else if (part) {
          let element = part;
          if (inBold) element = <strong key={`bold-${i}`}>{element}</strong>;
          if (inItalic) element = <em key={`italic-${i}`}>{element}</em>;
          if (inStrike) element = <del key={`strike-${i}`}>{element}</del>;
          if (inCode) element = <code key={`code-${i}`}>{element}</code>;
          elements.push(element);
        }
      });
      return elements;
    };

    const renderWithVariables = (text) =>
      text?.replace(/\{\{(\d+)\}\}/g, (_, i) => {
        const index = parseInt(i, 10) - 1;
        return bodyComponent.example?.body_text?.[0]?.[index] || `{{${i}}}`;
      });

    return (
      <>
        <div className="border max-w-[100%] p-1 bg-gray-50 rounded-md mb-1 flex justify-center items-center">
          <h3 className="font-bold text-base">Template Preview</h3>
        </div>
        <div className="bg-[#e8d8c8] p-4 w-full h-auto flex justify-center rounded-lg shadow font-sans">
          <div className="bg-[#fff] w-[300px] rounded-md p-2">
            {renderHeader()}
            {bodyComponent?.text && (
              <div className="rounded-lg px-1 py-2 text-sm text-black w-fit max-w-[100%] relative" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {parseWhatsAppFormatting(renderWithVariables(bodyComponent.text))}
              </div>
            )}
            {footerComponent?.text && (
              <div className="text-xs text-gray-600 text-left px-1">
                {parseWhatsAppFormatting(renderWithVariables(footerComponent.text))}
              </div>
            )}
            {buttonComponent?.buttons?.length > 0 && (
              <div className="flex flex-col items-stretch pt-2 w-full rounded overflow-hidden">
                {buttonComponent.buttons.map((btn, idx) => (
                  <React.Fragment key={idx}>
                    <button className="text-xs text-blue-600 text-center px-3 py-2 font-bold bg-white w-full">
                      {btn.type === "QUICK_REPLY" ? <div className="flex justify-center items-center gap-2"><BsReplyFill />{renderWithVariables(btn.text)}</div>
                        : btn.type === "URL" ? <div className="flex justify-center items-center gap-2"><FaArrowUpRightFromSquare />{renderWithVariables(btn.text)}</div>
                        : btn.type === "COPY_CODE" ? <div className="flex justify-center items-center gap-2"><MdContentCopy />{renderWithVariables(btn.text)}</div>
                        : btn.type === "PHONE_NUMBER" ? <div className="flex justify-center items-center gap-2"><IoCall />{renderWithVariables(btn.text)}</div>
                        : ""}
                    </button>
                    {idx !== buttonComponent.buttons.length - 1 && <hr className="border-t border-2 border-gray-300 mx-2" />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex justify-center w-full p-4">
      <div className="flex sm:flex-row flex-col gap-10 w-full">
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Template Name<span className="text-red-600">*</span></label>
              <input type="text" name="name" value={templateData.name || copyTemplateData?.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md lowercase" placeholder="Enter a template name" required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Category<span className="text-red-600">*</span></label>
              <select name="category" value={templateData.category || copyTemplateData?.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utility</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Language<span className="text-red-600">*</span></label>
              <select name="language" value={templateData.language || copyTemplateData?.language} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
                {/* Add more languages as needed */}
              </select>
            </div>
            <div className="mb-4">
              <label className="flex gap-4 text-gray-700 text-sm font-bold mb-2">Header<ul style={{ listStyle: "revert", fontWeight: "100" }}><li>Optional</li></ul></label>
              <select value={templateData.components.header.format || "none"} onChange={(e) => {
                const newFormat = e.target.value;
                setTemplateData((prev) => {
                  const newHeader = { ...prev.components.header, format: newFormat === "none" ? "" : newFormat, text: "" };
                  if (newFormat === "text" && copyTemplateData?.components?.[0]?.text) newHeader.text = copyTemplateData.components[0].text;
                  if (newFormat !== prev.components.header.format) setSelectedFile(null);
                  return { ...prev, components: { ...prev.components, header: newHeader } };
                });
              }} className="w-full px-3 py-2 border rounded-md mb-2">
                <option value="none">None</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </select>
              {(() => {
                const currentFormat = templateData.components.header.format || "none";
                if (currentFormat === "text") {
                  return <input type="text" value={templateData.components.header.text} onChange={(e) => handleComponentChange("header", "text", e.target.value)} className="w-full px-3 py-2 border rounded-md mt-2" placeholder="Enter header text" />;
                }
                if (["image", "video", "document"].includes(currentFormat)) {
                  return (
                    <div className="mt-2">
                      <input type="file" accept={currentFormat === "image" ? ".png,.jpg,.jpeg" : currentFormat === "video" ? ".mp4" : ".pdf"} onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setSelectedFile(file);
                          handleComponentChange("header", "text", file.name);
                        }
                      }} className="w-full px-3 py-2 border rounded-md" />
                      <p className="text-xs text-gray-500 mt-1">
                        {currentFormat === "image" && "Accepted formats: PNG, JPG"}
                        {currentFormat === "video" && "Accepted format: MP4"}
                        {currentFormat === "document" && "Accepted format: PDF"}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Body<span className="text-red-600">*</span></label>
              <textarea value={templateData.components.body.text} onChange={(e) => handleComponentChange("body", "text", e.target.value)} className="w-full px-3 py-2 border rounded-md" required rows={5} />
              <div className="text-sm"><TemplateHealthCheck /></div>
              <div className="flex justify-end">
                <button type="button" onClick={addVariable} className="ml-2 text-black text-[17px] font-normal py-1 px-2 rounded">+ Add Variable</button>
              </div>
              <div className="mt-4">
                {templateData.components.body.example.body_text[0]?.map((value, index) => {
                  const variables = templateData.components.body.text.match(/\{\{\d+\}\}/g) || [];
                  const varName = variables[index];
                  return varName ? (
                    <div key={index} className="flex mb-2">
                      <div className="mb-2 flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-1">{varName}</label>
                        <input type="text" value={value} onChange={(e) => handleVariableChange(index, e.target.value)} onKeyDown={(e) => { if (e.key === "*") e.preventDefault(); }} placeholder={`Enter content for ${varName}`} className="w-full px-3 py-2 border rounded-md" />
                      </div>
                      <div className="flex justify-center items-center">
                        <RxCrossCircled onClick={() => removeVariable(index)} size="30" color="red" className="ml-2 cursor-pointer" />
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div className="mb-4">
              <label className="flex gap-4 text-gray-700 text-sm font-bold mb-2">Footer<ul style={{ listStyle: "revert", fontWeight: "100" }}><li>Optional</li></ul></label>
              <input type="text" value={templateData.components.footer.text} onChange={(e) => handleComponentChange("footer", "text", e.target.value)} onKeyDown={(e) => { if (e.key === "*") e.preventDefault(); }} className="w-full px-3 py-2 border rounded-md" placeholder="Enter text" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Buttons</label>
              {templateData.components.buttons.map((button, index) => (
                <div key={index} className="mb-4 p-3 border rounded-md">
                  <div className="flex mb-2">
                    <select value={button.type} onChange={(e) => {
                      const newButtons = [...templateData.components.buttons];
                      newButtons[index].type = e.target.value;
                      if (e.target.value === "QUICK_REPLY") newButtons[index].text = "";
                      else { newButtons[index].url = ""; newButtons[index].example = [""]; }
                      setTemplateData((prev) => ({ ...prev, components: { ...prev.components, buttons: newButtons } }));
                    }} className="w-full px-3 py-2 border rounded-md mr-2">
                      <option value="QUICK_REPLY">Quick Reply</option>
                      <option value="URL">Visit Website</option>
                      <option value="PHONE_NUMBER">Call Phone Number</option>
                      <option value="COPY_CODE">Copy Offer Code</option>
                    </select>
                    <div className="flex justify-center items-center">
                      <RxCrossCircled onClick={() => removeButton(index)} size="30" color="red" className="ml-2 cursor-pointer" />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Button Text<span className="text-red-600">*</span></label>
                    <input type="text" value={button.text} onChange={(e) => {
                      const newButtons = [...templateData.components.buttons];
                      newButtons[index].text = e.target.value;
                      setTemplateData((prev) => ({ ...prev, components: { ...prev.components, buttons: newButtons } }));
                    }} className="w-full px-3 py-2 border rounded-md" placeholder="Button text" required />
                  </div>
                  {button.type === "URL" && (
                    <>
                      <div className="mb-2">
                        <label className="block text-gray-700 text-sm font-bold mb-1">URL<span className="text-red-600">*</span></label>
                        <input type="url" value={button.url || ""} onChange={(e) => {
                          const newButtons = [...templateData.components.buttons];
                          newButtons[index].url = e.target.value;
                          setTemplateData((prev) => ({ ...prev, components: { ...prev.components, buttons: newButtons } }));
                        }} className="w-full px-3 py-2 border rounded-md" placeholder="https://example.com" required />
                      </div>
                      <p className="text-xs text-gray-500">Note: You can add up to 2 URL buttons per template</p>
                    </>
                  )}
                  {button.type === "PHONE_NUMBER" && (
                    <>
                      <div className="mb-2">
                        <label className="block text-gray-700 text-sm font-bold mb-1">Phone Number<span className="text-red-600">*</span></label>
                        <input type="tel" value={button.phone_number || ""} onChange={(e) => {
                          const newButtons = [...templateData.components.buttons];
                          newButtons[index].phone_number = e.target.value;
                          setTemplateData((prev) => ({ ...prev, components: { ...prev.components, buttons: newButtons } }));
                        }} className="w-full px-3 py-2 border rounded-md" placeholder="+1234567890" required />
                      </div>
                      <p className="text-xs text-gray-500">Note: You can only add 1 phone number button per template</p>
                    </>
                  )}
                  {button.type === "COPY_CODE" && (
                    <>
                      <div className="mb-2">
                        <label className="block text-gray-700 text-sm font-bold mb-1">Offer Code Example</label>
                        <input type="text" value={button.example?.[0] || ""} onChange={(e) => {
                          const newButtons = [...templateData.components.buttons];
                          newButtons[index].example = [e.target.value];
                          setTemplateData((prev) => ({ ...prev, components: { ...prev.components, buttons: newButtons } }));
                        }} className="w-full px-3 py-2 border rounded-md" placeholder="DISCOUNT20" />
                      </div>
                      <p className="text-xs text-gray-500">Note: You can only add 1 copy code button per template</p>
                    </>
                  )}
                </div>
              ))}
              {templateData.components.buttons.length >= 3 && <p className="text-red-500 text-xs mb-2">Maximum 3 buttons allowed per template</p>}
              <button type="button" onClick={() => {
                if (templateData.components.buttons.length >= 3) { toast.error("Maximum 3 buttons allowed per template"); return; }
                addButton();
              }} className="border-1 border-gray-400 text-black px-3 py-2 rounded-md hover:bg-gray-200" disabled={templateData.components.buttons.length >= 3}>+ Add Button</button>
            </div>
            <div className="flex justify-center">
              <button type="submit" disabled={loading} className={`${loading ? "bg-gray-300 text-white px-4 py-2 rounded-md" : "bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"}`}>
                <p>{`${loading ? "Sending...." : "Submit For Review"}`}</p>
              </button>
            </div>
          </form>
        </div>
        <div><div className="mt-4"><TemplatePreview /></div></div>
      </div>
      <Toaster />
    </div>
  );
};

// SubmittedTemplates Component
export const SubmittedTemplates = () => {
  const pageName = "All Templates";
  const [templatesData, setTemplatesData] = useState([]);
  const { id: userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [nameToDelete, setNameToDelete] = useState("");
  const [idToDelete, setIdToDelete] = useState("");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [copyTempModal, setCopyTempModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showPreviewTemp, setShowPreviewTemp] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  
  // ✅ FORCE DEMO DATABASE ONLY
  const dbType = "demo";

  const navigate = useNavigate();

  useEffect(() => {
    if (userId && !isValidObjectId(userId)) {
      console.error('Invalid ObjectId format in SubmittedTemplates:', userId);
      toast.error('Invalid session. Please login again.');
    }
  }, [userId]);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!userId || !isValidObjectId(userId)) {
        console.error('Invalid userId for fetching templates');
        setError('Invalid session');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`/api/admin/fetchAllTemplates/${userId}`, {
          params: { dbType: "demo" } // ✅ Force demo
        });
        setTemplatesData(response.data.data || []);
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

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredData = search ? templatesData.filter((status) => status.name.includes(search)) : templatesData;

  const handleOpenDeleteModal = (name, id) => {
    setNameToDelete(name);
    setIdToDelete(id);
    setDeleteModal(true);
  };

  const handleRemoveClick = async () => {
    if (!userId || !isValidObjectId(userId)) {
      toast.error("Invalid session. Please login again.");
      return;
    }
    setBtnDisabled(true);
    try {
      await axios.delete(
        `http://localhost:7821/api/admin/delete-template/${nameToDelete}/${idToDelete}`,
        { params: { dbType: "demo" } } // ✅ Force demo
      );
      setBtnDisabled(false);
      setNameToDelete("");
      setIdToDelete("");
      setDeleteModal(false);
      setTemplatesData((prevData) => prevData.filter((item) => item.id !== idToDelete));
      toast.success("Deleted Success");
    } catch (error) {
      setBtnDisabled(false);
      toast.error("Failed to delete template");
      console.error("Delete error:", error);
    }
  };

  const handleRowClick = (msg) => {
    setSelectedMsg(msg);
    setShowPreviewTemp(true);
  };

  const closePreviewModal = () => {
    setShowPreviewTemp(false);
  };

  const handleNavigateAllTemp = () => {
    navigate(`/createTemplate/${userId}`);
  };

  return (
    <>
      {showPreviewTemp && <PreviewTemp template={selectedMsg} isOpen={showPreviewTemp} onClose={closePreviewModal} />}
      <div className="w-full h-screen overflow-hidden">
        <div className="bg-[#ece5dd]">
          <div className="bg-[#dcf8c6]">
            <Header pageName={pageName} />
          </div>
          <nav className="block bg-transparent text-black shadow-none rounded-xl transition-all px-2 py-2">
            <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
              <div className="w-full">
                <div className="flex justify-between h-[8dvh] px-3 py-2">
                  <div className="w-full max-w-md px-4 py-2 bg-white flex items-center justify-between rounded-full">
                    <input type="text" placeholder="Search Template Name" onChange={handleSearchChange} className="flex-1 w-full outline-none transition-all duration-300" />
                    <FaSearch className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  </div>
                </div>
                <div className="h-[88vh] px-2 overflow-x-hidden">
                  <div className="min-w-full shadow rounded-lg overflow-auto relative">
                    <div className="fixed bottom-6 left-24 z-10 sm:left-32 flex items-center" onClick={handleNavigateAllTemp}>
                      <div className="bg-[#25d366] p-3 rounded-full cursor-pointer shadow-lg hover:bg-[#128C7E transition-all duration-300 flex items-center overflow-hidden group">
                        <MdCreateNewFolder size={24} color="white" className="flex-shrink-0" />
                        <span className="max-w-0 overflow-hidden translate-x-[-10px] group-hover:max-w-xs group-hover:translate-x-0 group-hover:ml-2 whitespace-nowrap text-white font-medium transition-all duration-300">
                          Create Template
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:block h-[82vh] overflow-auto scrollbar-hidden bg-white">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-1 py-2.5 text-gray-600 text-center text-xs font-semibold uppercase tracking-wider sticky bg-gray-100 top-0 z-10">SR.no</th>
                            <th className="py-2.5 text-gray-600 text-left text-xs font-semibold uppercase tracking-wider sticky bg-gray-100 top-0 z-10 whitespace-nowrap">Template Name</th>
                            <th className="px-1 py-2.5 text-gray-600 text-center text-xs font-semibold uppercase tracking-wider sticky bg-gray-100 top-0 z-10 whitespace-nowrap">Language</th>
                            <th className="px-1 py-2.5 text-gray-600 text-center text-xs font-semibold uppercase tracking-wider sticky bg-gray-100 top-0 z-10 whitespace-nowrap">Status</th>
                            <th className="px-1 py-2.5 text-gray-600 text-center text-xs font-semibold uppercase tracking-wider sticky bg-gray-100 top-0 z-10 whitespace-nowrap">Category</th>
                            <th className="px-1 py-2.5 text-gray-600 text-center text-xs font-semibold uppercase tracking-wider sticky bg-gray-100 top-0 z-10 whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading && (
                            <tr><td colSpan={6} className="h-[72vh]"><div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div></div></td></tr>
                          )}
                          {filteredData.map((msg, index, arr) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors cursor-pointer">
                              <td className="py-1 text-center whitespace-nowrap text-sm text-gray-700">{arr.length - index}</td>
                              <td onClick={() => handleRowClick(msg)} className="py-1 text-left whitespace-nowrap text-sm text-gray-700">{msg?.name || "-"}</td>
                              <td className="py-1 text-center whitespace-nowrap text-sm text-gray-700">{msg?.language || "-"}</td>
                              <td className="py-1 text-center whitespace-nowrap text-sm text-gray-700">{msg?.status || "-"}</td>
                              <td className="py-1 text-center whitespace-nowrap text-sm text-gray-700">{msg?.category || "-"}</td>
                              <td className="py-1 text-center whitespace-nowrap text-sm text-gray-700">
                                <div className="flex justify-center gap-2">
                                  <RiFileCopyLine size={20} className="cursor-pointer" onClick={() => { setTemplateName(msg?.name); setCopyTempModal(true); }} color="green" />
                                  <MdDelete size={20} className="cursor-pointer" onClick={() => handleOpenDeleteModal(msg?.name, msg?.id)} color="green" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {copyTempModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-10">
                          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] overflow-y-auto scrollbar-hidden p-4 relative">
                            <button onClick={() => setCopyTempModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <CopyTemplate data={templateName} />
                          </div>
                        </div>
                      )}

                      {deleteModal && (
                        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                          <div className="bg-white p-4 rounded">
                            <p className="mb-2">Are you sure you want to delete?</p>
                            <div className="flex justify-center">
                              <button onClick={handleRemoveClick} disabled={btnDisabled} className={`${btnDisabled ? "bg-gray-300" : "bg-red-500"} text-white px-4 py-2 rounded mr-2`}>Yes</button>
                              <button onClick={() => setDeleteModal(false)} className="bg-blue-500 text-white px-4 py-2 rounded">No</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
      <Toaster />
    </>
  );
};