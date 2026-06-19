import { Handle, Position } from "@xyflow/react";

function FormNode({ data }) {
    return (
        <div
            style={{
                padding: "15px",
                border: "2px solid #059669",
                borderRadius: "10px",
                background: "#ecfdf5",
                width: "250px",
            }}
        >
            <Handle type="target" position={Position.Top} />

            <strong>📝 Form</strong>

            <div style={{ marginTop: "10px" }}>
                {(data.formFields || []).map((field, i) => (
                    <div key={i}>
                        • {field.label}
                    </div>
                ))}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
            />
        </div>
    );
}

export default FormNode;