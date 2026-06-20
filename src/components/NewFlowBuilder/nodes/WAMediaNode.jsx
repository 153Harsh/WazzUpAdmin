import { Handle, Position } from "@xyflow/react";
 
function WAMediaNode({ data }) {
    return (
        <div className="wa-media-card">
            <Handle
                type="target"
                position={Position.Top}
            />
 
            <div className="wa-media-title">
                🟠 WA Media
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
 
            <div className="wa-media-url">
                {data.mediaType?.toUpperCase()}
                {" → "}
                {
                    data.mediaSource === "upload"
                        ? data.uploadedFileName
                        : data.mediaUrl
                }
            </div>
 
            <div className="wa-media-support">
                Supports image/video/document/audio/sticker
            </div>
 
            <Handle
                type="source"
                position={Position.Bottom}
            />
        </div>
    );
}
 
export default WAMediaNode;
 
 