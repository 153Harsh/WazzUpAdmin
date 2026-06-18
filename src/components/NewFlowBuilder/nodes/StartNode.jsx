import { Handle, Position } from "@xyflow/react";

export default function StartNode({ id, data }) {
  const handleTriggerChange = (e) => {
    if (data?.onChange) {
      data.onChange(id, {
        ...data,
        trigger: e.target.value,
      });
    }
  };

  return (
    <div
      style={{
        padding: "12px",
        border: "2px solid #28a745",
        borderRadius: "8px",
        background: "#fff",
        minWidth: "180px",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          color: "#28a745",
          marginBottom: "8px",
        }}
      >
        Start
      </div>

      <input
        type="text"
        placeholder="Enter trigger (#testing)"
        value={data?.trigger || ""}
        onChange={handleTriggerChange}
        style={{
          width: "100%",
          padding: "6px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />

      <Handle
        type="source"
        position={Position.Right}
      />
    </div>
  );
}