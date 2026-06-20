import { Handle, Position } from "@xyflow/react";

export default function FlowTransferNode({ data }) {
  return (
    <div
      style={{
        padding: "12px",
        border: "2px solid #7c3aed",
        borderRadius: "10px",
        background: "#f3e8ff",
        minWidth: "180px",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
      />

      <div
        style={{
          fontWeight: "bold",
          marginBottom: "5px",
        }}
      >
        🔀 Flow Transfer
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#666",
        }}
      >
        {data.targetFlowName
          ? `Flow: ${data.targetFlowName}`
          : "No target flow selected"}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
      />
    </div>
  );
}