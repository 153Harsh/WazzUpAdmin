import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { useEffect } from "react";

import StartNode from "./nodes/StartNode";
import TextNode from "./nodes/TextNode";
import WAButtonsNode from "./nodes/WAButtonsNode";
import InputNode from "./nodes/InputNode";
import ConditionNode from "./nodes/ConditionNode";
import WAMediaNode from "./nodes/WAMediaNode";
import WATemplateNode from "./nodes/WATemplateNode";
import WAListNode from "./nodes/WAListNode";
import APINode from "./nodes/APINode";
import DelayNode from "./nodes/DelayNode";
import FormNode from "./nodes/FormNode";
import EndFlowNode from "./nodes/EndFlowNode";
import EndSessionNode from "./nodes/EndSessionNode";

const nodeTypes = {
    startNode: StartNode,
    endFlowNode: EndFlowNode,
    textNode: TextNode,
    waButtonsNode: WAButtonsNode,
    inputNode: InputNode,
    conditionNode: ConditionNode,
    waMediaNode: WAMediaNode,
    waTemplateNode: WATemplateNode,
    waListNode: WAListNode,
    apiNode: APINode,
    delayNode: DelayNode,
    endSessionNode: EndSessionNode,
    formNode: FormNode,
};

function FlowCanvasInner({
    nodes,
    setNodes,
    edges,
    setEdges,
    setSelectedNode,
    addNode,
    setFitFunction,
}) {
    const { screenToFlowPosition, fitView } =
        useReactFlow();

    useEffect(() => {
        if (setFitFunction) {
            setFitFunction(() => () => {
                fitView({
                    padding: 0.2,
                    duration: 500,
                });
            });
        }
    }, [fitView, setFitFunction]);

    const onNodesChange = (changes) => {
        setNodes((nds) =>
            applyNodeChanges(changes, nds)
        );
    };

    const onEdgesChange = (changes) => {
        setEdges((eds) =>
            applyEdgeChanges(changes, eds)
        );
    };

    const onConnect = (params) => {
        setEdges((eds) =>
            addEdge(params, eds)
        );
    };

    const onDrop = (event) => {
        event.preventDefault();

        const type = event.dataTransfer.getData(
            "application/reactflow"
        );

        if (!type) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        addNode(type, position);
    };

    const onDragOver = (event) => {
        event.preventDefault();

        event.dataTransfer.dropEffect =
            "move";
    };

    return (
        <div
            className="canvas"
            style={{
                width: "100%",
                height: "100%",
            }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={(
                    event,
                    node
                ) => {
                    setSelectedNode(node);
                }}
                fitView
            >
                <Background />

                <Controls />
            </ReactFlow>
        </div>
    );
}

function FlowCanvas(props) {
    return (
        <ReactFlowProvider>
            <FlowCanvasInner
                {...props}
            />
        </ReactFlowProvider>
    );
}

export default FlowCanvas;