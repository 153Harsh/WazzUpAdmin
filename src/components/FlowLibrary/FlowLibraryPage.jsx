import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";

import PreviewModal from "../NewFlowBuilder/preview/PreviewModal";
import "./FlowLibraryPage.css";

export default function FlowLibraryPage() {
  const { id: userId } = useParams();

  const [flows, setFlows] = useState([]);
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingFlow, setEditingFlow] = useState(null);
  const [trigger, setTrigger] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [viewMode, setViewMode] = useState("cards");
  const [deletingFlowId, setDeletingFlowId] = useState(null);

  const fileInputRef = useRef(null);

  // Helper to get flow ID consistently
  const getFlowId = useCallback((flow) => flow?._id || flow?.id, []);

  // Helper to find flow by ID
  const findFlowById = useCallback(
    (id) => {
      return flows.find((f) => (f._id || f.id) === id) || null;
    },
    [flows],
  );

  const openSettings = useCallback((flow) => {
    setEditingFlow(flow);
    setTrigger(flow.trigger || "");
    setDescription(flow.description || "");
    setThumbnail(flow.thumbnail || "");
    setShowSettings(true);
  }, []);

  const downloadFlowJson = useCallback(async (flowId, flowName) => {
    try {
      const response = await fetch(
        `http://localhost:7821/api/admin/flow/${flowId}`,
      );

      const result = await response.json();

      if (!result.success) {
        alert("Failed to download flow");
        return;
      }

      const dataStr = JSON.stringify(result.data, null, 2);

      const blob = new Blob([dataStr], {
        type: "application/json",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${flowName || "flow"}.json`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to download flow");
    }
  }, []);

  const deleteFlow = useCallback(async (flowId, flowName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${flowName || "Untitled Flow"}"?`,
      )
    ) {
      return;
    }

    setDeletingFlowId(flowId);

    try {
      const response = await fetch(
        `http://localhost:7821/api/admin/admin/flow/${flowId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        setFlows((prev) => prev.filter((f) => (f._id || f.id) !== flowId));
        alert("Flow deleted successfully!");
      } else {
        alert("Failed to delete flow: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting flow:", error);
      alert("Error deleting flow: " + error.message);
    } finally {
      setDeletingFlowId(null);
    }
  }, []);

  const handleFileUpload = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setUploadingThumbnail(true);

      try {
        const formData = new FormData();
        formData.append("thumbnail", file);

        const response = await fetch(
          `http://localhost:7821/api/admin/flow/${editingFlow._id}/upload-thumbnail?dbType=demo`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error response:", errorText);
          throw new Error(
            `Server responded with ${response.status}: ${errorText}`,
          );
        }

        const result = await response.json();

        if (result.success) {
          setThumbnail(result.data.thumbnail);
          alert("Thumbnail uploaded successfully!");
        } else {
          alert(
            "Failed to upload thumbnail: " +
              (result.message || "Unknown error"),
          );
        }
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
        alert("Error uploading thumbnail: " + error.message);
      } finally {
        setUploadingThumbnail(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [editingFlow],
  );
const flowsWithConnections = useMemo(() => {
  return flows.map(flow => {
    const targetIds =
      flow.nodes
        ?.filter(
          node =>
            node.type === "flow_transfer" ||
            node.type === "flowTransferNode"
        )
        .map(node => node?.data?.targetFlowId)
        .filter(Boolean) || [];

    const connectedNames = targetIds.map(id => {
      const target = flows.find(
        f => String(f._id || f.id) === String(id)
      );

      return target?.name;
    }).filter(Boolean);

    return {
      ...flow,
      connectedNames,
    };
  });
}, [flows]);
  const transferFlowById = useCallback(async (flowId) => {
    try {
      const response = await fetch(
        `http://localhost:7821/api/admin/flow/${flowId}`,
      );

      const result = await response.json();

      if (!result.success) {
        console.error("Failed to transfer flow:", result);
        return;
      }

      const convertedNodes = (result.data.nodes || []).map((node) => ({
        ...node,
        type: normalizeNodeType(node.type),
      }));

      setSelectedFlow(result.data);
      setNodes(convertedNodes);
      setEdges(result.data.edges || []);
    } catch (e) {
      console.error("Error transferring flow:", e);
    }
  }, []);

  const saveSettings = useCallback(async () => {
    if (!editingFlow) return;

    try {
      const response = await fetch(
        `http://localhost:7821/api/admin/flow/${editingFlow._id}/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trigger,
            description,
            thumbnail,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        alert("Flow updated");

        setFlows((prev) =>
          prev.map((f) => (f._id === editingFlow._id ? result.data : f)),
        );

        setShowSettings(false);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save settings");
    }
  }, [editingFlow, trigger, description, thumbnail]);

  // Load flows on userId change
  useEffect(() => {
    if (!userId) return;

    const loadFlows = async () => {
      try {
        const response = await fetch(
          `http://localhost:7821/api/admin/flows/${userId}`,
        );
        const result = await response.json();
        if (result?.success) setFlows(result.data || []);
      } catch (e) {
        console.error("Failed to load flows", e);
      }
    };

    loadFlows();
  }, [userId]);

  // Update connected flows whenever flows change

  const selectedFlowMemo = useMemo(() => {
    if (!selectedFlowId) return null;
    return findFlowById(selectedFlowId);
  }, [selectedFlowId, findFlowById]);

  // Normalize node type - moved outside component to prevent recreation
  const normalizeNodeType = useCallback((rawType) => {
    if (!rawType || typeof rawType !== "string") return rawType;

    const t = rawType.trim();
    const lc = t.toLowerCase();

    const aliases = {
      start: "startNode",
      startnode: "startNode",
      start_node: "startNode",
      "start-node": "startNode",

      message: "textNode",
      messagenode: "textNode",
      text: "textNode",
      textnode: "textNode",
      text_msg: "textNode",
      "text-message": "textNode",

      wa_buttons: "waButtonsNode",
      wa_buttonsnode: "waButtonsNode",
      wabuttons: "waButtonsNode",
      wabuttonsnode: "waButtonsNode",
      "wa-buttons": "waButtonsNode",

      wa_list: "waListNode",
      wa_listnode: "waListNode",
      walist: "waListNode",
      walistnode: "waListNode",
      "wa-list": "waListNode",

      wa_media: "waMediaNode",
      wa_medianode: "waMediaNode",
      wamedianode: "waMediaNode",
      "wa-media": "waMediaNode",

      wa_template: "waTemplateNode",
      wa_templatenode: "waTemplateNode",
      watemplate: "waTemplateNode",
      watemplatenode: "waTemplateNode",
      "wa-template": "waTemplateNode",

      input: "inputNode",
      inputnode: "inputNode",
      freeinput: "inputNode",
      "input-node": "inputNode",

      condition: "conditionNode",
      conditionnode: "conditionNode",
      if: "conditionNode",

      api: "apiNode",
      apinode: "apiNode",

      delay: "delayNode",
      delaynode: "delayNode",

      form: "formNode",
      formnode: "formNode",

      end: "endFlowNode",
      endflow: "endFlowNode",
      endflownode: "endFlowNode",
      "end-flow": "endFlowNode",

      end_session: "endSessionNode",
      endsession: "endSessionNode",
      endsessionnode: "endSessionNode",
      "end-session": "endSessionNode",

      flow_transfer: "flowTransferNode",
      flowtransfer: "flowTransferNode",
      flow_transfernode: "flowTransferNode",
      "flow-transfer": "flowTransferNode",
    };

    if (aliases.hasOwnProperty(lc)) return aliases[lc];

    const normalized = lc.replace(/[\s_-]+/g, "");
    if (aliases.hasOwnProperty(normalized)) return aliases[normalized];

    return rawType;
  }, []);

  const loadFlowById = useCallback(
    async (flowId) => {
      setLoading(true);
      setSelectedFlowId(flowId);

      try {
        const response = await fetch(
          `http://localhost:7821/api/admin/flow/${flowId}`,
        );
        const result = await response.json();

        if (!result?.success) {
          console.error("Failed to load flow:", result);
          setLoading(false);
          return;
        }

        const convertedNodes = (result.data.nodes || []).map((node) => ({
          ...node,
          type: normalizeNodeType(node.type),
        }));

        setSelectedFlow(result.data);
        setNodes(convertedNodes);
        setEdges(result.data.edges || []);
        setPreviewOpen(true);
      } catch (e) {
        console.error("Failed to load flow", e);
      } finally {
        setLoading(false);
      }
    },
    [normalizeNodeType],
  );

  const handleModalClose = useCallback(() => {
    setPreviewOpen(false);
    setSelectedFlow(null);
    setNodes([]);
    setEdges([]);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Render functions
  const renderFlowCard = useCallback(
    (flow) => {
      const id = flow._id || flow.id;
      const isDeleting = deletingFlowId === id;
      const connectedFlows = flow.connectedNames || [];
      return (
        <div key={id} className="flow-library-card">
          <div className="flow-thumbnail-wrapper">
            {flow.thumbnail ? (
              <img
                src={flow.thumbnail}
                alt={flow.name}
                className="flow-thumbnail"
              />
            ) : (
              <div className="flow-thumbnail-watermark">#WAZZUP</div>
            )}
            <div className="flow-thumbnail-badge">
              {flow.trigger ? "● Active" : "○ Inactive"}
            </div>
            
          </div>

          <div className="flow-library-card-content">
            <div className="flow-library-card-header">
              <div className="flow-library-card-name">
                {flow.name || "Untitled Flow"}
              </div>
              <div
                className={`flow-library-card-status ${flow.trigger ? "active" : "inactive"}`}
              >
                <span className="status-dot" />
                {flow.trigger ? "Active" : "Inactive"}
              </div>
            </div>

            <div
              className={`flow-library-card-description ${!flow.description ? "empty" : ""}`}
            >
              {flow.description || "No description available"}
            </div>
            {connectedFlows.length > 0 && (
  <div className="flow-connected-section">
    <div className="flow-connected-list">
      {connectedFlows.map((name, index) => (
        <span
          key={index}
          className="flow-connected-badge"
        >
          🔗 {name}
        </span>
      ))}
    </div>
  </div>
)}
            <div className="flow-library-card-meta">
              <div className="flow-library-card-trigger">
                <span className="trigger-label">Trigger:</span>
                <span
                  className={`trigger-value ${!flow.trigger ? "not-set" : ""}`}
                >
                  {flow.trigger || "Not Set"}
                </span>
              </div>
              <div className="flow-library-card-date">
                {formatDate(flow.updatedAt || flow.createdAt)}
              </div>
            </div>

            <div className="flow-library-card-actions">
              <button
                className="flow-library-card-btn flow-library-card-btn-secondary"
                onClick={() => openSettings(flow)}
              >
                Edit
              </button>

              <button
                className="flow-library-card-btn flow-library-card-btn-primary"
                onClick={() => loadFlowById(id)}
                disabled={loading}
              >
                {loading && selectedFlowId === id ? "Loading..." : "Preview"}
              </button>
              <button
                className="flow-library-card-btn flow-library-card-btn-download"
                onClick={() => downloadFlowJson(id, flow.name)}
              >
                Download
              </button>
              <button
              className="flow-library-card-btn flow-library-card-btn-delete"
              onClick={() => deleteFlow(id, flow.name)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button> 
            </div>
          </div>
        </div>
      );
    },
    [
      deletingFlowId,
      loading,
      selectedFlowId,
      deleteFlow,
      openSettings,
      loadFlowById,
      downloadFlowJson,
      formatDate,
    ],
  );

  const renderFlowListItem = useCallback(
    (flow) => {
      const id = flow._id || flow.id;
      const isDeleting = deletingFlowId === id;
      const connectedFlows = flow.connectedNames || [];
      return (
        <div key={id} className="flow-library-list-item">
          <div className="flow-list-thumbnail">
            {flow.thumbnail ? (
              <img
                src={flow.thumbnail}
                alt={flow.name}
                className="flow-list-thumbnail-img"
              />
            ) : (
              <div className="flow-list-thumbnail-placeholder">#</div>
            )}
          </div>

          <div className="flow-list-content">
            <div className="flow-list-header">
              <div className="flow-list-name">
                {flow.name || "Untitled Flow"}
              </div>
              <div
                className={`flow-library-card-status ${flow.trigger ? "active" : "inactive"}`}
              >
                <span className="status-dot" />
                {flow.trigger ? "Active" : "Inactive"}
              </div>
            </div>

            <div
              className={`flow-list-description ${!flow.description ? "empty" : ""}`}
            >
              {flow.description || "No description available"}
            </div>
{connectedFlows.length > 0 && (
  <div className="flow-connected-list">
    {connectedFlows.map((name, index) => (
      <span
        key={index}
        className="flow-connected-badge"
      >
        🔗 {name}
      </span>
    ))}
  </div>
)}
            <div className="flow-list-meta">
              <div className="flow-list-trigger">
                <span className="trigger-label">Trigger:</span>
                <span
                  className={`trigger-value ${!flow.trigger ? "not-set" : ""}`}
                >
                  {flow.trigger || "Not Set"}
                </span>
              </div>
              <div className="flow-list-date">
                {formatDate(flow.updatedAt || flow.createdAt)}
              </div>
            </div>
          </div>

          <div className="flow-list-actions">
            <button
              className="flow-library-card-btn flow-library-card-btn-secondary"
              onClick={() => openSettings(flow)}
            >
              Edit
            </button>

            <button
              className="flow-library-card-btn flow-library-card-btn-primary"
              onClick={() => loadFlowById(id)}
              disabled={loading}
            >
              {loading && selectedFlowId === id ? "Loading..." : "Preview"}
            </button>
            <button
              className="flow-library-card-btn flow-library-card-btn-download"
              onClick={() => downloadFlowJson(id, flow.name)}
            >
              Download
            </button>
            <button
              className="flow-library-card-btn flow-library-card-btn-delete"
              onClick={() => deleteFlow(id, flow.name)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      );
    },
    [
      deletingFlowId,
      loading,
      selectedFlowId,
      deleteFlow,
      openSettings,
      loadFlowById,
      downloadFlowJson,
      formatDate,
    ],
  );

  return (
    <div className="flow-library-page">
      <div className="flow-library-page-header">
        <div>
          <div className="flow-library-page-title">
            📚 <span>Flow Library</span>
          </div>
          <div className="flow-library-page-sub">
            Manage and preview your saved flows
          </div>
        </div>
      </div>

      <div className="flow-library-stats">
        <div className="flow-library-stat-item">
          <span className="stat-number">{flows.length}</span>
          <span className="stat-label">Total Flows</span>
        </div>
        <div className="flow-library-stat-divider" />
        <div className="flow-library-stat-item">
          <span className="stat-number">
            {flows.filter((f) => f.trigger).length}
          </span>
          <span className="stat-label">With Triggers</span>
        </div>
        <div className="flow-library-stat-divider" />
        <div className="flow-library-stat-item">
          <span className="stat-number">
            {flows.filter((f) => f.thumbnail).length}
          </span>
          <span className="stat-label">With Thumbnails</span>
        </div>
        <div className="flow-library-view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === "cards" ? "active" : ""}`}
            onClick={() => setViewMode("cards")}
          >
            <span className="view-icon">📇</span>
            Cards
          </button>
          <button
            className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <span className="view-icon">📋</span>
            List
          </button>
        </div>
      </div>

      <div className="flow-library-page-body">
        {loading && <div className="flow-library-loading">Loading flow...</div>}

        {!loading && flows.length === 0 ? (
          <div className="flow-library-page-empty">
            <span className="empty-icon">📭</span>
            <div className="empty-title">No flows found</div>
            <div className="empty-sub">
              Create your first flow to get started
            </div>
          </div>
        ) : (
          <div
            className={`flow-library-container ${viewMode === "list" ? "list-view" : "grid-view"}`}
          >
           {flowsWithConnections.map((flow) =>
  viewMode === "cards"
    ? renderFlowCard(flow)
    : renderFlowListItem(flow)
)}
          </div>
        )}
      </div>

      <PreviewModal
        isOpen={previewOpen}
        onClose={handleModalClose}
        nodes={nodes}
        edges={edges}
        trigger={selectedFlow?.trigger || ""}
        loadFlowById={transferFlowById}
      />

      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <h2>⚙️ Flow Settings</h2>

            <input
              placeholder="Trigger message"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="thumbnail-upload-section">
              <label className="thumbnail-label">Thumbnail Image</label>

              <div className="thumbnail-input-group">
                <input
                  type="text"
                  placeholder="Thumbnail URL"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="thumbnail-url-input"
                />

                <div className="thumbnail-upload-btn-wrapper">
                  <button
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingThumbnail}
                  >
                    {uploadingThumbnail ? "⏳ Uploading..." : "📤 Upload"}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden-file-input"
                    disabled={uploadingThumbnail}
                  />
                </div>
              </div>

              <div className="thumbnail-preview-container">
                {thumbnail ? (
                  <div className="thumbnail-preview-wrapper">
                    <img
                      src={thumbnail}
                      alt="Thumbnail preview"
                      className="thumbnail-preview"
                    />
                    <button
                      className="remove-thumbnail-btn"
                      onClick={() => setThumbnail("")}
                      title="Remove thumbnail"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="thumbnail-placeholder">
                    No thumbnail selected
                  </div>
                )}
              </div>
            </div>

            <div className="settings-actions">
              <button onClick={() => setShowSettings(false)}>Cancel</button>

              <button onClick={saveSettings}>💾 Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
