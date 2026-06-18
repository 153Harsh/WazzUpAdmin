import "./App.css";
import { useState, useRef } from "react";

import Sidebar from "./components/Sidebar";
import FlowCanvas from "./components/FlowCanvas";
import Inspector from "./components/Inspector";
import PreviewModal from "./components/preview/PreviewModal";

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

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

  const [fitFunction, setFitFunction] = useState(null);

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

  // ---------- SAVE FLOW TO FLASK + MYSQL ----------
  const saveFlow = async () => {
    try {
      const cleanedNodes = nodes.map((node) => ({
        id: node.id,
        position: node.position,
        type: node.type,  // ✅ FIXED: node.type is already correct
        data: removeEmptyFields({
          ...node.data,
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

      const response = await fetch("http://127.0.0.1:5000/api/flows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "My Flow",
          nodes: cleanedNodes,
          edges: cleanedEdges,
        }),
      });

      const data = await response.json();
      alert(`Saved Successfully!\nFlow ID: ${data.id}`);
    } catch (error) {
      console.error(error);
      alert("Save failed.");
    }
  };

  // ---------- LOAD FLOW FROM FLASK ----------
  const loadFlow = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/flows");
      const flows = await response.json();

      if (flows.length === 0) {
        alert("No saved flows found.");
        return;
      }

      const latestFlow = flows[0];
      const flowData = JSON.parse(latestFlow.flow_json);

      setNodes(flowData.nodes || []);
      setEdges(flowData.edges || []);

      alert(`Loaded Flow ID: ${latestFlow.id}`);
    } catch (error) {
      console.error(error);
      alert("Load failed.");
    }
  };

  // ---------- EXPORT META JSON ----------
  const handleExportMetaJson = () => {
    try {
      const cleanedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type,  // ✅ FIXED: node.type is already correct
        data: removeEmptyFields({
          ...node.data,
          label: undefined,
          nodeType: undefined,
        }),
      }));

      const cleanedEdges = edges.map((edge) => ({
        source: edge.source,
        sourceHandle: edge.sourceHandle ?? null,
        target: edge.target,
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
  const fileInputRef = useRef(null);
  const handleImportMetaJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        const importedNodes = (importedData.nodes || []).map((node, index) => ({
          ...node,
          position: {
            x: 250 + (index % 3) * 350,
            y: 100 + Math.floor(index / 3) * 200,
          },
        }));
        const importedEdges =
          importedData.connections?.map((connection, index) => ({
            id: `imported-edge-${index}`,
            source: connection.source,
            sourceHandle: connection.sourceHandle ?? null,
            target: connection.target,
          })) || [];

        setNodes(importedNodes);
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

  return (
    <>
      <div className="header">Flow Builder</div>

      <div className="toolbar">
        <button onClick={saveFlow}>Save</button>
        <button onClick={loadFlow}>Load</button>
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

export default App;