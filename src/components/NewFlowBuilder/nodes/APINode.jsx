import { Handle, Position } from "@xyflow/react";

function APINode({ data }) {
    return (
        <div className="api-card">
            <Handle type="target" position={Position.Top} />
            <div className="api-title">⚡ API Call</div>
            <div className="api-method">{data.method || "GET"}</div>
            <div className="api-url">{data.url || "https://..."}</div>
            <div className="api-response-var">
                → ctx.{data.responseVariable || "response"}
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="success"
                style={{
                    left: "30%",
                    background: "#22c55e",
                }}
            />

            <Handle
                type="source"
                position={Position.Bottom}
                id="error"
                style={{
                    left: "70%",
                    background: "#ef4444",
                }}
            />
        </div>
    );
}

export default APINode;