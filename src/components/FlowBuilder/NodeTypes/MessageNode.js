// components/FlowBuilder/NodeTypes/MessageNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { getNodeBgAndBorder } from '../../NewFlowBuilder/nodes/nodeStyleUtils';


const MessageNode = ({ data }) => {
  const { bg, border } = getNodeBgAndBorder('textNode');

  const nodeCommon = {
    style: {
      borderRadius: 14,
      border: `2px solid ${border}`,
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      padding: 8,
      background: bg,
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
      fontSize: 13,
    },
  };

  const Header1 = ({ title, accent = "#111827" }) => (
    <div className="flex items-center gap-2 mb-1">
      <div style={{ width: 8, height: 8, borderRadius: 999, background: accent }} />
      <div className="text-[12px] font-semibold text-gray-800">{title}</div>
    </div>
  );

  return (
    <div {...nodeCommon} className="min-w-[240px]">
      <Header1 title="Text Message" accent={border} />

      <div className="text-[12px] whitespace-pre-wrap text-gray-800">
        {data.text || "Your message..."}
      </div>
      <div className="text-[11px] text-gray-500 mt-1">≤ 4096 chars</div>
      <Handle type="target" position={Position.Top} id="in" />
      <Handle type="source" position={Position.Bottom} id="out" />
    </div>
  );
};

export default MessageNode;