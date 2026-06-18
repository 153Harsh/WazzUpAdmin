import { Handle, Position } from "@xyflow/react";

function WAButtonsNode({ data }) {
    return (
        <div
            style={{
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "15px",
                width: "280px",
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
                ● WA Quick Replies (≤3)
            </div>

            <div
                style={{
                    marginBottom: "15px",
                }}
            >
                {
                    data.prompt ||
                    "Prompt goes here"
                }
            </div>

            {
                (data.buttons || []).map(
                    (
                        button,
                        index
                    ) => (
                        <div
                            key={index}
                            style={{
                                padding: "8px",
                                border: "1px solid #ddd",
                                marginBottom: "8px",
                                borderRadius: "8px",
                            }}
                        >
                            {
                                button ||
                                "Button"
                            }
                        </div>
                    )
                )
            }

            <div
                style={{
                    marginTop: "10px",
                    color: "#777",
                    fontSize: "12px",
                }}
            >
                Each title ≤ 20 chars
            </div>

            {
                (
                    data.buttons || []
                ).map(

                    (
                        button,
                        index
                    ) => (

                        <Handle

                            key={index}

                            type="source"

                            id={`button-${index}`}

                            position={Position.Right}

                            style={{

                                top:
                                    120 +
                                    index * 45,

                                background:
                                    "#555",
                            }}

                        />

                    )

                )
            }
        </div>
    );
}

export default WAButtonsNode;