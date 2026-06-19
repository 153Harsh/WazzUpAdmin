const blocks = [
    "Start",
    "WA Template",
    "WA Buttons",
    "WA List",
    "WA Media",
    "Text Msg",
    "Input",
    "Condition",
    "API",
    "Delay",
    "End Session",
    "End Flow",
    "Form",
];

function Sidebar({ addNode, onDragStart }) {
    return (
        <div className="sidebar">
            <h4 className="font-medium text-black">BLOCKS</h4>
            <div className="sidebar-grid">
                {blocks.map((block) => (
                    <div
                        key={block}
                        className="sidebar-item"
                        draggable
                        onClick={() => addNode(block)}
                        onDragStart={(event) => onDragStart(event, block)}
                    >
                        {block}
                    </div>
                ))}
            </div>
            <div class="mt-3 text-[13px] text-gray-500">Drag a block onto the canvas</div>
        </div>
    );
}

export default Sidebar;