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
                background: "white",
                border: "2px solid orange",
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
                    fontWeight: "bold",
                    color: "orange",
                }}
            >
                ◆ Condition
            </div>

            <div
                style={{
                    marginTop: "10px",
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