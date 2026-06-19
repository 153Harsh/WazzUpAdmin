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
 