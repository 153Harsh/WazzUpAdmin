import { Handle, Position } from "@xyflow/react";

function EndSessionNode() {
    return (
        <div className="end-session-card">
            <Handle
                type="target"
                position={Position.Top}
            />

            <div className="end-session-title">
                🔴 End Session
            </div>

            <div className="end-session-text">
                Thank You! Restart conversation.
            </div>
        </div>
    );
}
export default EndSessionNode;