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
                    marginTop: "10px",
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