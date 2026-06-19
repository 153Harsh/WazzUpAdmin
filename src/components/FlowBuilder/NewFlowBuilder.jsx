import { useState, useRef, useEffect } from "react";
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
};

function NewFlowBuilder() {
  const { id: userId } = useParams();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [flowsList, setFlowsList] = useState([]);
  const [fitFunction, setFitFunction] = useState(null);
  const fileInputRef = useRef(null);
const [flowName, setFlowName] = useState("");
  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);

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
        alert("Flow saved successfully");
        loadFlows();
      } else {
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

  return (
    <>
      <div className="header">Flow Builder</div>

      <div className="toolbar">
        <button onClick={saveFlow}>Save</button>
        {/* <button onClick={() => {
          const flowId = prompt("Enter Flow ID to load:");
          if (flowId) loadFlowById(flowId);
        }}>Load</button> */}
        <button onClick={() => setPreviewOpen(true)}>Preview</button>
        <button onClick={handleExportMetaJson}>Export Meta JSON</button>
        <button onClick={() => fileInputRef.current.click()}>
          Import Meta JSON
        </button>
        <button onClick={() => fitFunction?.()}>Fit</button>

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
          addNode={addNode}
          setFitFunction={setFitFunction}
        />

        <Inspector
          selectedNode={selectedNode}
          setNodes={setNodes}
          setSelectedNode={setSelectedNode}
        />
      </div>

      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        nodes={nodes}
        edges={edges}
      />
    </>
  );
}

export default NewFlowBuilder;