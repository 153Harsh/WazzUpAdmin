import {
    Handle,
    Position,
} from "@xyflow/react";
function DelayNode({ data }) {
    return (
        <div className="delay-card">
            <Handle
                type="target"
                position={Position.Top}
            />
            <div className="delay-title">
                ⏳ Delay
            </div>
            <div className="delay-value">
                Wait
                {" "}
                {data.delayValue}
                {" "}
                {data.delayUnit}
            </div>
            <div className="delay-info">
                Then continue
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
            />
        </div>
    );
}
export default DelayNode;