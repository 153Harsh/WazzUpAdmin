import {
    Handle,
    Position,
} from "@xyflow/react";
 
function WAListNode({ data }) {
    const sections = data.sections || [];
    let handleIndex = 0;
 
    return (
        <div className="wa-list-card">
            <Handle
                type="target"
                position={Position.Top}
            />
 
            <div className="wa-list-title">
                🟢 WA List Message
            </div>
           
            <div className="wa-list-body">
                {data.body}
            </div>
 
            <div className="wa-list-button">
                Button text: {data.buttonText}
            </div>
 
            <div className="wa-list-limit">
                ≤ 10 rows per section
            </div>
 
            {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="wa-list-section">
                    <div className="wa-list-section-title">
                        {section.title}
                    </div>
 
                    <div className="wa-list-rows">
                        {(section.rows || []).map((row, rowIndex) => {
                            const currentHandle = handleIndex++;
 
                            return (
                                <div
                                    key={rowIndex}
                                    style={{
                                        position: "relative",
                                        marginTop: "8px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <span className="wa-list-chip">
                                        {row}
                                    </span>
 
                                    <Handle
                                        type="source"
                                        position={Position.Right}
                                        id={`list-${sectionIndex}-${rowIndex}`}
                                        style={{
                                            top: "50%",
                                            background: "#52c41a",
                                            width: "8px",
                                            height: "8px",
                                            border: "2px solid white",
                                            transform: "translateY(-50%)",
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
 
            <Handle
                type="source"
                position={Position.Bottom}
            />
        </div>
    );
}
 
export default WAListNode;
 