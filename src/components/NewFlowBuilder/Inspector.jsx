import FormNode from "./nodes/FormNode";

const inspectorStyles = `
  /* ─── Inspector Shell ─────────────────────────────────────── */
  .inspector {
    width: 320px;
    min-width: 320px;
    background: #ffffff;
    border-left: 1px solid #e5e7eb;
    height: 100%;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
    display: flex;
    flex-direction: column;
  }

  /* ─── Sticky Header ───────────────────────────────────────── */
  .insp-header {
    // position: sticky;
    top: 2;
    background: #ffffff;
    padding: 0px 10px 16px;
    border-bottom: 1px solid #e5e7eb;
    z-index: 10;
  }

  .insp-header-title {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: .04em;
    text-transform: uppercase;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .insp-header-title svg {
    opacity: .7;
  }

  .insp-node-badge {
    display: inline-block;
    background: #f3efff;
    color: #7c5cff;
    font-size: 13px;
    font-weight: 700;
    border-radius: 999px;
    padding: 4px 13px;
    letter-spacing: .01em;
  }

  /* ─── Empty State ─────────────────────────────────────────── */
  .insp-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #94a3b8;
    padding: 40px 20px;
    text-align: center;
  }

  .insp-empty-icon {
    width: 48px;
    height: 48px;
    background: #f3efff;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 4px;
  }

  .insp-empty p {
    font-size: 14px;
    font-weight: 500;
    color: #b0bac5;
    margin: 0;
  }

  /* ─── Body Padding ────────────────────────────────────────── */
  .insp-body {
    padding: 10px 6px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ─── Card Section ────────────────────────────────────────── */
  .card-section {
    background: #fff;
    border: 1px solid #e8ebef;
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 2px 6px rgba(0,0,0,.04);
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: box-shadow .2s ease, border-color .2s ease;
  }

  .card-section:hover {
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(0,0,0,.07);
  }

  .card-section-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--accent);
    margin: 0 0 2px 0;
  }

  /* ─── Labels ──────────────────────────────────────────────── */
  .insp-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 5px;
  }

  /* ─── Inputs / Selects / Textareas ───────────────────────── */
  .insp-input,
  .insp-select {
    width: 100%;
    height: 42px;
    border-radius: 10px;
    border: 1px solid #d8dee6;
    padding: 0 12px;
    font-size: 14px;
    color: #1e293b;
    background: #fafbfc;
    outline: none;
    box-sizing: border-box;
    transition: all .2s ease;
  }

  .insp-input:focus,
  .insp-select:focus {
    border-color: var(--accent);
    background: #fff;
    box-shadow: 0 0 0 3px color-mix(
        in srgb,
        var(--accent) 15%,
        transparent
    );
  }

  .insp-textarea {
    width: 100%;
    min-height: 120px;
    border-radius: 10px;
    border: 1px solid #d8dee6;
    padding: 12px;
    font-size: 14px;
    color: #1e293b;
    background: #fafbfc;
    outline: none;
    box-sizing: border-box;
    resize: vertical;
    font-family: inherit;
    line-height: 1.55;
    transition: all .2s ease;
  }

  .insp-textarea:focus {
    border-color: var(--accent);
    background: #fff;
    box-shadow: 0 0 0 3px color-mix(
        in srgb,
        var(--accent) 15%,
        transparent
    );
  }

  .insp-textarea.mono {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    min-height: 100px;
  }

  /* ─── Buttons ─────────────────────────────────────────────── */
  .insp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 42px;
    padding: 0 18px;
    background: #7c5cff;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s ease;
    white-space: nowrap;
  }

  .insp-btn:hover {
    background: #6a4cff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124,92,255,.3);
  }

  .insp-btn:active {
    transform: translateY(0);
  }

  .insp-btn.full {
    width: 100%;
  }

  .insp-btn.ghost {
    background: var(--accent-bg);
    color: var(--accent);
    border: 1px solid var(--accent);
  }

  .insp-btn.ghost:hover {
    background: #ebe5ff;
    box-shadow: none;
    transform: none;
  }

  .insp-btn.danger {
    background: #ff5b5b;
    color: #fff;
  }

  .insp-btn.danger:hover {
    background: #e84545;
    box-shadow: 0 4px 12px rgba(255,91,91,.3);
  }

  .insp-btn.icon-btn {
    height: 32px;
    width: 32px;
    padding: 0;
    border-radius: 8px;
    background: #ff5b5b;
    color: white;
    font-size: 13px;
    flex-shrink: 0;
  }

  .insp-btn.icon-btn:hover {
    background: #e84545;
    transform: none;
    box-shadow: none;
  }

  .insp-btn.icon-sm {
    height: 30px;
    padding: 0 12px;
    font-size: 12px;
    border-radius: 8px;
  }

  /* ─── Sub-Cards (buttons, rows, fields, headers) ─────────── */
  .sub-card {
    background: #fafafa;
    border: 1px solid #ececec;
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all .2s ease;
  }

  .sub-card:hover {
    border-color: var(--accent);
    background: #fdfdfd;
  }

  .sub-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .sub-card-label {
    font-size: 13px;
    font-weight: 700;
    color: #475569;
  }

  /* ─── Row layouts ─────────────────────────────────────────── */
  .insp-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .insp-row .insp-input {
    flex: 1;
  }

  /* ─── Field group ─────────────────────────────────────────── */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  /* ─── Divider ─────────────────────────────────────────────── */
  .insp-divider {
    height: 1px;
    background: #f1f3f5;
    margin: 4px 0;
  }

  /* ─── File input ──────────────────────────────────────────── */
  .insp-file-input {
    width: 100%;
    font-size: 13px;
    color: #475569;
    padding: 8px 0;
    cursor: pointer;
  }

  .insp-file-hint {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
  }

  /* ─── Number input ────────────────────────────────────────── */
  .insp-input[type="number"] {
    -moz-appearance: textfield;
  }
  .insp-input[type="number"]::-webkit-inner-spin-button,
  .insp-input[type="number"]::-webkit-outer-spin-button {
    opacity: 0.4;
  }
`;

const NODE_COLORS = {
    startNode: {
        border: "#28a745",
        bg: "#f0fff4",
    },

    waTemplateNode: {
        border: "#8b5cf6",
        bg: "#f8f4ff",
    },

    waButtonsNode: {
        border: "#3b82f6",
        bg: "#f8fbff",
    },

    waListNode: {
        border: "#22c55e",
        bg: "#f0fdf4",
    },

    waMediaNode: {
        border: "#ea580c",
        bg: "#fad5ba",
    },

    textNode: {
        border: "#ec4899",
        bg: "#fdf2f8",
    },

    formNode: {
        border: "#059669",
        bg: "#ecfdf5",
    },

    inputNode: {
        border: "#3b82f6",
        bg: "#f8fbff",
    },

    conditionNode: {
        border: "#f97316",
        bg: "#fff7ed",
    },

    delayNode: {
        border: "#a16207",
        bg: "#fefce8",
    },

    apiNode: {
        border: "#f59e0b",
        bg: "#fffbeb",
    },

    endSessionNode: {
        border: "#dc2626",
        bg: "#f5a1a1",
    },

    endFlowNode: {
        border: "#843333",
        bg: "#fdf2f2",
    },
    flowTransferNode: {
    border: "#7c3aed",
    bg: "#f3e8ff",
},
};

function Inspector({ selectedNode, setNodes, setSelectedNode, flowsList }) {

    if (!selectedNode) {
        return (
            <>
                <style>{inspectorStyles}</style>
                <div className="inspector">
                    <div className="insp-header">
                        <div className="insp-header-title">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" /></svg>
                            Configuration
                        </div>
                    </div>
                    <div className="insp-empty">
                        <div className="insp-empty-icon">🎛️</div>
                        <p>Select a node to configure it</p>
                    </div>
                </div>
            </>
        );
    }

    const accent =
        NODE_COLORS[selectedNode?.type] || {
            border: "#8b5cf6",
            bg: "#f8f4ff",
        };

    const updateNode = (field, value) => {
        setNodes((prev) =>
            prev.map((node) =>
                node.id === selectedNode.id
                    ? { ...node, data: { ...node.data, [field]: value } }
                    : node
            )
        );
        setSelectedNode((prev) => ({
            ...prev,
            data: { ...prev.data, [field]: value },
        }));
    };

    const updateMessage = (value) => updateNode("message", value);

    return (
        <>
            <style>{inspectorStyles}</style>
            <div
                className="inspector"
                style={{
                    "--accent": accent.border,
                    "--accent-bg": accent.bg,
                }}
            >

                {/* ── Sticky Header ── */}
                <div className="insp-header">
                    <div className="insp-header-title">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" /></svg>
                        Configuration
                    </div>
                    <span
                        className="insp-node-badge"
                        style={{
                            background: "var(--accent-bg)",
                            color: "var(--accent)",
                        }}
                    >
                        {selectedNode.data.label}
                    </span>
                </div>

                {/* ── Body ── */}
                <div className="insp-body">

                    {/* Start Node (placeholder — currently no fields) */}
                    {selectedNode?.type === "startNode" && (
                        <></>
                    )}

                    {/* ── Text Node ── */}
                    {selectedNode.type === "textNode" && (
                        <div className="card-section">
                            <p className="card-section-title">Message</p>
                            <div className="field-group">
                                <label className="insp-label">Content</label>
                                <textarea
                                    className="insp-textarea"
                                    rows="5"
                                    value={selectedNode.data.message || ""}
                                    onChange={(e) => updateMessage(e.target.value)}
                                    placeholder="Type your message…"
                                />
                            </div>
                        </div>
                    )}

                    {/* ── WA Buttons ── */}
                    {selectedNode.data.label === "WA Buttons" && (
                        <div className="card-section">
                            <p className="card-section-title">Interactive Buttons</p>

                            <div className="field-group">
                                <label className="insp-label">Prompt</label>
                                <input
                                    type="text"
                                    className="insp-input"
                                    value={selectedNode.data.prompt || ""}
                                    placeholder="What would you like to do?"
                                    onChange={(e) => updateNode("prompt", e.target.value)}
                                />
                            </div>

                            <div className="insp-divider" />

                            <label className="insp-label">Buttons</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {(selectedNode.data.buttons || []).map((button, index) => (
                                    <div key={index} className="insp-row">
                                        <input
                                            className="insp-input"
                                            value={button}
                                            placeholder={`Button ${index + 1}`}
                                            onChange={(e) => {
                                                const updated = [...(selectedNode.data.buttons || [])];
                                                updated[index] = e.target.value;
                                                updateNode("buttons", updated);
                                            }}
                                        />
                                        <button
                                            className="insp-btn icon-btn"
                                            onClick={() => {
                                                const updated = selectedNode.data.buttons.filter((_, i) => i !== index);
                                                updateNode("buttons", updated);
                                            }}
                                        >✕</button>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="insp-btn ghost full"
                                onClick={() => {
                                    const updated = [...(selectedNode.data.buttons || []), ""];
                                    updateNode("buttons", updated);
                                }}
                            >+ Add Button</button>
                        </div>
                    )}

                    {/* ── WA Template Node ── */}
                    {selectedNode?.type === "waTemplateNode" && (
                        <div className="card-section">
                            <p className="card-section-title">Template</p>

                            {/* Header Type */}
                            <div className="field-group">
                                <label className="insp-label">Header Type</label>
                                <select
                                    className="insp-select"
                                    value={selectedNode.data.headerType || "none"}
                                    onChange={(e) => updateNode("headerType", e.target.value)}
                                >
                                    <option value="none">None</option>
                                    <option value="text">Text</option>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                    <option value="document">Document</option>
                                </select>
                            </div>

                            {selectedNode.data.headerType && selectedNode.data.headerType !== "none" && (
                                <div className="field-group">
                                    <label className="insp-label">
                                        Header {selectedNode.data.headerType === "text" ? "Text" : "URL"}
                                    </label>
                                    <input
                                        type="text"
                                        className="insp-input"
                                        value={selectedNode.data.headerValue || ""}
                                        placeholder={selectedNode.data.headerType === "text" ? "Enter header text…" : "https://…"}
                                        onChange={(e) => updateNode("headerValue", e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="field-group">
                                <label className="insp-label">Template Body</label>
                                <textarea
                                    className="insp-textarea"
                                    value={selectedNode.data.bodyText || ""}
                                    placeholder="Enter WhatsApp template body…"
                                    onChange={(e) => updateNode("bodyText", e.target.value)}
                                />
                            </div>

                            <div className="insp-divider" />

                            <label className="insp-label">Template Buttons <span style={{ fontWeight: 400, color: "#94a3b8" }}>(max 3)</span></label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {(selectedNode.data.templateButtons || []).map((btn, index) => (
                                    <div key={index} className="sub-card">
                                        <div className="sub-card-header">
                                            <span className="sub-card-label">Button {index + 1}</span>
                                            <button
                                                className="insp-btn icon-btn"
                                                onClick={() => {
                                                    const updated = selectedNode.data.templateButtons.filter((_, i) => i !== index);
                                                    updateNode("templateButtons", updated);
                                                }}
                                            >✕</button>
                                        </div>

                                        <div className="field-group">
                                            <label className="insp-label">Type</label>
                                            <select
                                                className="insp-select"
                                                value={btn.type || "quick_reply"}
                                                onChange={(e) => {
                                                    const updated = [...selectedNode.data.templateButtons];
                                                    updated[index] = { ...updated[index], type: e.target.value };
                                                    updateNode("templateButtons", updated);
                                                }}
                                            >
                                                <option value="quick_reply">Quick Reply</option>
                                                <option value="url">URL</option>
                                                <option value="phone_number">Phone Number</option>
                                            </select>
                                        </div>

                                        <div className="field-group">
                                            <label className="insp-label">Text</label>
                                            <input
                                                type="text"
                                                className="insp-input"
                                                value={btn.text || ""}
                                                placeholder="Button label"
                                                onChange={(e) => {
                                                    const updated = [...selectedNode.data.templateButtons];
                                                    updated[index] = { ...updated[index], text: e.target.value };
                                                    updateNode("templateButtons", updated);
                                                }}
                                            />
                                        </div>

                                        {btn.type === "url" && (
                                            <div className="field-group">
                                                <label className="insp-label">URL</label>
                                                <input
                                                    type="text"
                                                    className="insp-input"
                                                    value={btn.url || ""}
                                                    placeholder="https://example.com"
                                                    onChange={(e) => {
                                                        const updated = [...selectedNode.data.templateButtons];
                                                        updated[index] = { ...updated[index], url: e.target.value };
                                                        updateNode("templateButtons", updated);
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {btn.type === "phone_number" && (
                                            <div className="field-group">
                                                <label className="insp-label">Phone Number</label>
                                                <input
                                                    type="text"
                                                    className="insp-input"
                                                    value={btn.phone || ""}
                                                    placeholder="+1234567890"
                                                    onChange={(e) => {
                                                        const updated = [...selectedNode.data.templateButtons];
                                                        updated[index] = { ...updated[index], phone: e.target.value };
                                                        updateNode("templateButtons", updated);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                className="insp-btn ghost full"
                                onClick={() => {
                                    if ((selectedNode.data.templateButtons || []).length >= 3) return;
                                    const updated = [...(selectedNode.data.templateButtons || []), { type: "quick_reply", text: "" }];
                                    updateNode("templateButtons", updated);
                                }}
                            >+ Add Button</button>
                        </div>
                    )}

                    {/* ── WA List Node ── */}
                    {selectedNode?.type === "waListNode" && (
                        <div className="card-section">
                            <p className="card-section-title">List Message</p>

                            <div className="field-group">
                                <label className="insp-label">Body</label>
                                <textarea
                                    className="insp-textarea"
                                    rows="3"
                                    value={selectedNode.data.body || ""}
                                    placeholder="Please pick an option"
                                    onChange={(e) => updateNode("body", e.target.value)}
                                    style={{ minHeight: "80px" }}
                                />
                            </div>

                            <div className="field-group">
                                <label className="insp-label">Button Text <span style={{ fontWeight: 400, color: "#94a3b8" }}>(max 20 chars)</span></label>
                                <input
                                    className="insp-input"
                                    value={selectedNode.data.buttonText || ""}
                                    maxLength={20}
                                    placeholder="View options"
                                    onChange={(e) => updateNode("buttonText", e.target.value)}
                                />
                            </div>

                            <div className="insp-divider" />

                            <label className="insp-label">Sections</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {(selectedNode.data.sections || []).map((section, sectionIndex) => (
                                    <div key={sectionIndex} className="sub-card">
                                        <div className="sub-card-header">
                                            <span className="sub-card-label">Section {sectionIndex + 1}</span>
                                            <button
                                                className="insp-btn icon-btn"
                                                onClick={() => {
                                                    const updated = selectedNode.data.sections.filter((_, i) => i !== sectionIndex);
                                                    updateNode("sections", updated);
                                                }}
                                            >✕</button>
                                        </div>

                                        <div className="field-group">
                                            <label className="insp-label">Title</label>
                                            <input
                                                className="insp-input"
                                                value={section.title || ""}
                                                placeholder="Section title"
                                                onChange={(e) => {
                                                    const updated = [...selectedNode.data.sections];
                                                    updated[sectionIndex].title = e.target.value;
                                                    updateNode("sections", updated);
                                                }}
                                            />
                                        </div>

                                        <label className="insp-label">Rows</label>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            {(section.rows || []).map((row, rowIndex) => (
                                                <div key={rowIndex} className="insp-row">
                                                    <input
                                                        className="insp-input"
                                                        value={row}
                                                        placeholder={`Option ${rowIndex + 1}`}
                                                        onChange={(e) => {
                                                            const updated = [...selectedNode.data.sections];
                                                            updated[sectionIndex].rows[rowIndex] = e.target.value;
                                                            updateNode("sections", updated);
                                                        }}
                                                    />
                                                    <button
                                                        className="insp-btn icon-btn"
                                                        onClick={() => {
                                                            const updated = [...selectedNode.data.sections];
                                                            updated[sectionIndex].rows = updated[sectionIndex].rows.filter((_, i) => i !== rowIndex);
                                                            updateNode("sections", updated);
                                                        }}
                                                    >✕</button>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            className="insp-btn ghost icon-sm"
                                            style={{ alignSelf: "flex-start", marginTop: "4px" }}
                                            onClick={() => {
                                                if ((section.rows || []).length >= 10) return;
                                                const updated = [...selectedNode.data.sections];
                                                updated[sectionIndex].rows = [...(updated[sectionIndex].rows || []), "New Option"];
                                                updateNode("sections", updated);
                                            }}
                                        >+ Add Row</button>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="insp-btn ghost full"
                                onClick={() => {
                                    const updated = [...(selectedNode.data.sections || []), { title: "New Section", rows: [] }];
                                    updateNode("sections", updated);
                                }}
                            >+ Add Section</button>
                        </div>
                    )}

                    {/* ── API Node ── */}
                    {selectedNode?.type === "apiNode" && (
                        <div className="card-section">
                            <p className="card-section-title">API Request</p>

                            <div className="field-group">
                                <label className="insp-label">Method</label>
                                <select
                                    className="insp-select"
                                    value={selectedNode.data.method || "GET"}
                                    onChange={(e) => updateNode("method", e.target.value)}
                                >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                </select>
                            </div>

                            <div className="field-group">
                                <label className="insp-label">URL</label>
                                <input
                                    type="text"
                                    className="insp-input"
                                    value={selectedNode.data.url || ""}
                                    placeholder="https://api.example.com/endpoint"
                                    onChange={(e) => updateNode("url", e.target.value)}
                                />
                            </div>

                            <div className="field-group">
                                <label className="insp-label">Body Template <span style={{ fontWeight: 400, color: "#94a3b8" }}>(JSON, supports {"{{var}}"})</span></label>
                                <textarea
                                    className="insp-textarea mono"
                                    rows={5}
                                    value={selectedNode.data.bodyTemplate || ""}
                                    placeholder={'{"name": "{{user_name}}", "age": {{age}}}'}
                                    onChange={(e) => updateNode("bodyTemplate", e.target.value)}
                                />
                            </div>

                            <div className="field-group">
                                <label className="insp-label">Save response to ctx as</label>
                                <input
                                    type="text"
                                    className="insp-input"
                                    value={selectedNode.data.responseVariable || ""}
                                    placeholder="api_response"
                                    onChange={(e) => updateNode("responseVariable", e.target.value)}
                                />
                            </div>

                            <div className="insp-divider" />

                            <label className="insp-label">Headers</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {(selectedNode.data.headers || []).map((header, index) => (
                                    <div key={index} className="insp-row">
                                        <input
                                            type="text"
                                            className="insp-input"
                                            placeholder="Key"
                                            value={header.key || ""}
                                            onChange={(e) => {
                                                const updated = [...(selectedNode.data.headers || [])];
                                                updated[index] = { ...updated[index], key: e.target.value };
                                                updateNode("headers", updated);
                                            }}
                                        />
                                        <input
                                            type="text"
                                            className="insp-input"
                                            placeholder="Value"
                                            value={header.value || ""}
                                            onChange={(e) => {
                                                const updated = [...(selectedNode.data.headers || [])];
                                                updated[index] = { ...updated[index], value: e.target.value };
                                                updateNode("headers", updated);
                                            }}
                                        />
                                        <button
                                            className="insp-btn icon-btn"
                                            onClick={() => {
                                                const updated = (selectedNode.data.headers || []).filter((_, i) => i !== index);
                                                updateNode("headers", updated);
                                            }}
                                        >×</button>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="insp-btn ghost"
                                style={{ alignSelf: "flex-start" }}
                                onClick={() => {
                                    const updated = [...(selectedNode.data.headers || []), { key: "", value: "" }];
                                    updateNode("headers", updated);
                                }}
                            >+ Add Header</button>
                        </div>
                    )}

                    {/* ── Delay Node ── */}
                    {selectedNode?.type === "delayNode" && (
                        <div className="card-section">
                            <p className="card-section-title">Delay • {selectedNode.id}</p>

                            <div className="field-group">
                                <label className="insp-label">Duration</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="insp-input"
                                    value={selectedNode.data.delayValue ?? 1}
                                    onChange={(e) => updateNode("delayValue", Number(e.target.value))}
                                />
                            </div>

                            <div className="field-group">
                                <label className="insp-label">Unit</label>
                                <select
                                    className="insp-select"
                                    value={selectedNode.data.delayUnit || "minutes"}
                                    onChange={(e) => updateNode("delayUnit", e.target.value)}
                                >
                                    <option value="seconds">Seconds</option>
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ── Input Node ── */}
                    {selectedNode.type === "inputNode" && (
                        <div className="card-section">
                            <p className="card-section-title">User Input</p>

                            <div className="field-group">
                                <label className="insp-label">Variable Name</label>
                                <input
                                    className="insp-input"
                                    value={selectedNode.data.variableName || ""}
                                    placeholder="e.g. user_name"
                                    onChange={(e) => updateNode("variableName", e.target.value)}
                                />
                            </div>

                            <div className="field-group">
                                <label className="insp-label">Placeholder</label>
                                <input
                                    className="insp-input"
                                    value={selectedNode.data.placeholder || ""}
                                    placeholder="Type here…"
                                    onChange={(e) => updateNode("placeholder", e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── WA Media Node ── */}
                    {selectedNode?.type === "waMediaNode" && (
                        <div className="card-section">
                            <p className="card-section-title">Media</p>

                            <div className="field-group">
                                <label className="insp-label">Media Type</label>
                                <select
                                    className="insp-select"
                                    value={selectedNode.data.mediaType || ""}
                                    onChange={(e) => updateNode("mediaType", e.target.value)}
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                    <option value="document">Document</option>
                                    <option value="audio">Audio</option>
                                    <option value="sticker">Sticker</option>
                                </select>
                            </div>

                            <div className="field-group">
                                <label className="insp-label">Media Source</label>
                                <select
                                    className="insp-select"
                                    value={selectedNode.data.mediaSource || "url"}
                                    onChange={(e) => updateNode("mediaSource", e.target.value)}
                                >
                                    <option value="url">URL</option>
                                    <option value="upload">Upload</option>
                                </select>
                            </div>

                            {selectedNode.data.mediaSource === "url" ? (
                                <div className="field-group">
                                    <label className="insp-label">URL</label>
                                    <input
                                        type="text"
                                        className="insp-input"
                                        value={selectedNode.data.mediaUrl || ""}
                                        placeholder="https://…"
                                        onChange={(e) => updateNode("mediaUrl", e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="field-group">
                                    <label className="insp-label">Upload File</label>
                                    <input
                                        type="file"
                                        className="insp-file-input"
                                        accept={
                                            selectedNode.data.mediaType === "image" ? "image/*"
                                                : selectedNode.data.mediaType === "video" ? "video/*"
                                                    : selectedNode.data.mediaType === "audio" ? "audio/*"
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
                                    />
                                    {selectedNode.data.uploadedFileName && (
                                        <p className="insp-file-hint">📎 {selectedNode.data.uploadedFileName}</p>
                                    )}
                                </div>
                            )}

                            <div className="field-group">
                                <label className="insp-label">Caption</label>
                                <textarea
                                    className="insp-textarea"
                                    value={selectedNode.data.caption || ""}
                                    placeholder="Optional caption…"
                                    onChange={(e) => updateNode("caption", e.target.value)}
                                    style={{ minHeight: "80px" }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Form Node ── */}
                    {selectedNode?.type === "formNode" && (
                        <div className="card-section">
                            <p className="card-section-title">Form</p>

                            <div className="field-group">
                                <label className="insp-label">Form Title</label>
                                <input
                                    className="insp-input"
                                    value={selectedNode.data.formTitle || ""}
                                    placeholder="Doctor Details"
                                    onChange={(e) => updateNode("formTitle", e.target.value)}
                                />
                            </div>

                            <div className="insp-divider" />

                            <label className="insp-label">Form Fields</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {(selectedNode.data.formFields || []).map((field, index) => (
                                    <div key={index} className="sub-card">
                                        <div className="field-group">
                                            <label className="insp-label">Question</label>
                                            <input
                                                className="insp-input"
                                                value={field.label}
                                                placeholder="Question"
                                                onChange={(e) => {
                                                    const updated = [...selectedNode.data.formFields];
                                                    updated[index].label = e.target.value;
                                                    updateNode("formFields", updated);
                                                }}
                                            />
                                        </div>

                                        <div className="field-group">
                                            <label className="insp-label">Field Type</label>
                                            <select
                                                className="insp-select"
                                                value={field.type}
                                                onChange={(e) => {
                                                    const updated = [...selectedNode.data.formFields];
                                                    updated[index].type = e.target.value;
                                                    if (e.target.value === "select" && !updated[index].options) {
                                                        updated[index].options = [];
                                                    }
                                                    updateNode("formFields", updated);
                                                }}
                                            >
                                                <option value="text">Text</option>
                                                <option value="phone">Phone</option>
                                                <option value="email">Email</option>
                                                <option value="select">Dropdown</option>
                                            </select>
                                        </div>

                                        <div className="field-group">
                                            <label className="insp-label">Variable</label>
                                            <input
                                                className="insp-input"
                                                value={field.variable}
                                                placeholder="variable_name"
                                                onChange={(e) => {
                                                    const updated = [...selectedNode.data.formFields];
                                                    updated[index].variable = e.target.value;
                                                    updateNode("formFields", updated);
                                                }}
                                            />
                                        </div>

                                        {field.type === "select" && (
                                            <>
                                                <label className="insp-label">Dropdown Options</label>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                    {(field.options || []).map((option, optionIndex) => (
                                                        <div key={optionIndex} className="insp-row">
                                                            <input
                                                                className="insp-input"
                                                                value={option}
                                                                placeholder={`Option ${optionIndex + 1}`}
                                                                onChange={(e) => {
                                                                    const updated = [...selectedNode.data.formFields];
                                                                    updated[index].options[optionIndex] = e.target.value;
                                                                    updateNode("formFields", updated);
                                                                }}
                                                            />
                                                            <button
                                                                className="insp-btn icon-btn"
                                                                onClick={() => {
                                                                    const updated = [...selectedNode.data.formFields];
                                                                    updated[index].options = updated[index].options.filter((_, i) => i !== optionIndex);
                                                                    updateNode("formFields", updated);
                                                                }}
                                                            >✕</button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    className="insp-btn ghost icon-sm"
                                                    style={{ alignSelf: "flex-start", marginTop: "4px" }}
                                                    onClick={() => {
                                                        const updated = [...selectedNode.data.formFields];
                                                        updated[index].options = [...(updated[index].options || []), ""];
                                                        updateNode("formFields", updated);
                                                    }}
                                                >+ Add Option</button>
                                            </>
                                        )}

                                        <button
                                            className="insp-btn danger icon-sm"
                                            style={{ alignSelf: "flex-start", marginTop: "6px" }}
                                            onClick={() => {
                                                const updated = selectedNode.data.formFields.filter((_, i) => i !== index);
                                                updateNode("formFields", updated);
                                            }}
                                        >Delete Field</button>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="insp-btn ghost full"
                                onClick={() => {
                                    updateNode("formFields", [
                                        ...(selectedNode.data.formFields || []),
                                        { label: "", type: "text", variable: "", required: false, options: [] },
                                    ]);
                                }}
                            >+ Add Field</button>
                        </div>
                    )}

                    {/* ── Condition Node ── */}
                    {selectedNode?.type === "conditionNode" && (
                        <div className="card-section">
                            <p className="card-section-title">Condition</p>

                            <div className="field-group">
                                <label className="insp-label">Variable</label>
                                <input
                                    className="insp-input"
                                    value={selectedNode.data.variable || ""}
                                    placeholder="e.g. user_age"
                                    onChange={(e) => updateNode("variable", e.target.value)}
                                />
                            </div>

                            <div className="field-group">
                                <label className="insp-label">Operator</label>
                                <select
                                    className="insp-select"
                                    value={selectedNode.data.operator || ""}
                                    onChange={(e) => updateNode("operator", e.target.value)}
                                >
                                    <option>==</option>
                                    <option>!=</option>
                                    <option>&gt;</option>
                                    <option>&lt;</option>
                                    <option>&gt;=</option>
                                    <option>&lt;=</option>
                                </select>
                            </div>

                            <div className="field-group">
                                <label className="insp-label">Compare Value</label>
                                <input
                                    className="insp-input"
                                    value={selectedNode.data.value || ""}
                                    placeholder="e.g. 18"
                                    onChange={(e) => updateNode("value", e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    {selectedNode?.type === "flowTransferNode" && (
  <div className="card-section">
    <p className="card-section-title">
      Flow Transfer
    </p>

    <div className="field-group">
      <label className="insp-label">
        Target Flow ID
      </label>

      <select
  className="insp-select"
  value={selectedNode.data.targetFlowId || ""}
  onChange={(e) => {
    const selectedFlow = flowsList.find(
      (flow) => flow._id === e.target.value
    );

    updateNode(
      "targetFlowId",
      selectedFlow?._id || ""
    );

    updateNode(
      "targetFlowName",
      selectedFlow?.name || ""
    );
  }}
>
  <option value="">
    Select Target Flow
  </option>

  {flowsList
    ?.filter(
      (flow) =>
        flow.name !== selectedNode.data.flowName
    )
    .map((flow) => (
      <option
        key={flow._id}
        value={flow._id}
      >
        {flow.name}
      </option>
    ))}
</select>
    </div>
  </div>
)}
                </div>
            </div>
        </>
    );
}

export default Inspector;