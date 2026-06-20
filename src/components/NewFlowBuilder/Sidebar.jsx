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
    "Flow Transfer"
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
            <div className="sidebar-tips">
                <h3>Tips</h3>
 
                <ul>
                    <li>◉ Buttons support up to 3 options and 20 characters.</li>
 
                    <li>◉ List messages support up to 10 rows per section.</li>
 
                    <li>
                        ◉ Media blocks support both URL and File Upload
                        sources.
                    </li>
                </ul>
            </div>
 
        </div>
    );
}

export default Sidebar;