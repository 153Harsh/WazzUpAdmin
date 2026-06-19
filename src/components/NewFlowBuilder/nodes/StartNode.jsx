import { Handle, Position } from "@xyflow/react";

export default function StartNode({ data }) {

  return (
    <div
      style={{
        padding: "2px",
        border: "2px solid #28a745",
        borderRadius: "4px",
        background: "#fff",
        minWidth: "70px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontWeight: "600",
          color: "#28a745",
          fontSize: "11px",
          marginBottom: "2px",
        }}
      >
        Start
      </div>
 
      <Handle
        type="source"
        position={Position.Right}
      />
    </div>
  );
}