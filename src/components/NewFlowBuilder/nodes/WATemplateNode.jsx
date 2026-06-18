import {
    Handle,
    Position,
} from "@xyflow/react";

function WATemplateNode({ data }) {
    const buttons = data.templateButtons || [];

    return (
        <div className="wa-template-card">

            <Handle
                type="target"
                position={Position.Top}
            />

            <div className="wa-template-title">
                🟣 WA Template (HSM)
            </div>

            <div className="wa-template-name">
                {data.templateName || "template"}
                {" • "}
                {data.language || "en_US"}
            </div>

            <div className="wa-template-info">
                Header: {data.headerType || "none"}
            </div>

            <div className="wa-template-info">
                Body Vars:
                {" "}
                {data.bodyVariables?.length || 0}
            </div>

            <div className="wa-template-info">
                Buttons:
                {" "}
                {buttons.length}
            </div>

            {buttons.map((button, index) => (
                <div
                    key={index}
                    style={{
                        position: "relative",
                        marginTop: "8px",
                        paddingRight: "18px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "12px",
                            background: "#f5f5f5",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                        }}
                    >
                        {button.text}
                    </div>

                    <Handle
                        type="source"
                        position={Position.Right}
                        id={`button-${index}`}
                        style={{
                            top: "50%",
                            background: "#52c41a",
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

export default WATemplateNode;