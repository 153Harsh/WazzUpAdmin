import { Handle, Position } from "@xyflow/react";

export default function EndFlowNode() {
    return (
        <div
            style={{
                padding: "10px 10px",
                border: "2px solid #843333",
                borderRadius: "8px",
                background: "#fdf2f2",
                fontWeight: "bold",
                textAlign: "center",
                minWidth: "80px",
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