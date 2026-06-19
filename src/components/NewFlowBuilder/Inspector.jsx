function Inspector({ selectedNode, setNodes, setSelectedNode }) {
    if (!selectedNode) {
        return (
            <div className="inspector">
                <h2>Inspector</h2>
                <p>Select a node.</p>
            </div>
        );
    }

    // Update both nodes array AND selectedNode state
    const updateNode = (field, value) => {
        setNodes((prev) =>
            prev.map((node) =>
                node.id === selectedNode.id
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            [field]: value,
                        },
                    }
                    : node
            )
        );

        // Also update selectedNode to keep Inspector in sync
        setSelectedNode((prev) => ({
            ...prev,
            data: {
                ...prev.data,
                [field]: value,
            },
        }));
    };

    const updateMessage = (value) => {
        updateNode("message", value);
    };

    return (
        <div className="inspector">
            <h2>Inspector</h2>

            <p>
                <strong>{selectedNode.data.label}</strong>
            </p>

            {selectedNode?.type === "startNode" && (
  <>
            {/* <label>Trigger Message</label> */}

            {/* <input
            type="text"
            placeholder="#test"
            value={selectedNode.data.trigger || ""}
            onChange={(e) =>
            updateNode("trigger", e.target.value)
            }
            style={{
            width: "100%",
            padding: "8px",
            marginTop: "5px",
            marginBottom: "10px"
            }}
            /> */}
            </>
            )}
            {/* Text Msg */}
            {selectedNode.type === "textNode" && (
                <>
                    <label>Message</label>
                    <textarea
                        rows="5"
                        style={{ width: "100%", marginTop: "10px" }}
                        value={selectedNode.data.message || ""}
                        onChange={(e) => updateMessage(e.target.value)}
                    />
                </>
            )}

            {/* WA Buttons */}
            {selectedNode.data.label === "WA Buttons" && (
                <>
                    <label>Prompt</label>
                    <input
                        type="text"
                        value={selectedNode.data.prompt || ""}
                        style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                        onChange={(e) => updateNode("prompt", e.target.value)}
                    />

                    <br />
                    <br />

                    <label>Buttons</label>

                    {(selectedNode.data.buttons || []).map((button, index) => (
                        <div
                            key={index}
                            style={{ display: "flex", gap: "5px", marginTop: "10px" }}
                        >
                            <input
                                value={button}
                                style={{ flex: 1, padding: "10px" }}
                                onChange={(e) => {
                                    const updated = [...(selectedNode.data.buttons || [])];
                                    updated[index] = e.target.value;
                                    updateNode("buttons", updated);
                                }}
                            />

                            <button
                                onClick={() => {
                                    const updated = selectedNode.data.buttons.filter(
                                        (_, i) => i !== index
                                    );
                                    updateNode("buttons", updated);
                                }}
                            >
                                X
                            </button>
                        </div>
                    ))}

                    <button
                        style={{ marginTop: "15px" }}
                        onClick={() => {
                            const updated = [...(selectedNode.data.buttons || []), ""];
                            updateNode("buttons", updated);
                        }}
                    >
                        + Add Button
                    </button>
                </>
            )}

            {/* WA Template Node */}
            {selectedNode?.type === "waTemplateNode" && (
                <>
                    {/* <h3>WA TEMPLATE • {selectedNode.id}</h3> */}

                    {/* <label>Template Name</label> */}
                    {/* <input
                        value={selectedNode.data.templateName || ""}
                        onChange={(e) => updateNode("templateName", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    /> */}

                    {/* <label>Language</label> */}
                    {/* <input
                        value={selectedNode.data.language || ""}
                        onChange={(e) => updateNode("language", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    /> */}

                    <label>Header Type</label>
                    <select
                        value={selectedNode.data.headerType || "none"}
                        onChange={(e) => updateNode("headerType", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    >
                        <option value="none">none</option>
                        <option value="text">text</option>
                        <option value="image">image</option>
                        <option value="video">video</option>
                        <option value="document">document</option>
                    </select>

                    {/* Header Value */}
                    {selectedNode.data.headerType && selectedNode.data.headerType !== "none" && (
                        <>
                            <label>
                                Header {selectedNode.data.headerType === "text" ? "Text" : "URL"}
                            </label>
                            {selectedNode.data.headerType === "text" ? (
                                <input
                                    type="text"
                                    value={selectedNode.data.headerValue || ""}
                                    onChange={(e) => updateNode("headerValue", e.target.value)}
                                    placeholder="Enter header text..."
                                    style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={selectedNode.data.headerValue || ""}
                                    onChange={(e) => updateNode("headerValue", e.target.value)}
                                    placeholder="Enter media URL..."
                                    style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                                />
                            )}
                        </>
                    )}

                    {/* <label>Body Variables (comma-separated)</label>
                    <input
                        value={selectedNode.data.bodyVariables?.join(", ") || ""}
                        onChange={(e) =>
                            updateNode(
                                "bodyVariables",
                                e.target.value
                                    .split(",")
                                    .map((v) => v.trim())
                                    .filter(Boolean)
                            )
                        }
                        placeholder="first_name, last_name"
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    /> */}

                    <label>Template Body</label>
 
                    <textarea
                        value={selectedNode.data.bodyText || ""}
                        onChange={(e) =>
                            updateNode("bodyText", e.target.value)
                        }
                        placeholder="Enter WhatsApp template body..."
                        style={{
                            width: "100%",
                            minHeight: "120px",
                            padding: "8px",
                            marginTop: "5px",
                            marginBottom: "10px",
                        }}
                    />
 

                    <br />

                    <label>Template Buttons (max 3)</label>

                    {(selectedNode.data.templateButtons || []).map((btn, index) => (
                        <div
                            key={index}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "10px",
                                marginTop: "10px",
                                background: "#f9f9f9",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <strong>Button {index + 1}</strong>
                                <button
                                    onClick={() => {
                                        const updated = selectedNode.data.templateButtons.filter(
                                            (_, i) => i !== index
                                        );
                                        updateNode("templateButtons", updated);
                                    }}
                                    style={{
                                        background: "#ff4444",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "2px 8px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <label style={{ fontSize: "12px" }}>Type</label>
                            <select
                                value={btn.type || "quick_reply"}
                                onChange={(e) => {
                                    const updated = [...selectedNode.data.templateButtons];
                                    updated[index] = { ...updated[index], type: e.target.value };
                                    updateNode("templateButtons", updated);
                                }}
                                style={{ width: "100%", padding: "6px", marginBottom: "5px" }}
                            >
                                <option value="quick_reply">Quick Reply</option>
                                <option value="url">URL</option>
                                <option value="phone_number">Phone Number</option>
                            </select>

                            <label style={{ fontSize: "12px" }}>Text</label>
                            <input
                                type="text"
                                value={btn.text || ""}
                                onChange={(e) => {
                                    const updated = [...selectedNode.data.templateButtons];
                                    updated[index] = { ...updated[index], text: e.target.value };
                                    updateNode("templateButtons", updated);
                                }}
                                placeholder="Button text"
                                style={{ width: "100%", padding: "6px", marginBottom: "5px" }}
                            />

                            {btn.type === "url" && (
                                <>
                                    <label style={{ fontSize: "12px" }}>URL</label>
                                    <input
                                        type="text"
                                        value={btn.url || ""}
                                        onChange={(e) => {
                                            const updated = [...selectedNode.data.templateButtons];
                                            updated[index] = { ...updated[index], url: e.target.value };
                                            updateNode("templateButtons", updated);
                                        }}
                                        placeholder="https://example.com"
                                        style={{ width: "100%", padding: "6px" }}
                                    />
                                </>
                            )}

                            {btn.type === "phone_number" && (
                                <>
                                    <label style={{ fontSize: "12px" }}>Phone Number</label>
                                    <input
                                        type="text"
                                        value={btn.phone || ""}
                                        onChange={(e) => {
                                            const updated = [...selectedNode.data.templateButtons];
                                            updated[index] = { ...updated[index], phone: e.target.value };
                                            updateNode("templateButtons", updated);
                                        }}
                                        placeholder="+1234567890"
                                        style={{ width: "100%", padding: "6px" }}
                                    />
                                </>
                            )}
                        </div>
                    ))}

                    <button
                        style={{ marginTop: "10px", width: "100%" }}
                        onClick={() => {
                            if ((selectedNode.data.templateButtons || []).length >= 3) return;
                            const updated = [
                                ...(selectedNode.data.templateButtons || []),
                                { type: "quick_reply", text: "" },
                            ];
                            updateNode("templateButtons", updated);
                        }}
                    >
                        + Add Button
                    </button>
                </>
            )}

            {/* WA List Node */}
            {selectedNode?.type === "waListNode" && (
                <>
                    {/* <h3>WA LIST • {selectedNode.id}</h3> */}

                    <label>Body</label>
                    <textarea
                        value={selectedNode.data.body || ""}
                        onChange={(e) => updateNode("body", e.target.value)}
                        rows="3"
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                        placeholder="Please pick an option"
                    />

                    <label>Button Text (max 20 chars)</label>
                    <input
                        value={selectedNode.data.buttonText || ""}
                        onChange={(e) => updateNode("buttonText", e.target.value)}
                        maxLength={20}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                        placeholder="View options"
                    />

                    <h4 style={{ marginTop: "15px", marginBottom: "10px" }}>Sections</h4>

                    {(selectedNode.data.sections || []).map((section, sectionIndex) => (
                        <div
                            key={sectionIndex}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "10px",
                                marginTop: "10px",
                                background: "#f9f9f9",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <strong>Section {sectionIndex + 1}</strong>
                                <button
                                    onClick={() => {
                                        const updated = selectedNode.data.sections.filter(
                                            (_, i) => i !== sectionIndex
                                        );
                                        updateNode("sections", updated);
                                    }}
                                    style={{
                                        background: "#ff4444",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "2px 8px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <label style={{ fontSize: "12px" }}>Section Title</label>
                            <input
                                value={section.title || ""}
                                onChange={(e) => {
                                    const updated = [...selectedNode.data.sections];
                                    updated[sectionIndex].title = e.target.value;
                                    updateNode("sections", updated);
                                }}
                                style={{ width: "100%", padding: "6px", marginBottom: "8px" }}
                                placeholder="Section title"
                            />

                            <label style={{ fontSize: "12px" }}>Rows</label>
                            {(section.rows || []).map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    style={{
                                        display: "flex",
                                        gap: "5px",
                                        marginTop: "5px",
                                    }}
                                >
                                    <input
                                        value={row}
                                        onChange={(e) => {
                                            const updated = [...selectedNode.data.sections];
                                            updated[sectionIndex].rows[rowIndex] = e.target.value;
                                            updateNode("sections", updated);
                                        }}
                                        style={{ flex: 1, padding: "6px" }}
                                        placeholder={`Option ${rowIndex + 1}`}
                                    />
                                    <button
                                        onClick={() => {
                                            const updated = [...selectedNode.data.sections];
                                            updated[sectionIndex].rows = updated[sectionIndex].rows.filter(
                                                (_, i) => i !== rowIndex
                                            );
                                            updateNode("sections", updated);
                                        }}
                                        style={{
                                            background: "#ff4444",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "2px 8px",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            <button
                                style={{ marginTop: "8px", fontSize: "12px" }}
                                onClick={() => {
                                    if ((section.rows || []).length >= 10) return;
                                    const updated = [...selectedNode.data.sections];
                                    updated[sectionIndex].rows = [
                                        ...(updated[sectionIndex].rows || []),
                                        "New Option",
                                    ];
                                    updateNode("sections", updated);
                                }}
                            >
                                + Add Row
                            </button>
                        </div>
                    ))}

                    <button
                        style={{ marginTop: "10px", width: "100%" }}
                        onClick={() => {
                            const updated = [
                                ...(selectedNode.data.sections || []),
                                {
                                    title: "New Section",
                                    rows: [],
                                },
                            ];
                            updateNode("sections", updated);
                        }}
                    >
                        + Add Section
                    </button>
                </>
            )}

            {/* API Node - FIXED */}
            {selectedNode?.type === "apiNode" && (
                <>
                    {/* <h3>API • {selectedNode.id}</h3> */}

                    <label>Method</label>
                    <select
                        value={selectedNode.data.method || "GET"}
                        onChange={(e) => updateNode("method", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>

                    <label>URL</label>
                    <input
                        type="text"
                        value={selectedNode.data.url || ""}
                        onChange={(e) => updateNode("url", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                        placeholder="https://api.example.com/endpoint"
                    />

                    <label>Body Template (JSON, supports {"{{var}}"})</label>
                    <textarea
                        rows={6}
                        value={selectedNode.data.bodyTemplate || ""}
                        onChange={(e) => updateNode("bodyTemplate", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px", fontFamily: "monospace", fontSize: "12px" }}
                        placeholder='{"name": "{{user_name}}", "age": {{age}}}'
                    />

                    <label>Save response to ctx as</label>
                    <input
                        type="text"
                        value={selectedNode.data.responseVariable || ""}
                        onChange={(e) => updateNode("responseVariable", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                        placeholder="api_response"
                    />

                    <h4>Headers</h4>

                    {(selectedNode.data.headers || []).map((header, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                gap: "8px",
                                marginBottom: "8px",
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Key"
                                value={header.key || ""}
                                onChange={(e) => {
                                    const updated = [...(selectedNode.data.headers || [])];
                                    updated[index] = { ...updated[index], key: e.target.value };
                                    updateNode("headers", updated);
                                }}
                                style={{ flex: 1, padding: "6px" }}
                            />
                            <input
                                type="text"
                                placeholder="Value"
                                value={header.value || ""}
                                onChange={(e) => {
                                    const updated = [...(selectedNode.data.headers || [])];
                                    updated[index] = { ...updated[index], value: e.target.value };
                                    updateNode("headers", updated);
                                }}
                                style={{ flex: 1, padding: "6px" }}
                            />
                            <button
                                onClick={() => {
                                    const updated = (selectedNode.data.headers || []).filter(
                                        (_, i) => i !== index
                                    );
                                    updateNode("headers", updated);
                                }}
                                style={{
                                    background: "#ff4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "0 8px",
                                    cursor: "pointer",
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={() => {
                            const updated = [...(selectedNode.data.headers || []), { key: "", value: "" }];
                            updateNode("headers", updated);
                        }}
                        style={{ marginTop: "8px", padding: "6px 12px", cursor: "pointer" }}
                    >
                        + Add Header
                    </button>
                </>
            )}

            {/* Delay Node */}
            {selectedNode?.type === "delayNode" && (
                <>
                    <h3>DELAY • {selectedNode.id}</h3>

                    <label>Duration</label>
                    <input
                        type="number"
                        min="1"
                        value={selectedNode.data.delayValue ?? 1}
                        onChange={(e) => updateNode("delayValue", Number(e.target.value))}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    />

                    <label>Unit</label>
                    <select
                        value={selectedNode.data.delayUnit || "minutes"}
                        onChange={(e) => updateNode("delayUnit", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    >
                        <option value="seconds">seconds</option>
                        <option value="minutes">minutes</option>
                        <option value="hours">hours</option>
                        <option value="days">days</option>
                    </select>
                </>
            )}

            {/* Input Node */}
            {selectedNode.type === "inputNode" && (
                <>
                    <label>Variable Name</label>
                    <input
                        value={selectedNode.data.variableName || ""}
                        onChange={(e) => updateNode("variableName", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    />

                    <label>Placeholder</label>
                    <input
                        value={selectedNode.data.placeholder || ""}
                        onChange={(e) => updateNode("placeholder", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    />
                </>
            )}

            {/* WA Media Node */}
            {selectedNode?.type === "waMediaNode" && (
                <>
                    {/* <h3>WA MEDIA • {selectedNode.id}</h3> */}

                    <label>Media Type</label>
                    <select
                        value={selectedNode.data.mediaType || ""}
                        onChange={(e) => updateNode("mediaType", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                    >
                        <option value="image">image</option>
                        <option value="video">video</option>
                        <option value="document">document</option>
                        <option value="audio">audio</option>
                        <option value="sticker">sticker</option>
                    </select>

                    <label>Media Source</label>
                    <select
                        value={selectedNode.data.mediaSource || "url"}
                        onChange={(e) => updateNode("mediaSource", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                    >
                        <option value="url">URL</option>
                        <option value="upload">Upload</option>
                    </select>

                    {selectedNode.data.mediaSource === "url" ? (
                        <>
                            <label>URL</label>
                            <input
                                type="text"
                                value={selectedNode.data.mediaUrl || ""}
                                onChange={(e) => updateNode("mediaUrl", e.target.value)}
                                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                            />
                        </>
                    ) : (
                        <>
                            <label>Upload File</label>
                            <input
                                type="file"
                                accept={
                                    selectedNode.data.mediaType === "image"
                                        ? "image/*"
                                        : selectedNode.data.mediaType === "video"
                                            ? "video/*"
                                            : selectedNode.data.mediaType === "audio"
                                                ? "audio/*"
                                                : "*"
                                }
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        updateNode("uploadedPreviewUrl", reader.result);
                                        updateNode("uploadedFileName", file.name);
                                    };
                                    reader.readAsDataURL(file);
                                }}
                                style={{ width: "100%", marginBottom: "10px" }}
                            />
                            {selectedNode.data.uploadedFileName && (
                                <p style={{ fontSize: "12px", color: "#666" }}>
                                    Selected: {selectedNode.data.uploadedFileName}
                                </p>
                            )}
                        </>
                    )}

                    <label>Caption</label>
                    <textarea
                        value={selectedNode.data.caption || ""}
                        onChange={(e) => updateNode("caption", e.target.value)}
                        style={{ width: "100%", padding: "8px" }}
                    />
                </>
            )}
            {selectedNode?.type === "formNode" && (
                <>
                    {/* <h3>Form Settings</h3> */}

                    <label>Form Title</label>

                    <input
                        value={selectedNode.data.formTitle || ""}
                        placeholder="Doctor Details"
                        style={{
                            width: "100%",
                            padding: "8px",
                            marginBottom: "15px",
                        }}
                        onChange={(e) =>
                            updateNode(
                                "formTitle",
                                e.target.value
                            )
                        }
                    />

                    <h3>Form Fields</h3>

                    {(selectedNode.data.formFields || []).map(
                        (field, index) => (
                            <div
                                key={index}
                                style={{
                                    border: "1px solid #ddd",
                                    padding: "10px",
                                    marginBottom: "15px",
                                    borderRadius: "8px",
                                }}
                            >
                                <label>Question</label>

                                <input
                                    value={field.label}
                                    placeholder="Question"
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        marginBottom: "10px",
                                    }}
                                    onChange={(e) => {
                                        const updated = [
                                            ...selectedNode.data.formFields,
                                        ];

                                        updated[index].label =
                                            e.target.value;

                                        updateNode(
                                            "formFields",
                                            updated
                                        );
                                    }}
                                />

                                <label>Field Type</label>

                                <select
                                    value={field.type}
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        marginBottom: "10px",
                                    }}
                                    onChange={(e) => {
                                        const updated = [
                                            ...selectedNode.data.formFields,
                                        ];

                                        updated[index].type =
                                            e.target.value;

                                        if (
                                            e.target.value ===
                                            "select" &&
                                            !updated[index]
                                                .options
                                        ) {
                                            updated[index]
                                                .options =
                                                [];
                                        }

                                        updateNode(
                                            "formFields",
                                            updated
                                        );
                                    }}
                                >
                                    <option value="text">
                                        Text
                                    </option>

                                    <option value="phone">
                                        Phone
                                    </option>

                                    <option value="email">
                                        Email
                                    </option>

                                    <option value="select">
                                        Dropdown
                                    </option>
                                </select>

                                <label>Variable</label>

                                <input
                                    value={field.variable}
                                    placeholder="Variable"
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        marginBottom: "10px",
                                    }}
                                    onChange={(e) => {
                                        const updated = [
                                            ...selectedNode.data.formFields,
                                        ];

                                        updated[index].variable =
                                            e.target.value;

                                        updateNode(
                                            "formFields",
                                            updated
                                        );
                                    }}
                                />

                                {field.type ===
                                    "select" && (
                                        <>
                                            <label>
                                                Dropdown Options
                                            </label>

                                            {(field.options ||
                                                []).map(
                                                    (
                                                        option,
                                                        optionIndex
                                                    ) => (
                                                        <div
                                                            key={
                                                                optionIndex
                                                            }
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                gap: "5px",
                                                                marginBottom:
                                                                    "5px",
                                                            }}
                                                        >
                                                            <input
                                                                value={
                                                                    option
                                                                }
                                                                placeholder={`Option ${optionIndex +
                                                                    1
                                                                    }`}
                                                                style={{
                                                                    flex: 1,
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const updated =
                                                                        [
                                                                            ...selectedNode.data
                                                                                .formFields,
                                                                        ];

                                                                    updated[
                                                                        index
                                                                    ].options[
                                                                        optionIndex
                                                                    ] =
                                                                        e.target.value;

                                                                    updateNode(
                                                                        "formFields",
                                                                        updated
                                                                    );
                                                                }}
                                                            />

                                                            <button
                                                                onClick={() => {
                                                                    const updated =
                                                                        [
                                                                            ...selectedNode.data
                                                                                .formFields,
                                                                        ];

                                                                    updated[
                                                                        index
                                                                    ].options =
                                                                        updated[
                                                                            index
                                                                        ].options.filter(
                                                                            (
                                                                                _,
                                                                                i
                                                                            ) =>
                                                                                i !==
                                                                                optionIndex
                                                                        );

                                                                    updateNode(
                                                                        "formFields",
                                                                        updated
                                                                    );
                                                                }}
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    )
                                                )}

                                            <button
                                                style={{
                                                    marginTop:
                                                        "8px",
                                                }}
                                                onClick={() => {
                                                    const updated =
                                                        [
                                                            ...selectedNode.data
                                                                .formFields,
                                                        ];

                                                    updated[
                                                        index
                                                    ].options =
                                                        [
                                                            ...(updated[
                                                                index
                                                            ]
                                                                .options ||
                                                                []),

                                                            "",
                                                        ];

                                                    updateNode(
                                                        "formFields",
                                                        updated
                                                    );
                                                }}
                                            >
                                                + Add Option
                                            </button>
                                        </>
                                    )}

                                <button
                                    style={{
                                        marginTop: "15px",
                                        borderRadius:"20px",
                                        paddingRight:"6px",
                                        paddingLeft:"6px",
                                        background:
                                            "#ff4444",
                                        color: "white",
                                        fontSize:"14px"
                                    }}
                                    onClick={() => {
                                        const updated =
                                            selectedNode.data.formFields.filter(
                                                (
                                                    _,
                                                    i
                                                ) =>
                                                    i !==
                                                    index
                                            );

                                        updateNode(
                                            "formFields",
                                            updated
                                        );
                                    }}
                                >
                                    Delete Field
                                </button>
                            </div>
                        )
                    )}

                    <button
                        onClick={() => {
                            updateNode(
                                "formFields",
                                [
                                    ...(selectedNode.data
                                        .formFields ||
                                        []),

                                    {
                                        label: "",
                                        type: "text",
                                        variable: "",
                                        required: false,
                                        options: [],
                                    },
                                ]
                            );
                        }}
                    >
                        + Add Field
                    </button>
                </>
            )}

            {/* Condition Node */}
            {selectedNode?.type === "conditionNode" && (
                <>
                    <label>Variable</label>
                    <input
                        value={selectedNode.data.variable || ""}
                        onChange={(e) => updateNode("variable", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    />

                    <label>Operator</label>
                    <select
                        value={selectedNode.data.operator || ""}
                        onChange={(e) => updateNode("operator", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    >
                        <option>==</option>
                        <option>!=</option>
                        <option>&gt;</option>
                        <option>&lt;</option>
                        <option>&gt;=</option>
                        <option>&lt;=</option>
                    </select>

                    <label>Compare Value</label>
                    <input
                        value={selectedNode.data.value || ""}
                        onChange={(e) => updateNode("value", e.target.value)}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px" }}
                    />
                </>
            )}
        </div>
    );
}

export default Inspector;