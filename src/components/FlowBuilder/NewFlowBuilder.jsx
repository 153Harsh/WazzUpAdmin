import { useState, useRef, useEffect } from "react";
import { applyNodeChanges } from "reactflow"; x 
import "./App.css";
import Sidebar from "../NewFlowBuilder/Sidebar";
import FlowCanvas from "../NewFlowBuilder/FlowCanvas";
import Inspector from "../NewFlowBuilder/Inspector";
import PreviewModal from "../NewFlowBuilder/preview/PreviewModal";
// import FlowLibrarySidebarContainer from "./FlowLibrarySidebar";
import { useParams } from "react-router-dom";


const nodeTypeMap = {
  startNode: "start",
  textNode: "message",
  waButtonsNode: "wa_buttons",
  waListNode: "wa_list",
  waMediaNode: "wa_media",
  waTemplateNode: "wa_template",
  inputNode: "input",
  conditionNode: "condition",
  apiNode: "api",
  delayNode: "delay",
  formNode: "form",
  endFlowNode: "end",
  endSessionNode: "end_session",
  flowTransferNode: "flow_transfer",
};

const reverseNodeTypeMap = {
  start: "startNode",
  message: "textNode",
  wa_buttons: "waButtonsNode",
  wa_list: "waListNode",
  wa_media: "waMediaNode",
  wa_template: "waTemplateNode",
  input: "inputNode",
  condition: "conditionNode",
  api: "apiNode",
  delay: "delayNode",
  form: "formNode",
  end: "endFlowNode",
  end_session: "endSessionNode",
  flow_transfer: "flowTransferNode",
};

function NewFlowBuilder() {
  const [isRestored, setIsRestored] = useState(false);
  const { id: userId } = useParams();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [previewNodes, setPreviewNodes] = useState([]);
const [previewEdges, setPreviewEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [flowsList, setFlowsList] = useState([]);
  const [fitFunction, setFitFunction] = useState(null);
  const fileInputRef = useRef(null);
const [flowName, setFlowName] = useState("");
  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
const AUTO_TYPES = [
    "textNode",
    "waButtonsNode",
    "waListNode",
    "waMediaNode",
    "waTemplateNode",
    "inputNode",
  ];
 
  const CONNECT_DISTANCE = 200;
 
  const getBottomPoint = (node) => ({
    x: node.position.x + 120,
    y: node.position.y + 80,
  });
 
  const getTopPoint = (node) => ({
    x: node.position.x + 120,
    y: node.position.y,
  });
 
  const onNodeDragStop = (event, draggedNode) => {
 
    if (!AUTO_TYPES.includes(draggedNode.type))
      return;
 
    const latestNode = nodes.find(
      n => n.id === draggedNode.id
    );
 
    if (!latestNode)
      return;
 
    const sourcePoint = getBottomPoint(
      latestNode
    );
 
    const targetNode = nodes.find((node) => {
 
      if (node.id === draggedNode.id)
        return false;
 
      if (!AUTO_TYPES.includes(node.type))
        return false;
 
      const targetPoint = getTopPoint(node);
 
      const distance = Math.sqrt(
        Math.pow(
          sourcePoint.x - targetPoint.x,
          2
        ) +
        Math.pow(
          sourcePoint.y - targetPoint.y,
          2
        )
      );
 
      return distance < CONNECT_DISTANCE;
    });
 
    // ---------- CONNECT ----------
 
    if (targetNode) {
 
      // Determine upper and lower nodes based on Y position
      const upperNode = latestNode.position.y < targetNode.position.y
        ? latestNode
        : targetNode;
 
      const lowerNode = latestNode.position.y < targetNode.position.y
        ? targetNode
        : latestNode;
 
      // Check if auto edge already exists between these two (direction: upper -> lower)
      const exists = edges.some(
        edge =>
          edge.data?.auto &&
          edge.source === upperNode.id &&
          edge.target === lowerNode.id
      );
 
      if (!exists) {
 
        const newEdge = {
          id: `auto-${upperNode.id}-${lowerNode.id}`,
          source: upperNode.id,
          target: lowerNode.id,
          hidden: true,
          data: {
            auto: true,
          },
        };
 
        setEdges(prev => [
          ...prev,
          newEdge,
        ]);
 
        // Add linkedFrom badge to the lower node only
        setNodes(prev =>
          prev.map(node =>
            node.id === lowerNode.id
              ? {
                ...node,
                data: {
                  ...node.data,
                  linkedFrom: upperNode.id,
                },
              }
              : node
          )
        );
      }
 
      return;
    }
 
    // ---------- DISCONNECT REMOVED (STEP 1) ----------
    // Dragging far away now does nothing.
  };
 
  const disconnectNode = (nodeId) => {
 
    setEdges((prev) =>
      prev.filter(
        (edge) =>
          !(
            edge.target === nodeId &&
            edge.data?.auto
          )
      )
    );
 
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? {
            ...node,
            data: {
              ...node.data,
              linkedFrom: null,
            },
          }
          : node
      )
    );
  };
 
  // ---------- onNodesChange (STEP 2) ----------
  const onNodesChange = (changes) => {
 
    setNodes((nds) => {
 
      let updatedNodes =
        applyNodeChanges(changes, nds);
 
      changes.forEach((change) => {
 
        if (
          change.type === "position" &&
          change.dragging
        ) {
 
          const movedNode =
            updatedNodes.find(
              n => n.id === change.id
            );
 
          if (!movedNode)
            return;
 
          edges.forEach((edge) => {
 
            if (
              edge.data?.auto
            ) {
 
              // source moved
              if (
                edge.source === movedNode.id
              ) {
 
                updatedNodes =
                  updatedNodes.map(
                    node =>
                      node.id === edge.target
                        ? {
                          ...node,
                          position: {
                            x:
                              node.position.x +
                              change.position.x,
                            y:
                              node.position.y +
                              change.position.y,
                          },
                        }
                        : node
                  );
              }
 
              // target moved
              if (
                edge.target === movedNode.id
              ) {
 
                updatedNodes =
                  updatedNodes.map(
                    node =>
                      node.id === edge.source
                        ? {
                          ...node,
                          position: {
                            x:
                              node.position.x +
                              change.position.x,
                            y:
                              node.position.y +
                              change.position.y,
                          },
                        }
                        : node
                  );
              }
            }
          });
        }
      });
 
      return updatedNodes;
    });
  };
 




  const addNode = (type, position = null) => {
    const nodeTypeMap = {
      "Start": "startNode",
      "Text Msg": "textNode",
      "WA Buttons": "waButtonsNode",
      "Input": "inputNode",
      "Condition": "conditionNode",
      "WA Media": "waMediaNode",
      "WA Template": "waTemplateNode",
      "WA List": "waListNode",
      "API": "apiNode",
      "Delay": "delayNode",
      "End Session": "endSessionNode",
      "End Flow": "endFlowNode",
      "Form": "formNode",
      "Flow Transfer": "flowTransferNode",
    };
    const nodeType = nodeTypeMap[type] || "default";

    const baseData = {
      label: type,
      nodeType: nodeType,
      trigger: "",
      message: "",
      prompt: "",
      buttons: [],
      placeholder: "",
      variableName: "",
      variable: "",
      operator: "",
      value: "",
      mediaType: "",
      mediaSource: "",
      mediaUrl: "",
      uploadedPreviewUrl: "",
      uploadedFileName: "",
      caption: "",
      templateName: "",
      language: "",
      headerType: "",
      headerValue: "",
      bodyVariables: [],
      templateButtons: [],
      method: "",
      url: "",
      bodyTemplate: "",
      responseVariable: "",
      headers: [],
      body: "",
      buttonText: "",
      sections: [],
      delayValue: 0,
      delayUnit: "",
      formFields: [],
      targetFlowId: "",
targetFlowName: "",
    };

    switch (type) {
      case "WA Buttons":
        baseData.buttons = ["", ""];
        break;
      case "Input":
        baseData.placeholder = "Type your answer...";
        baseData.variableName = "user_input";
        break;
      case "Condition":
        baseData.variable = "";
        baseData.operator = "==";
        baseData.value = "";
        break;
      case "WA Media":
        baseData.mediaType = "image";
        baseData.mediaSource = "url";
        baseData.mediaUrl = "https://example.com/image.jpg";
        baseData.uploadedPreviewUrl = "";
        baseData.uploadedFileName = "";
        baseData.caption = "";
        break;
      case "WA Template":
        baseData.templateName = "greeting_template";
        baseData.language = "en_US";
        baseData.headerType = "none";
        baseData.headerValue = "";
        baseData.bodyVariables = ["first_name"];
        baseData.templateButtons = [
          { type: "quick_reply", text: "Yes" },
          { type: "quick_reply", text: "No" },
        ];
        break;
      case "WA List":
        baseData.body = "Please pick an option";
        baseData.buttonText = "View options";
        baseData.sections = [{ title: "Menu", rows: ["Option A", "Option B"] }];
        break;
      case "API":
        baseData.method = "POST";
        baseData.url = "/api/score";
        baseData.bodyTemplate = '{"answer":"{{answer}}"}';
        baseData.responseVariable = "api";
        baseData.headers = [];
        break;
      case "Delay":
        baseData.delayValue = 5;
        baseData.delayUnit = "minutes";
        break;
      case "Form":
        baseData.formFields = [
          { label: "Full Name", type: "text", variable: "full_name", required: true },
        ];
        break;
      case "Flow Transfer":
  baseData.targetFlowId = "";
  baseData.targetFlowName = "";
  break;
      default:
        break;
    }

    const newNode = {
      id: `${Date.now()}`,
      position: position || { x: 250, y: 100 + nodes.length * 100 },
      type: nodeType,
      data: baseData,
    };

    setNodes((prev) => [...prev, newNode]);
  };
const openPreview = () => {
  setPreviewNodes(nodes);
  setPreviewEdges(edges);
  setPreviewOpen(true);
};
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const removeEmptyFields = (obj) => {
    const cleaned = {};

    Object.entries(obj).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        return;
      }

      if (Array.isArray(value)) {
        const filteredArray = value
          .map((item) => {
            if (typeof item === "object" && item !== null) {
              return removeEmptyFields(item);
            }
            return item;
          })
          .filter((item) => {
            if (typeof item === "object" && item !== null) {
              return Object.keys(item).length > 0;
            }
            return item !== "";
          });

        if (filteredArray.length > 0) {
          cleaned[key] = filteredArray;
        }
        return;
      }

      if (typeof value === "object" && value !== null) {
        const cleanedObject = removeEmptyFields(value);
        if (Object.keys(cleanedObject).length > 0) {
          cleaned[key] = cleanedObject;
        }
        return;
      }

      cleaned[key] = value;
    });

    return cleaned;
  };
useEffect(() => {
  const draft = localStorage.getItem("flowBuilderDraft");

  if (draft) {
    try {
      const parsed = JSON.parse(draft);

      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
      setFlowName(parsed.flowName || "");
    } catch (err) {
      console.error(err);
    }
  }

  setIsRestored(true);
}, []);
useEffect(() => {
  if (!isRestored) return;

  localStorage.setItem(
    "flowBuilderDraft",
    JSON.stringify({
      nodes,
      edges,
      flowName,
    })
  );
}, [nodes, edges, flowName, isRestored]);

  // ---------- SAVE FLOW TO Mongo ----------
  const saveFlow = async () => {
    try {
      if (!flowName.trim()) {
      alert("Please enter flow name");
      return;
    }
      const cleanedNodes = nodes.map((node) => ({
        ...node,
        type: nodeTypeMap[node.type] || node.type,
        data: removeEmptyFields({
          ...node.data,

          uploadedPreviewUrl: undefined,
          label: undefined,
          nodeType: undefined,
        }),
      }));

      const cleanedEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
        target: edge.target,
      }));
console.log(
  "Payload Size MB:",
  (JSON.stringify(cleanedNodes).length / 1024 / 1024).toFixed(2)
);
      const response = await fetch(
        `http://localhost:7821/api/admin/addFlows/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  name: flowName.trim(),
  trigger: "",
  description: "",
  thumbnail: "",
  nodes: cleanedNodes,
  edges: cleanedEdges,
}),
        }
      );

      const result = await response.json();

      if (result.success) {
  localStorage.removeItem("flowBuilderDraft");

  alert("Flow saved successfully");
  loadFlows();
}else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Save failed");
    }
    
  };

  // ---------- LOAD FLOWS LIST ----------
  const loadFlows = async () => {
    try {
      const response = await fetch(
        `http://localhost:7821/api/admin/flows/${userId}`
      );

      const result = await response.json();

      if (result.success) {
        setFlowsList(result.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ---------- LOAD FLOW BY ID ----------
  const loadFlowById = async (flowId) => {
    try {
      const response = await fetch(
        `http://localhost:7821/api/admin/flow/${flowId}`
      );

      const result = await response.json();

      if (result.success) {
        const convertedNodes = (result.data.nodes || []).map((node) => ({
          ...node,
          type: reverseNodeTypeMap[node.type] || node.type,
        }));

        setNodes(convertedNodes);
        setEdges(result.data.edges || []);
      }
    } catch (error) {
      console.error(error);
    }
  };
const loadPreviewFlowById = async (flowId) => {
  try {
    const response = await fetch(
      `http://localhost:7821/api/admin/flow/${flowId}`
    );

    const result = await response.json();
 console.log("FLOW LOADED:", result.data.name);
    console.log("NODES:", result.data.nodes);
    console.log("EDGES:", result.data.edges);
    if (!result.success) return;

    const convertedNodes = (result.data.nodes || []).map(
      (node) => ({
        ...node,
        type:
          reverseNodeTypeMap[node.type] ||
          node.type,
      })
    );

    setPreviewNodes(convertedNodes);
    setPreviewEdges(result.data.edges || []);

  } catch (err) {
    console.error(err);
  }
};
  // ---------- EXPORT META JSON ----------
  const handleExportMetaJson = () => {
    try {
      const cleanedNodes = nodes.map((node) => ({
        ...node,
        type: nodeTypeMap[node.type] || node.type,
        data: removeEmptyFields({
          ...node.data,

    uploadedPreviewUrl: undefined,
          label: undefined,
          nodeType: undefined,
        }),
      }));

      const cleanedEdges = edges.map((edge) => ({
        source: edge.source,
        sourceHandle: edge.sourceHandle ?? null,
        target: edge.target,
        targetHandle: edge.targetHandle ?? null,
      }));


      const exportData = {
        version: "1.0",
        flowName: "My Flow",
        exportedAt: new Date().toISOString(),
        nodes: cleanedNodes,
        connections: cleanedEdges,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meta-flow-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert("Meta JSON exported successfully!");
    } catch (error) {
      console.error(error);
      alert("Export failed.");
    }
  };

  // ---------- IMPORT META JSON ----------
  const handleImportMetaJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        const importedNodes = (importedData.nodes || []).map((node, index) => ({
          ...node,


          // IMPORTANT: preview runtime (NewFlowBuilder/preview) expects node.type like
          // startNode/textNode/waButtonsNode/... (not start/message/wa_buttons/...)
          type: reverseNodeTypeMap[node.type] || node.type,
          position: {
            x: 250 + (index % 3) * 350,
            y: 100 + Math.floor(index / 3) * 200,
          },
        }));
        const sourceList =
          importedData.connections ?? importedData.edges ?? [];

        const importedEdges = (sourceList || []).map((connection, index) => ({
          id: connection.id ?? `imported-edge-${index}`,
          source: connection.source,
          sourceHandle: connection.sourceHandle ?? null,
          target: connection.target,
          targetHandle: connection.targetHandle ?? null,
        }));



        setNodes(importedNodes);

        // Debug: see if edges are present but not rendering due to missing handle ids
        console.log("Imported connections(raw):", importedData?.connections);
        console.log("Imported edges(after map):", importedEdges);

        setEdges(importedEdges);

        alert("Meta JSON imported successfully!");
      } catch (error) {
        console.error(error);
        alert("Invalid Meta JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // ---------- USE EFFECT ----------
  useEffect(() => {
    if (userId) {
      loadFlows();
    }
  }, [userId]);
console.log("PARENT NODES:", nodes);
console.log("PARENT LENGTH:", nodes?.length);
  return (
    <>
      <div className="header">Flow Builder</div>

      <div className="toolbar">
        <button onClick={saveFlow}>SAVE</button>
        {/* <button onClick={() => {
          const flowId = prompt("Enter Flow ID to load:");
          if (flowId) loadFlowById(flowId);
        }}>Load</button> */}
        <button onClick={openPreview}>PREVIEW</button>
        <button onClick={handleExportMetaJson}>EXPORT META JSON</button>
        <button onClick={() => fileInputRef.current.click()}>
          IMPORT META JSON
        </button>
        <button onClick={() => fitFunction?.()}>FIT</button>

        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImportMetaJson}
        />
         <input
    type="text"
    placeholder="Enter Flow Name"
    value={flowName}
    onChange={(e) => setFlowName(e.target.value)}
    className="flow-name-input"
  />
      </div>

      <div className="container">
        <Sidebar addNode={addNode} onDragStart={onDragStart} />

        <FlowCanvas
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          setSelectedNode={setSelectedNode}
          onNodeDragStop={onNodeDragStop}
          disconnectNode={disconnectNode}
          onNodesChange={onNodesChange}  
 
          addNode={addNode}
          setFitFunction={setFitFunction}
        />

        <Inspector
          selectedNode={selectedNode}
          setNodes={setNodes}
          setSelectedNode={setSelectedNode}
          flowsList={flowsList}
        />
      </div>

      <PreviewModal
  isOpen={previewOpen}
  onClose={() => setPreviewOpen(false)}
 nodes={previewNodes}
    edges={previewEdges}
    loadFlowById={loadPreviewFlowById}
/>
    </>
  );
}

export default NewFlowBuilder;