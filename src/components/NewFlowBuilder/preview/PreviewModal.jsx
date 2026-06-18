import { useEffect, useState, useRef } from "react";

function PreviewModal({ isOpen, onClose, nodes, edges }) {
    const [messages, setMessages] = useState([]);
    const [currentNode, setCurrentNode] = useState(null);
    const [variables, setVariables] = useState({});
    const [inputValue, setInputValue] = useState("");
    const [activeList, setActiveList] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDelaying, setIsDelaying] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    const [activeForm, setActiveForm] = useState(null);
    const [formValues, setFormValues] = useState({});

    // ---------- helper: move to next node with optional source handle ----------
    const moveToNextNode = (fromNode, sourceHandle = null) => {
        const edge = edges.find((e) => {
            if (e.source !== fromNode.id) return false;
            if (sourceHandle !== null) return e.sourceHandle === sourceHandle;
            return true;
        });
        console.log("MOVE FROM:", fromNode.data.label, fromNode.id);
        console.log("AVAILABLE EDGES:", edges.filter((e) => e.source === fromNode.id));
        if (!edge) return;
        executeNode(edge.target);
    };

    // ---------- execute delay (cap at 5 seconds for preview) ----------
    const executeDelay = (delayNode) => {
        setIsDelaying(true);
        const { delayValue, delayUnit } = delayNode.data;
        const value = delayValue || 5;
        const unit = delayUnit || "seconds";
        let delayMs = value * 1000;
        if (unit === "minutes") delayMs = value * 60 * 1000;
        else if (unit === "hours") delayMs = value * 60 * 60 * 1000;
        else if (unit === "days") delayMs = value * 24 * 60 * 60 * 1000;
        delayMs = Math.min(delayMs, 5000);
        setTimeout(() => {
            setIsDelaying(false);
            moveToNextNode(delayNode);
        }, delayMs);
    };

    // ---------- execute API call (delay moveToNextNode) ----------
    const executeApiCall = async (apiNode) => {
        setIsLoading(true);
        const { method = "GET", url = "", bodyTemplate = "", responseVariable = "api" } = apiNode.data;
        try {
            const processedUrl = replaceVariables(url);
            let processedBody = null;
            if (method !== "GET" && bodyTemplate) {
                const replaced = replaceVariables(bodyTemplate);
                try {
                    processedBody = JSON.parse(replaced);
                } catch {
                    processedBody = replaced;
                }
            }
            const fetchHeaders = { "Content-Type": "application/json" };
            (apiNode.data.headers || []).forEach((header) => {
                if (header.key && header.value) {
                    fetchHeaders[replaceVariables(header.key)] = replaceVariables(header.value);
                }
            });
            const fetchOptions = { method, headers: fetchHeaders };
            if (processedBody !== null) {
                fetchOptions.body = JSON.stringify(processedBody);
            }

            console.log("========== API DEBUG ==========");
            console.log("METHOD:", method);
            console.log("URL:", processedUrl);
            console.log("BODY:", processedBody);
            console.log("HEADERS:", fetchHeaders);

            const response = await fetch(processedUrl, fetchOptions);
            let responseData;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            console.log("API RESPONSE:", responseData);
            console.log("RESPONSE VARIABLE:", responseVariable);

            if (responseVariable) {
                setVariables((prev) => ({
                    ...prev,
                    [responseVariable]: responseData,
                }));
            }

            setTimeout(() => {
                moveToNextNode(apiNode, "success");
            }, 100);
        } catch (error) {
            console.error("API ERROR:", error);
            setTimeout(() => {
                moveToNextNode(apiNode, "error");
            }, 100);
        } finally {
            setIsLoading(false);
        }
    };

    // ---------- evaluate condition ----------
    const evaluateCondition = (conditionNode) => {
        let varName = conditionNode.data.variable || "";
        varName = varName.replace(/[{}]/g, "").trim();
        let compareValue = conditionNode.data.value || "";
        let actualCompareValue = compareValue;
        if (typeof compareValue === "string" && compareValue.includes("{{")) {
            const nestedVar = compareValue.replace(/[{}]/g, "").trim();
            actualCompareValue = variables[nestedVar] !== undefined ? variables[nestedVar] : compareValue;
        }
        const operator = conditionNode.data.operator || "==";

        const getNestedValue = (obj, path) => {
            return path.split(".").reduce((acc, key) => acc?.[key], obj);
        };

        console.log("FULL VARIABLES:", variables);
        console.log("CONDITION VARIABLE:", varName);
        const varValue = getNestedValue(variables, varName);
        console.log("RESOLVED VALUE:", varValue);
        console.log("========== CONDITION DEBUG ==========");
        console.log("Variable Name:", varName);
        console.log("Variable Value:", varValue);
        console.log("Compare Value:", actualCompareValue);
        console.log("Operator:", operator);

        let result = false;
        if (varValue === undefined || varValue === null || varValue === "") {
            result = false;
        } else {
            const numVarValue = Number(varValue);
            const numCompareValue = Number(actualCompareValue);
            const isNumericVar = !isNaN(numVarValue) && varValue !== "";
            const isNumericCompare = !isNaN(numCompareValue) && actualCompareValue !== "";
            if (isNumericVar && isNumericCompare) {
                switch (operator) {
                    case "==":
                        result = numVarValue === numCompareValue;
                        break;
                    case "!=":
                        result = numVarValue !== numCompareValue;
                        break;
                    case ">":
                        result = numVarValue > numCompareValue;
                        break;
                    case "<":
                        result = numVarValue < numCompareValue;
                        break;
                    case ">=":
                        result = numVarValue >= numCompareValue;
                        break;
                    case "<=":
                        result = numVarValue <= numCompareValue;
                        break;
                    default:
                        result = false;
                }
            } else {
                const strVarValue = String(varValue).trim();
                const strCompareValue = String(actualCompareValue).trim();
                switch (operator) {
                    case "==":
                        result = strVarValue === strCompareValue;
                        break;
                    case "!=":
                        result = strVarValue !== strCompareValue;
                        break;
                    default:
                        result = false;
                }
            }
        }

        console.log("FINAL RESULT:", result);
        const targetEdge = edges.find(
            (e) => e.source === conditionNode.id && e.sourceHandle === (result ? "true" : "false")
        );
        if (!targetEdge) return;
        const nextNode = nodes.find((node) => node.id === targetEdge.target);
        if (!nextNode) return;
        setTimeout(() => {
            setMessages((prev) => [...prev, { type: "bot", node: nextNode }]);
            setCurrentNode(nextNode);
        }, 500);
    };

    // ---------- execute end session ----------
    const executeEndSession = (endNode) => {
        setMessages((prev) => [
            ...prev,
            { type: "bot", text: endNode.data.message || "Thank You!" },
        ]);
        setCurrentNode(null);
        setTimeout(() => {
            setVariables({});
            const startNode = nodes.find((node) => node.type === "startNode");
            if (startNode) {
                const startEdge = edges.find((edge) => edge.source === startNode.id);
                if (startEdge) {
                    const nextNode = nodes.find((node) => node.id === startEdge.target);
                    if (nextNode) {
                        setMessages((prev) => [...prev, { type: "bot", node: nextNode }]);
                        setCurrentNode(nextNode);
                    }
                }
            }
        }, 2500);
    };

    // ---------- handle template button click ----------
    const handleTemplateButtonClick = (button, buttonIndex) => {
        if (!currentNode) return;
        setMessages((prev) => [...prev, { type: "user", text: button.text }]);
        const edge = edges.find(
            (e) => e.source === currentNode.id && e.sourceHandle === `button-${buttonIndex}`
        );
        if (!edge) return;
        const nextNode = nodes.find((node) => node.id === edge.target);
        if (!nextNode) return;
        setTimeout(() => {
            setMessages((prev) => [...prev, { type: "bot", node: nextNode }]);
            setCurrentNode(nextNode);
        }, 500);
    };

    // ---------- open list options modal ----------
    const openListOptions = (message) => {
        setActiveList(message);
    };

    // ---------- execute a node by ID ----------
    const executeNode = (nodeId) => {
        const nextNode = nodes.find((node) => node.id === nodeId);
        if (!nextNode) return;
        setTimeout(() => {
            const interactiveTypes = ["waListNode", "waButtonsNode", "inputNode", "formNode"];
            if (!interactiveTypes.includes(nextNode.type)) {
                setMessages((prev) => [...prev, { type: "bot", node: nextNode }]);
            }
            setCurrentNode(nextNode);
        }, 500);
    };

    // ---------- handle list row selection from modal ----------
    const handleListRowClickModal = (nodeId, rowHandle, rowText) => {
        addUserMessage(rowText);
        setActiveList(null);
        let edge = edges.find((e) => e.source === nodeId && e.sourceHandle === rowHandle);
        if (!edge) {
            const nodeEdges = edges.filter((e) => e.source === nodeId);
            const handleIndexMatch = rowHandle.match(/row-(\d+)/);
            if (handleIndexMatch) {
                const targetIndex = parseInt(handleIndexMatch[1], 10);
                const sortedEdges = [...nodeEdges].sort((a, b) => {
                    const aNum = parseInt((a.sourceHandle || "").replace(/\D/g, ""), 10) || 0;
                    const bNum = parseInt((b.sourceHandle || "").replace(/\D/g, ""), 10) || 0;
                    return aNum - bNum;
                });
                edge = sortedEdges[targetIndex];
            }
        }
        if (!edge) {
            console.error("❌ No edge found for nodeId:", nodeId, "handle:", rowHandle);
            return;
        }
        executeNode(edge.target);
    };

    // ---------- handle list row click (inline picker) ----------
    const handleListRowClick = (sectionIndex, rowIndex, rowText) => {
        if (!currentNode) return;
        setActiveList(null);
        setMessages((prev) => [...prev, { type: "user", text: rowText }]);
        const edge = edges.find(
            (e) =>
                e.source === currentNode.id &&
                e.sourceHandle === `list-${sectionIndex}-${rowIndex}`
        );
        if (!edge) return;
        const nextNode = nodes.find((node) => node.id === edge.target);
        if (!nextNode) return;
        setTimeout(() => {
            setMessages((prev) => [...prev, { type: "bot", node: nextNode }]);
            setCurrentNode(nextNode);
        }, 500);
    };

    const addUserMessage = (text) => {
        setMessages((prev) => [...prev, { type: "user", text: text }]);
    };

    const addBotMessage = (message) => {
        if (message.type === "waList") {
            setMessages((prev) => [
                ...prev,
                {
                    type: "waList",
                    body: message.body,
                    buttonText: message.buttonText,
                    sections: message.sections,
                    nodeId: message.nodeId,
                },
            ]);
        } else {
            setMessages((prev) => [
                ...prev,
                { type: "bot", node: { data: message, type: message.type, id: message.nodeId } },
            ]);
        }
    };

    // ---------- effects ----------
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, activeList, activeForm]);

    useEffect(() => {
        if (currentNode?.type === "inputNode" && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentNode]);

    useEffect(() => {
        if (!currentNode) return;

        if (currentNode.type === "startNode") {
            moveToNextNode(currentNode);
            return;
        }

        if (currentNode.type === "endFlowNode") {
            setCurrentNode(null);
            return;
        }

        if (currentNode.type === "conditionNode") {
            const timer = setTimeout(() => evaluateCondition(currentNode), 800);
            return () => clearTimeout(timer);
        }
        if (currentNode.type === "waMediaNode") {
            const timer = setTimeout(() => moveToNextNode(currentNode), 2000);
            return () => clearTimeout(timer);
        }
        if (currentNode.type === "apiNode") {
            executeApiCall(currentNode);
            return;
        }
        if (currentNode.type === "delayNode") {
            const timer = setTimeout(() => executeDelay(currentNode), 300);
            return () => clearTimeout(timer);
        }
        if (currentNode.type === "endSessionNode") {
            const timer = setTimeout(() => executeEndSession(currentNode), 500);
            return () => clearTimeout(timer);
        }
        // ✅ FIX: formNode just pushes a chat message with Open Form button
        // Do NOT call setActiveForm here — user must click Open Form button first
        if (currentNode.type === "formNode") {
            setMessages((prev) => [
                ...prev,
                { type: "form", node: currentNode },
            ]);
            return;
        }
        if (currentNode.type === "waTemplateNode") {
            return;
        }
        if (currentNode.type === "waListNode") {
            const rawSections = currentNode.data.sections || [];
            let globalIndex = 0;
            const sectionsWithHandles = rawSections.map((section) => ({
                ...section,
                rows: (section.rows || []).map((row) => ({
                    text: typeof row === "string" ? row : row.text || row,
                    handleId: `row-${globalIndex++}`,
                })),
            }));
            addBotMessage({
                type: "waList",
                body: currentNode.data.body,
                buttonText: currentNode.data.buttonText,
                sections: sectionsWithHandles,
                nodeId: currentNode.id,
            });
            return;
        }
        if (currentNode.type === "waButtonsNode") {
            return;
        }
        if (currentNode.type === "inputNode") {
            if (currentNode.data.prompt || currentNode.data.message) {
                setMessages((prev) => [...prev, { type: "bot", node: currentNode }]);
            }
            return;
        }
        const timer = setTimeout(() => moveToNextNode(currentNode), 800);
        return () => clearTimeout(timer);
    }, [currentNode]);

    // reset & start flow when modal opens
useEffect(() => {
    if (!isOpen || nodes.length === 0) return;

    setMessages([]);
    setCurrentNode(null);
    setVariables({});
    setInputValue("");
    setActiveList(null);
    setIsLoading(false);
    setIsDelaying(false);
    setActiveForm(null);
    setFormValues({});
}, [isOpen]);

    // ---------- handlers ----------
    const handleButtonClick = (buttonText, buttonIndex) => {
        if (!currentNode) return;
        setMessages((prev) => [...prev, { type: "user", text: buttonText }]);
        const edge = edges.find(
            (e) => e.source === currentNode.id && e.sourceHandle === `button-${buttonIndex}`
        );
        if (!edge) return;
        const nextNode = nodes.find((node) => node.id === edge.target);
        if (!nextNode) return;
        setTimeout(() => {
            setMessages((prev) => [...prev, { type: "bot", node: nextNode }]);
            setCurrentNode(nextNode);
        }, 500);
    };

    const handleInputSubmit = () => {
        if (!inputValue.trim()) return;
        const userText = inputValue.trim();

    // START FLOW IF NOT RUNNING
    if (!currentNode) {

    const startNode = nodes.find(
        n => n.type === "startNode"
    );

    const trigger = startNode?.data?.trigger?.trim();

    setMessages(prev => [
        ...prev,
        { type: "user", text: userText }
    ]);

    if (
        trigger &&
        userText.toLowerCase() === trigger.toLowerCase()
    ) {

        const startEdge = edges.find(
            e => e.source === startNode.id
        );

        if (startEdge) {
            executeNode(startEdge.target);
        }

    } else {

        setMessages(prev => [
            ...prev,
            {
                type: "bot",
                text: `Please send ${trigger}`
            }
        ]);
    }

    setInputValue("");
    return;
}

        if (currentNode.type !== "inputNode") return;
        const processedValue = inputValue.trim();
        const varName = currentNode.data.variableName || currentNode.id;
        console.log("========== INPUT DEBUG ==========");
        console.log("Saving variable:", varName);
        console.log("With value:", processedValue);
        setMessages((prev) => [...prev, { type: "user", text: processedValue }]);
        setVariables((prev) => {
            const updated = { ...prev, [varName]: processedValue };
            console.log("Updated variables:", updated);
            return updated;
        });
        setInputValue("");
        setTimeout(() => {
            moveToNextNode(currentNode);
        }, 100);
    };

    const getNestedValue = (obj, path) => {
        return path.split(".").reduce((acc, key) => acc?.[key], obj);
    };

    const replaceVariables = (text) => {
        if (!text) return "";
        return text.replace(/\{\{(.*?)\}\}/g, (_, variable) => {
            const value = getNestedValue(variables, variable.trim());
            return value ?? "";
        });
    };

    if (!isOpen) return null;

    const isInputActive =
    !activeForm &&
    (
        currentNode === null ||
        currentNode?.type === "inputNode"
    );
    const isListNode = currentNode?.type === "waListNode";
    const lastMessageIndex = messages.length - 1;

    return (
        <div className="preview-overlay">
            <div
                className="preview-modal"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "600px",
                    maxHeight: "90vh",
                    position: "relative",
                }}
            >
                {/* Header — always visible */}
                <div className="preview-header" style={{ flexShrink: 0 }}>
                    <div>
                        <strong>digiLATERAL</strong>
                        <div style={{ fontSize: "12px" }}>online</div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* ✅ FORM VIEW — shown inside modal (header stays visible) */}
                {activeForm ? (
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            background: "#0E3A57",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Form sub-header with back button */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "12px 16px",
                                background: "#0E3A57",
                                borderBottom: "1px solid rgba(255,255,255,0.15)",
                                flexShrink: 0,
                            }}
                        >
                            <button
                                onClick={() => setActiveForm(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "white",
                                    fontSize: "20px",
                                    cursor: "pointer",
                                    padding: "0",
                                    lineHeight: 1,
                                }}
                            >
                                ←
                            </button>
                            <h3 style={{ margin: 0, color: "white", fontSize: "16px", fontWeight: "600" }}>
                                {activeForm.data.formTitle || "Form"}
                            </h3>
                        </div>

                        {/* Form fields */}
                        <div style={{ padding: "20px", flex: 1, overflowY: "auto" }}>
                            {(activeForm.data.formFields || []).map((field, index) => (
                                <div key={index} style={{ marginBottom: "20px" }}>
                                    <label
                                        style={{
                                            color: "white",
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {field.label}
                                    </label>
                                    {field.type !== "select" ? (
                                        <input
                                            type={field.type}
                                            value={formValues[field.variable] || ""}
                                            onChange={(e) =>
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    [field.variable]: e.target.value,
                                                }))
                                            }
                                            style={{
                                                width: "100%",
                                                boxSizing: "border-box",
                                                padding: "16px",
                                                borderRadius: "14px",
                                                border: "1px solid white",
                                                background: "#183B5D",
                                                color: "white",
                                                fontSize: "14px",
                                            }}
                                        />
                                    ) : (
                                        <select
                                            value={formValues[field.variable] || ""}
                                            onChange={(e) =>
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    [field.variable]: e.target.value,
                                                }))
                                            }
                                            style={{
                                                width: "100%",
                                                padding: "15px",
                                                borderRadius: "12px",
                                                background: "#143F5F",
                                                color: "white",
                                                border: "1px solid white",
                                                fontSize: "14px",
                                            }}
                                        >
                                            <option value="">Select</option>
                                            {field.options?.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            ))}

                            <button
                                style={{
                                    width: "100%",
                                    padding: "18px",
                                    borderRadius: "30px",
                                    background: "#25D366",
                                    color: "white",
                                    border: "none",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                    marginTop: "8px",
                                }}
                                onClick={() => {
                                    setVariables((prev) => ({
                                        ...prev,
                                        ...formValues,
                                    }));
                                    setMessages((prev) => [
                                        ...prev,
                                        { type: "user", text: "Form Submitted" },
                                    ]);
                                    const submittedForm = activeForm;
                                    setActiveForm(null);
                                    setFormValues({});
                                    moveToNextNode(submittedForm);
                                }}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Scrollable chat area */}
                        <div
                            className="preview-chat"
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                            }}
                        >
                            {messages.map((message, index) => {
                                if (message.type === "user") {
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    background: "#DCF8C6",
                                                    padding: "10px 14px",
                                                    borderRadius: "18px 18px 4px 18px",
                                                    maxWidth: "75%",
                                                    fontSize: "14px",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {message.text}
                                            </div>
                                        </div>
                                    );
                                }

                                if (message.type === "bot" && message.text) {
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                display: "flex",
                                                justifyContent: "flex-start",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    background: "white",
                                                    padding: "10px 14px",
                                                    borderRadius: "18px 18px 18px 4px",
                                                    maxWidth: "75%",
                                                    fontSize: "14px",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {replaceVariables(message.text)}
                                            </div>
                                        </div>
                                    );
                                }

                                // ✅ NEW: form message type — shows Open Form button in chat
                                if (message.type === "form") {
                                    const isLastMessage = index === lastMessageIndex;
                                    return (
                                        <div key={index} style={{ display: "flex", justifyContent: "flex-start" }}>
                                            <div
                                                style={{
                                                    background: "white",
                                                    padding: "15px",
                                                    borderRadius: "18px 18px 18px 4px",
                                                    maxWidth: "80%",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                }}
                                            >
                                                <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#333" }}>
                                                    Please complete the form.
                                                </p>
                                                {isLastMessage && (
                                                    <button
                                                        onClick={() => {
                                                            setFormValues({});
                                                            setActiveForm(message.node);
                                                        }}
                                                        style={{
                                                            background: "#25D366",
                                                            color: "white",
                                                            border: "none",
                                                            padding: "10px 20px",
                                                            borderRadius: "10px",
                                                            cursor: "pointer",
                                                            fontSize: "14px",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        📋 Open Form
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }

                                if (message.type === "waList") {
                                    const isLastMessage = index === messages.length - 1;
                                    return (
                                        <div key={index}>
                                            <div
                                                style={{
                                                    background: "white",
                                                    padding: "10px 14px",
                                                    borderRadius: "18px 18px 18px 4px",
                                                    maxWidth: "75%",
                                                    fontSize: "14px",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    wordBreak: "break-word",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                {replaceVariables(message.body)}
                                            </div>
                                            <p
                                                style={{
                                                    marginTop: "6px",
                                                    fontSize: "11px",
                                                    color: "#999",
                                                }}
                                            >
                                                📋 WhatsApp List
                                            </p>
                                            {isLastMessage && (
                                                <button
                                                    onClick={() => openListOptions(message)}
                                                    style={{
                                                        display: "block",
                                                        padding: "10px 14px",
                                                        borderRadius: "8px",
                                                        border: "1px solid #25D366",
                                                        background: "#25D366",
                                                        color: "white",
                                                        cursor: "pointer",
                                                        fontWeight: "500",
                                                        fontSize: "13px",
                                                        textAlign: "center",
                                                        marginTop: "4px",
                                                        maxWidth: "75%",
                                                    }}
                                                >
                                                    📋 {replaceVariables(message.buttonText)}
                                                </button>
                                            )}
                                        </div>
                                    );
                                }

                                const node = message.node;
                                const isLastMessage = index === lastMessageIndex;

                                return (
                                    <div key={index}>
                                        {(node.data.message || node.data.prompt) && (
                                            <div
                                                style={{
                                                    background: "white",
                                                    padding: "10px 14px",
                                                    borderRadius: "18px 18px 18px 4px",
                                                    maxWidth: "75%",
                                                    fontSize: "14px",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    wordBreak: "break-word",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                {replaceVariables(node.data.message || node.data.prompt)}
                                            </div>
                                        )}

                                        {isLoading && node.type === "apiNode" && isLastMessage && (
                                            <div
                                                style={{
                                                    background: "white",
                                                    padding: "10px 14px",
                                                    borderRadius: "18px 18px 18px 4px",
                                                    maxWidth: "75%",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    marginBottom: "6px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                }}
                                            >
                                                <span style={{ fontSize: "16px" }}>⏳</span>
                                                <span style={{ fontSize: "13px", color: "#666" }}>
                                                    Calling API...
                                                </span>
                                            </div>
                                        )}

                                        {node.type === "waListNode" && (
                                            <div
                                                style={{
                                                    background: "white",
                                                    borderRadius: "12px",
                                                    maxWidth: "80%",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    marginBottom: "6px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <div style={{ padding: "10px 14px" }}>
                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            fontSize: "14px",
                                                            color: "#333",
                                                            lineHeight: "1.4",
                                                        }}
                                                    >
                                                        {replaceVariables(node.data.body || "Please pick an option")}
                                                    </p>
                                                    <p
                                                        style={{
                                                            marginTop: "6px",
                                                            fontSize: "11px",
                                                            color: "#999",
                                                        }}
                                                    >
                                                        📋 WhatsApp List
                                                    </p>
                                                </div>

                                                {isLastMessage && !activeList && (
                                                    <div
                                                        style={{
                                                            padding: "8px 14px 14px 14px",
                                                            borderTop: "1px solid #eee",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                openListOptions({
                                                                    nodeId: node.id,
                                                                    body: node.data.body,
                                                                    buttonText: node.data.buttonText,
                                                                    sections: node.data.sections || [],
                                                                })
                                                            }
                                                            style={{
                                                                display: "block",
                                                                width: "100%",
                                                                padding: "10px 14px",
                                                                borderRadius: "8px",
                                                                border: "1px solid #25D366",
                                                                background: "#25D366",
                                                                color: "white",
                                                                cursor: "pointer",
                                                                fontWeight: "500",
                                                                fontSize: "13px",
                                                                textAlign: "center",
                                                            }}
                                                        >
                                                            📋 {replaceVariables(node.data.buttonText || "View options")}
                                                        </button>
                                                    </div>
                                                )}

                                                {isLastMessage && activeList && activeList.nodeId === node.id && (
                                                    <div
                                                        style={{
                                                            padding: "8px 14px 14px 14px",
                                                            borderTop: "1px solid #eee",
                                                            background: "#f9f9f9",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                marginBottom: "10px",
                                                            }}
                                                        >
                                                            <strong style={{ fontSize: "13px" }}>Select an option</strong>
                                                            <button
                                                                onClick={() => setActiveList(null)}
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    fontSize: "16px",
                                                                    cursor: "pointer",
                                                                    color: "#999",
                                                                }}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>

                                                        {(node.data.sections || []).map((section, sectionIndex) => (
                                                            <div key={sectionIndex} style={{ marginBottom: "10px" }}>
                                                                {section.title && (
                                                                    <p
                                                                        style={{
                                                                            fontSize: "11px",
                                                                            fontWeight: "600",
                                                                            color: "#888",
                                                                            textTransform: "uppercase",
                                                                            marginBottom: "4px",
                                                                            paddingLeft: "4px",
                                                                        }}
                                                                    >
                                                                        {section.title}
                                                                    </p>
                                                                )}
                                                                {(section.rows || []).map((row, rowIndex) => (
                                                                    <button
                                                                        key={rowIndex}
                                                                        onClick={() => handleListRowClick(sectionIndex, rowIndex, row)}
                                                                        style={{
                                                                            display: "block",
                                                                            width: "100%",
                                                                            padding: "10px 14px",
                                                                            marginBottom: "4px",
                                                                            borderRadius: "8px",
                                                                            border: "1px solid #e0e0e0",
                                                                            background: "white",
                                                                            color: "#333",
                                                                            cursor: "pointer",
                                                                            fontSize: "13px",
                                                                            textAlign: "left",
                                                                            transition: "all 0.2s",
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.background = "#E8F5E9";
                                                                            e.target.style.borderColor = "#25D366";
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.background = "white";
                                                                            e.target.style.borderColor = "#e0e0e0";
                                                                        }}
                                                                    >
                                                                        {replaceVariables(row)}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {node.type === "waTemplateNode" && (
                                            <div
                                                style={{
                                                    background: "white",
                                                    borderRadius: "12px",
                                                    maxWidth: "80%",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    marginBottom: "6px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {node.data.headerType && node.data.headerType !== "none" && (
                                                    <div style={{ padding: "8px", background: "#f5f5f5" }}>
                                                        {node.data.headerType === "text" && (
                                                            <p
                                                                style={{
                                                                    margin: 0,
                                                                    fontSize: "14px",
                                                                    fontWeight: "600",
                                                                    color: "#333",
                                                                }}
                                                            >
                                                                {replaceVariables(node.data.headerValue || "")}
                                                            </p>
                                                        )}
                                                        {node.data.headerType === "image" && (
                                                            <img
                                                                src={
                                                                    node.data.headerMediaSource === "upload"
                                                                        ? node.data.headerUploadedPreviewUrl
                                                                        : replaceVariables(node.data.headerValue || "")
                                                                }
                                                                alt="Header"
                                                                style={{
                                                                    width: "100%",
                                                                    maxHeight: "200px",
                                                                    objectFit: "cover",
                                                                    display: "block",
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.style.display = "none";
                                                                }}
                                                            />
                                                        )}
                                                        {node.data.headerType === "video" && (
                                                            <video controls style={{ width: "100%", maxHeight: "200px" }}>
                                                                <source
                                                                    src={
                                                                        node.data.headerMediaSource === "upload"
                                                                            ? node.data.headerUploadedPreviewUrl
                                                                            : replaceVariables(node.data.headerValue || "")
                                                                    }
                                                                />
                                                            </video>
                                                        )}
                                                        {node.data.headerType === "document" && (
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px",
                                                                    padding: "8px",
                                                                }}
                                                            >
                                                                <span style={{ fontSize: "24px" }}>📄</span>
                                                                <a
                                                                    href={
                                                                        node.data.headerMediaSource === "upload"
                                                                            ? node.data.headerUploadedPreviewUrl
                                                                            : replaceVariables(node.data.headerValue || "")
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{ color: "#25D366", fontSize: "13px" }}
                                                                >
                                                                    Document
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{ padding: "10px 14px" }}>
                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            fontSize: "14px",
                                                            color: "#333",
                                                            lineHeight: "1.4",
                                                        }}
                                                    >
                                                        <strong>{node.data.templateName || "Template"}</strong>
                                                    </p>
                                                    {node.data.bodyVariables && node.data.bodyVariables.length > 0 && (
                                                        <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
                                                            {node.data.bodyVariables.map((varName, i) => (
                                                                <span
                                                                    key={i}
                                                                    style={{
                                                                        display: "inline-block",
                                                                        background: "#E8F5E9",
                                                                        padding: "2px 8px",
                                                                        borderRadius: "4px",
                                                                        margin: "2px 4px 2px 0",
                                                                        fontSize: "11px",
                                                                    }}
                                                                >
                                                                    {`{{${varName}}}`} = {variables[varName] || "___"}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p
                                                        style={{
                                                            marginTop: "8px",
                                                            fontSize: "12px",
                                                            color: "#999",
                                                        }}
                                                    >
                                                        {node.data.language?.toUpperCase() || "EN"} • WhatsApp Template
                                                    </p>
                                                </div>

                                                {node.data.templateButtons && node.data.templateButtons.length > 0 && (
                                                    <div
                                                        style={{
                                                            padding: "8px 14px 14px 14px",
                                                            borderTop: "1px solid #eee",
                                                        }}
                                                    >
                                                        {node.data.templateButtons.map((button, buttonIndex) => (
                                                            <button
                                                                key={buttonIndex}
                                                                onClick={() => handleTemplateButtonClick(button, buttonIndex)}
                                                                style={{
                                                                    display: "block",
                                                                    width: "100%",
                                                                    padding: "10px 14px",
                                                                    marginBottom: "6px",
                                                                    borderRadius: "8px",
                                                                    border: "1px solid #25D366",
                                                                    background: "white",
                                                                    color: "#25D366",
                                                                    cursor: "pointer",
                                                                    fontWeight: "500",
                                                                    fontSize: "13px",
                                                                    transition: "all 0.2s",
                                                                    textAlign: "center",
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.background = "#f0fff4";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.background = "white";
                                                                }}
                                                            >
                                                                {button.type === "url"
                                                                    ? "🔗 "
                                                                    : button.type === "phone_number"
                                                                        ? "📞 "
                                                                        : "↩ "}
                                                                {replaceVariables(button.text) || "Button"}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {node.type === "waMediaNode" && node.data.mediaType === "image" && (
                                            <div
                                                style={{
                                                    background: "white",
                                                    padding: "8px",
                                                    borderRadius: "12px",
                                                    maxWidth: "75%",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                <img
                                                    src={
                                                        node.data.mediaSource === "upload"
                                                            ? node.data.uploadedPreviewUrl
                                                            : replaceVariables(node.data.mediaUrl)
                                                    }
                                                    alt={node.data.caption || "Image"}
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: "8px",
                                                        display: "block",
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                        e.target.parentElement.innerHTML =
                                                            "<p style='color:red; padding:10px;'>❌ Failed to load image</p>";
                                                    }}
                                                />
                                                {node.data.caption && (
                                                    <p
                                                        style={{
                                                            marginTop: "8px",
                                                            fontSize: "12px",
                                                            color: "#666",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {replaceVariables(node.data.caption)}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {node.type === "waMediaNode" && node.data.mediaType === "video" && (
                                            <div
                                                style={{
                                                    background: "white",
                                                    padding: "8px",
                                                    borderRadius: "12px",
                                                    maxWidth: "75%",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                <video
                                                    controls
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: "8px",
                                                        display: "block",
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                        e.target.parentElement.innerHTML =
                                                            "<p style='color:red; padding:10px;'>❌ Failed to load video</p>";
                                                    }}
                                                >
                                                    <source
                                                        src={
                                                            node.data.mediaSource === "upload"
                                                                ? node.data.uploadedPreviewUrl
                                                                : replaceVariables(node.data.mediaUrl)
                                                        }
                                                    />
                                                    Your browser does not support the video tag.
                                                </video>
                                                {node.data.caption && (
                                                    <p
                                                        style={{
                                                            marginTop: "8px",
                                                            fontSize: "12px",
                                                            color: "#666",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {replaceVariables(node.data.caption)}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {node.type === "waMediaNode" && node.data.mediaType === "audio" && (
                                            <div
                                                style={{
                                                    background: "white",
                                                    padding: "10px 14px",
                                                    borderRadius: "18px 18px 18px 4px",
                                                    maxWidth: "75%",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                <audio
                                                    controls
                                                    style={{ width: "100%" }}
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                        e.target.parentElement.innerHTML =
                                                            "<p style='color:red; padding:10px;'>❌ Failed to load audio</p>";
                                                    }}
                                                >
                                                    <source
                                                        src={
                                                            node.data.mediaSource === "upload"
                                                                ? node.data.uploadedPreviewUrl
                                                                : replaceVariables(node.data.mediaUrl)
                                                        }
                                                    />
                                                    Your browser does not support the audio tag.
                                                </audio>
                                                {node.data.caption && (
                                                    <p
                                                        style={{
                                                            marginTop: "8px",
                                                            fontSize: "12px",
                                                            color: "#666",
                                                        }}
                                                    >
                                                        {replaceVariables(node.data.caption)}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {node.type === "waMediaNode" && node.data.mediaType === "document" && (
                                            <div
                                                style={{
                                                    background: "white",
                                                    padding: "10px 14px",
                                                    borderRadius: "18px 18px 18px 4px",
                                                    maxWidth: "75%",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{ fontSize: "24px" }}>📄</span>
                                                    <a
                                                        href={
                                                            node.data.mediaSource === "upload"
                                                                ? node.data.uploadedPreviewUrl
                                                                : replaceVariables(node.data.mediaUrl)
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            color: "#25D366",
                                                            textDecoration: "underline",
                                                            fontSize: "14px",
                                                            wordBreak: "break-all",
                                                        }}
                                                    >
                                                        {node.data.caption || "Open Document"}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {node.type === "waMediaNode" && node.data.mediaType === "sticker" && (
                                            <div
                                                style={{
                                                    background: "white",
                                                    padding: "8px",
                                                    borderRadius: "12px",
                                                    maxWidth: "50%",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                <img
                                                    src={
                                                        node.data.mediaSource === "upload"
                                                            ? node.data.uploadedPreviewUrl
                                                            : replaceVariables(node.data.mediaUrl)
                                                    }
                                                    alt="Sticker"
                                                    style={{
                                                        width: "100%",
                                                        maxWidth: "150px",
                                                        borderRadius: "8px",
                                                        display: "block",
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                        e.target.parentElement.innerHTML =
                                                            "<p style='color:red; padding:10px;'>❌ Failed to load sticker</p>";
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {node.type === "waButtonsNode" && node.data.buttons && isLastMessage && (
                                            <div>
                                                {node.data.buttons.map((button, buttonIndex) => (
                                                    <button
                                                        key={buttonIndex}
                                                        onClick={() => handleButtonClick(button, buttonIndex)}
                                                        style={{
                                                            display: "block",
                                                            width: "100%",
                                                            padding: "10px 14px",
                                                            marginBottom: "6px",
                                                            borderRadius: "10px",
                                                            border: "1px solid #25D366",
                                                            background: "white",
                                                            color: "#25D366",
                                                            cursor: "pointer",
                                                            fontWeight: "500",
                                                            fontSize: "14px",
                                                            transition: "all 0.2s",
                                                            textAlign: "center",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = "#f0fff4";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = "white";
                                                        }}
                                                    >
                                                        ↩ {button}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* List Modal Popup (Global Modal) */}
                        {activeList && activeList.sections && (
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "80px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "90%",
                                    maxWidth: "300px",
                                    background: "white",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                                    zIndex: 1000,
                                    overflow: "hidden",
                                    animation: "slideUp 0.3s ease",
                                }}
                            >
                                <div
                                    style={{
                                        padding: "12px",
                                        background: "#075E54",
                                        color: "white",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <strong>Select an option</strong>
                                    <button
                                        onClick={() => setActiveList(null)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "white",
                                            fontSize: "20px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                                    {activeList.sections.map((section, sectionIndex) => {
                                        return (
                                            <div key={sectionIndex} style={{ padding: "8px 0" }}>
                                                {section.title && (
                                                    <div
                                                        style={{
                                                            padding: "8px 12px",
                                                            background: "#f0f0f0",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            color: "#666",
                                                            textTransform: "uppercase",
                                                        }}
                                                    >
                                                        {section.title}
                                                    </div>
                                                )}
                                                {(section.rows || []).map((row, rowIndex) => {
                                                    const rowText = typeof row === "object" ? row.text : row;
                                                    const handleId = typeof row === "object" ? row.handleId : `row-${rowIndex}`;
                                                    return (
                                                        <button
                                                            key={rowIndex}
                                                            onClick={() =>
                                                                handleListRowClickModal(activeList.nodeId, handleId, rowText)
                                                            }
                                                            style={{
                                                                display: "block",
                                                                width: "100%",
                                                                padding: "12px 16px",
                                                                border: "none",
                                                                borderBottom: "1px solid #eee",
                                                                background: "white",
                                                                textAlign: "left",
                                                                cursor: "pointer",
                                                                fontSize: "14px",
                                                                transition: "background 0.2s",
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.background = "#E8F5E9";
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.background = "white";
                                                            }}
                                                        >
                                                            {replaceVariables(rowText)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Fixed WhatsApp-style bottom bar */}
                        <div
                            style={{
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "10px 12px",
                                background: "#f0f0f0",
                                borderTop: "1px solid #ddd",
                            }}
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleInputSubmit();
                                }}
                                placeholder={
                                    isInputActive
                                        ? currentNode?.data?.placeholder || "Type a message..."
                                        : isListNode && !activeList
                                            ? "Click 'View options' to select"
                                            : isListNode && activeList
                                                ? "Select an option from the list above"
                                                : "Use the buttons above to respond"
                                }
                                disabled={!isInputActive}
                                style={{
                                    flex: 1,
                                    padding: "10px 16px",
                                    borderRadius: "24px",
                                    border: "none",
                                    fontSize: "14px",
                                    outline: "none",
                                    background: isInputActive ? "white" : "#e0e0e0",
                                    color: isInputActive ? "#111" : "#999",
                                    cursor: isInputActive ? "text" : "default",
                                    transition: "all 0.2s",
                                    boxShadow: isInputActive ? "0 0 0 2px #25D366" : "none",
                                }}
                            />
                            <button
                                onClick={handleInputSubmit}
                                disabled={!isInputActive || !inputValue.trim()}
                                style={{
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "50%",
                                    border: "none",
                                    background: isInputActive && inputValue.trim() ? "#25D366" : "#bbb",
                                    color: "white",
                                    cursor: isInputActive && inputValue.trim() ? "pointer" : "not-allowed",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "16px",
                                    flexShrink: 0,
                                    transition: "background 0.2s",
                                }}
                            >
                                ➤
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default PreviewModal;