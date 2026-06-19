import { Handle, Position } from "@xyflow/react";
import { getNodeBgAndBorder } from "./nodeStyleUtils";

export default function StartNode({ data }) {
  const { bg, border } = getNodeBgAndBorder(data?.nodeType);

  return (
    <div
      style={{
        padding: "12px",
        border: `2px solid ${border}`,
        borderRadius: "8px",
        background: bg,
        minWidth: "180px",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          color: border,
          marginBottom: "8px",
        }}
      >
        Start
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#666",
        }}
      >
        Flow Entry Point
      </div>

      <Handle
        type="source"
        position={Position.Right}
      />
    </div>
  );
}