import { Handle, Position } from "@xyflow/react";

function TextNode({ data }) {
    return (
        <div
            style={{
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "15px",
                width: "250px",
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
            />

            <div
                style={{
                    color: "#4a90e2",
                    fontWeight: "bold",
                    marginBottom: "10px",
                }}
            >
                ● Text Message
            </div>

            <div>
                {
                    data.message ||
                    "Your message..."
                }
            </div>

            <div
                style={{
                    marginTop: "10px",
                    color: "#777",
                    fontSize: "12px",
                }}
            >
                ≤ 4096 chars
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
            />
        </div>
    );
}

export default TextNode;