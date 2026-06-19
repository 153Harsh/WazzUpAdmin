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
                            fontSize: "11px",
                            background: "#ffffff",
                            padding: "6px",
                            borderRadius: "6px",
                            border: "1px solid #c4b5fd",
                            textAlign: "center",
                            color: "#7c3aed",
                            fontWeight: "500",
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
 