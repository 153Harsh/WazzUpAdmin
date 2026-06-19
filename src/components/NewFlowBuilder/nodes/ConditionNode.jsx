import {
    Handle,
    Position,
} from "@xyflow/react";
 
function ConditionNode({
    data,
}) {
 
    return (
 
        <div
            style={{
                background: "#fff7ed",
                border: "2px solid #f97316",
                borderRadius: "12px",
                padding: "10px",
                width: "160px",
            }}
        >
 
            <Handle
                type="target"
                position={Position.Top}
            />
 
            <div
                style={{
                    fontWeight: "bold",
                    color: "orange",
                }}
            >
                ◆ Condition
            </div>
 
            <div
                style={{
                    marginTop: "8px",
                }}
            >
 
                {
 
                    data.variable ||
 
                    "variable"
 
                }
 
                {" "}
 
                {
 
                    data.operator ||
 
                    "=="
 
                }
 
                {" "}
 
                {
 
                    data.value ||
 
                    "value"
 
                }
 
            </div>
 
            <Handle
                type="source"
                id="true"
                position={Position.Left}
                style={{
                    background: "green",
                }}
            />
 
            <Handle
                type="source"
                id="false"
                position={Position.Right}
                style={{
                    background: "red",
                }}
            />
 
        </div>
 
    );
 
}
 
export default ConditionNode;
 