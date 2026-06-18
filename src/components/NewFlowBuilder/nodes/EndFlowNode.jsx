import { Handle, Position } from "@xyflow/react";

export default function EndFlowNode() {
    return (
        <div
            style={{
                padding: "10px 15px",
                border: "2px solid #843333",
                borderRadius: "8px",
                background: "#ffffff",
                fontWeight: "bold",
                textAlign: "center",
                minWidth: "120px",
            }}
        >
            End Flow

            <Handle
                type="target"
                position={Position.Left}
            />
        </div>
    );
}