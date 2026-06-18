import React from "react";
import { MdContentCopy, MdCampaign } from "react-icons/md";
import { IoIosKey } from "react-icons/io";
import { TbSpeakerphone } from "react-icons/tb";
import { BsReplyFill } from "react-icons/bs";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { IoCall } from "react-icons/io5";

export const PreviewTemp = ({ template, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getCategoryIcon = (category) => {
    switch (category?.toUpperCase()) {
      case "MARKETING":
        return <MdCampaign size="40px" className="text-green-600" />;
      case "UTILITY":
        return <TbSpeakerphone size="40px" className="text-blue-600" />;
      case "AUTHENTICATION":
        return <IoIosKey size="40px" className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const components = template.components || [];

  const bodyComponent = components.find((c) => c.type === "BODY");
  const headerComponent = components.find((c) => c.type === "HEADER");
  const footerComponent = components.find((c) => c.type === "FOOTER");
  const buttonComponent = components.find((c) => c.type === "BUTTONS");

  // Replace {{1}}, {{2}} with actual values
  const renderWithVariables = (text) =>
    text?.replace(
      /\{\{(\d+)\}\}/g,
      (_, i) => bodyComponent?.example?.body_text?.[0]?.[i - 1] || `{{${i}}}`
    );

  // Parse *bold*, _italic_, ~strikethrough~
  const parseWhatsAppFormatting = (text) => {
    if (!text) return null;

    // Recursive function to parse with priority: bold inside italic
    const parse = (str) => {
      // Handle italics first (outer)
      const italicRegex = /_(.*?)_/g;
      const boldRegex = /\*(.*?)\*/g;
      const strikeRegex = /~(.*?)~/g;
      const codeRegex = /```(.*?)```/g;

      let result = [];
      let lastIndex = 0;
      let match;

      const processRegex = (regex, tag, input) => {
        const output = [];
        let m,
          index = 0;

        while ((m = regex.exec(input)) !== null) {
          if (m.index > index) {
            output.push(parseNested(input.slice(index, m.index)));
          }
          output.push(
            React.createElement(tag, { key: Math.random() }, parseNested(m[1]))
          );
          index = regex.lastIndex;
        }

        if (index < input.length) {
          output.push(parseNested(input.slice(index)));
        }

        return output;
      };

      const parseNested = (segment) => {
        if (!segment) return null;
        if (segment.includes("*"))
          return processRegex(boldRegex, "strong", segment);
        if (segment.includes("~"))
          return processRegex(strikeRegex, "del", segment);
        if (segment.includes("```"))
          return processRegex(codeRegex, "code", segment);
        return segment;
      };

      // Start with italic (outermost)
      result = processRegex(italicRegex, "em", str);

      // If no match found, fall back to bold/others
      if (result.length === 1 && typeof result[0] === "string") {
        const temp = result[0];
        result = processRegex(boldRegex, "strong", temp);
        if (result.length === 1 && typeof result[0] === "string") {
          result = processRegex(strikeRegex, "del", temp);
        }
        if (result.length === 1 && typeof result[0] === "string") {
          result = processRegex(codeRegex, "code", temp);
        }
      }

      return result;
    };

    // Handle line breaks and spaces
    const lines = text.split("\n");
    const jsx = [];

    lines.forEach((line, i) => {
      const parsedLine = parse(line);
      jsx.push(
        <React.Fragment key={i}>
          {parsedLine.map((part, j) =>
            typeof part === "string"
              ? part.split(" ").map((word, k, arr) => (
                  <React.Fragment key={`${i}-${j}-${k}`}>
                    {word}
                    {k < arr.length - 1 && "\u00A0"}
                  </React.Fragment>
                ))
              : part
          )}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });

    return jsx;
  };

  const renderHeader = () => {
    if (!headerComponent) return null;

    const mediaUrl = headerComponent.example?.header_handle?.[0];
    const format = headerComponent.format;

    if (format === "TEXT") {
      return (
        <div className="font-semibold text-sm px-1 text-gray-700">
          {renderWithVariables(headerComponent.text)}
        </div>
      );
    }

    if (format === "IMAGE" && mediaUrl) {
      return (
        <img
          src={mediaUrl}
          alt="Header Image"
          className="rounded-md max-h-52 w-full object-cover"
        />
      );
    }

    if (format === "VIDEO" && mediaUrl) {
      return (
        <video
          controls
          src={mediaUrl}
          className="rounded-md max-h-52 w-full object-cover"
        />
      );
    }

    if (format === "DOCUMENT" && mediaUrl) {
      return (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-gray-100 rounded-md border text-sm text-blue-600 underline inline-block"
        >
          View Document
        </a>
      );
    }

    return null;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-8">
        {/* Wrapper with relative positioning */}
        <div className="relative w-full max-w-2xl mt-10">
          {/* Close Button - positioned outside top-right */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-9 rounded-full p-1 text-white hover:text-gray-900"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Modal Container */}
          <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto scrollbar-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Template Preview</h3>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 w-full mb-4">
                <div className="text-sm text-gray-800 leading-snug">
                  {/* First row: Name & Language */}
                  <div className="flex flex-wrap items-center gap-2 font-semibold text-[15px] text-black">
                    <span>{template?.name}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-600">{template?.language}</span>
                  </div>

                  {/* Second row: Status */}
                  {template?.status && (
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        {template.status}
                      </span>
                    </div>
                  )}

                  {/* Third row: Category with Icon */}
                  {template?.category && (
                    <div className="flex items-center text-sm text-gray-700 mt-2">
                      <span className="text-gray-500">·</span>
                      <span className="ml-1 flex items-center gap-1">
                        {getCategoryIcon(template.category)}
                        <span>{template.category}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#e8d8c8] p-4 w-full h-auto flex justify-center rounded-lg shadow font-sans">
                <div className="bg-[#fff] w-[300px] rounded-md p-2">
                  {/* HEADER */}
                  {renderHeader()}

                  {/* BODY MESSAGE */}
                  {bodyComponent && (
                    <div
                      className="rounded-lg px-1 py-2 text-sm text-black w-fit max-w-[100%] relative"
                      style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                      {parseWhatsAppFormatting(
                        renderWithVariables(bodyComponent.text)
                      )}
                    </div>
                  )}

                  {/* FOOTER */}
                  {footerComponent?.text && (
                    <div className="text-xs text-gray-600 text-left px-1 italic">
                      {renderWithVariables(footerComponent.text)}
                    </div>
                  )}

                  {/* BUTTONS */}
                  {buttonComponent?.buttons?.length > 0 && (
                    <div className="flex flex-col items-stretch pt-2 w-full rounded overflow-hidden">
                      {buttonComponent.buttons.map((btn, idx) => (
                        <React.Fragment key={idx}>
                          <button className="text-xs text-blue-600 text-center px-3 py-2 font-bold bg-white w-full">
                            {btn.type === "QUICK_REPLY" ? (
                              <div className="flex justify-center items-center gap-2">
                                <BsReplyFill />
                                {renderWithVariables(btn.text)}
                              </div>
                            ) : btn.type === "URL" ? (
                              <div className="flex justify-center items-center gap-2">
                                <FaArrowUpRightFromSquare />
                                {renderWithVariables(btn.text)}
                              </div>
                            ) : btn.type === "COPY_CODE" ? (
                              <div className="flex justify-center items-center gap-2">
                                <MdContentCopy />
                                {renderWithVariables(btn.text)}
                              </div>
                            ) : btn.type === "PHONE_NUMBER" ? (
                              <div className="flex justify-center items-center gap-2">
                                <IoCall />
                                {renderWithVariables(btn.text)}
                              </div>
                            ) : (
                              ""
                            )}
                          </button>
                          {idx !== buttonComponent.buttons.length - 1 && (
                            <hr className="border-t border-2 border-gray-300 mx-2" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </>
  );
};