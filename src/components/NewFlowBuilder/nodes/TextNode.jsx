import { Handle, Position } from "@xyflow/react";
 
function TextNode({ data }) {
    return (
        <div
            style={{
                background: "#fdf2f8",
                border: "2px solid #ec4899",
                borderRadius: "10px",
                padding: "10px",
                width: "200px",
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
            />
 
            <div
                style={{
                    color: "#db2777",
                    fontWeight: "600",
                    fontSize: "13px",
                    marginBottom: "8px",
                }}
            >
                💬 Text Message
            </div>
            {data.linkedFrom && (
                <div
                    onClick={() =>
                        data.disconnectNode(
                            data.nodeId
                        )
                    }
                    style={{
                        marginTop: "4px",
                        padding: "2px 4px",
                        background: "#dcfce7",
                        border: "1px solid #22c55e",
                        color: "#15803d",
                        borderRadius: "20px",
                        fontSize: "8px",
                        cursor: "pointer",
                        display: "inline-block",
                    }}
                >
                    🔗 Linked
                </div>
            )}
 
            <div
                style={{
                    fontSize: "12px",
                    color: "#9d174d",
                    lineHeight: "1.4",
                    wordBreak: "break-word",
                }}
            >
                {data.message || "Your message..."}
            </div>
 
            <div
                style={{
                    marginTop: "6px",
                    color: "#be185d",
                    fontSize: "11px",
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
 
 