import {
    Handle,
    Position,
} from "@xyflow/react";
 
function InputNode({
    data,
}) {
    return (
        <div
            style={{
                background: "#eef2ff",
                border: "1px solid #6366f1",
                borderRadius: "10px",
                padding: "10px",
                width: "180px",
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
                    marginBottom: "8px",
                }}
            >
                ● Input
            </div>
            <div>
                Variable:
 
                {" "}
 
                {
                    data.variableName ||
 
                    "user_input"
                }
            </div>
 
            <div
                style={{
                    marginTop: "8px",
                    color: "#777",
                }}
            >
                {
                    data.placeholder ||
 
                    "Enter value"
                }
            </div>
 
            <Handle
                type="source"
                position={Position.Bottom}
            />
        </div>
    );
}
 
export default InputNode;
 