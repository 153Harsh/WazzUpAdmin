import { Handle, Position } from "@xyflow/react";
 
function WAButtonsNode({ data }) {
    return (
        <div
            style={{
                background: "#f8fbff",
                border: "2px solid #3b82f6",
                borderRadius: "8px",
                padding: "12px",
                width: "200px",
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
            />
 
            <div
                style={{
                    color: "#2563eb",
                    fontWeight: "600",
                    fontSize: "13px",
                    marginBottom: "10px",
                }}
            >
                🔵 WA Quick Replies
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
                    marginBottom: "12px",
                    fontSize: "12px",
                    lineHeight: "1.4",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    maxWidth: "100%",
                    color: "#333",
                }}
            >
                {data.prompt || "Prompt goes here"}
            </div>
 
            {(data.buttons || []).map((button, index) => (
                <div
                    key={index}
                    style={{
                        position: "relative",
                        marginBottom: "8px",
                        paddingRight: "18px",
                    }}
                >
                    <div
                        style={{
                            padding: "6px",
                            border: "1px solid #93c5fd",
                            borderRadius: "6px",
                            textAlign: "center",
                            color: "#2563eb",
                            fontWeight: "500",
                            background: "#fff",
                            fontSize: "12px",
                        }}
                    >
                        {button || "Button"}
                    </div>
 
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={`button-${index}`}
                        style={{
                            top: "50%",
                            background: "#3b82f6",
                            width: "10px",
                            height: "10px",
                            border: "2px solid white",
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
 
export default WAButtonsNode;
 
 