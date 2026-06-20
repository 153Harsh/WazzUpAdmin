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
import FlowTransferNode from "./nodes/FlowTransferNode";

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
    flowTransferNode: FlowTransferNode,
};

function FlowCanvasInner({
    nodes,
    setNodes,
    edges,
    setEdges,
    setSelectedNode,
    addNode,
    setFitFunction,
    onNodeDragStop,
    disconnectNode,
 
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

    const getConnectedNodes = (
        nodeId,
        edges,
        visited = new Set()
    ) => {
        visited.add(nodeId);
 
        edges.forEach((edge) => {
            if (!edge.data?.auto) return;
 
            if (
                edge.source === nodeId &&
                !visited.has(edge.target)
            ) {
                getConnectedNodes(
                    edge.target,
                    edges,
                    visited
                );
            }
 
            if (
                edge.target === nodeId &&
                !visited.has(edge.source)
            ) {
                getConnectedNodes(
                    edge.source,
                    edges,
                    visited
                );
            }
        });
 
        return visited;
    };
 
    // ---------- onNodesChange – moves entire connected chain together ----------
    const onNodesChange = (changes) => {
        setNodes((nds) => {
            // First apply the position changes to the dragged node
            let updatedNodes = applyNodeChanges(changes, nds);
 
            // Now process each position change that is a drag
            changes.forEach((change) => {
                if (
                    change.type !== "position" ||
                    !change.dragging
                ) {
                    return;
                }
 
                // Find the node that was dragged (using the original state before changes)
                const movedNode = nds.find(
                    n => n.id === change.id
                );
                if (!movedNode) return;
 
                // Get all nodes connected via auto edges (including the moved node)
                const connectedIds = getConnectedNodes(
                    movedNode.id,
                    edges
                );
 
                // Calculate the delta (how much the node moved)
                const deltaX = change.position.x - movedNode.position.x;
                const deltaY = change.position.y - movedNode.position.y;
 
                // Move every connected node by the same delta,
                // except the dragged node itself (already updated by applyNodeChanges)
                updatedNodes = updatedNodes.map((node) => {
                    if (node.id === movedNode.id) {
                        return node; // keep the already updated position
                    }
                    if (connectedIds.has(node.id)) {
                        return {
                            ...node,
                            position: {
                                x: node.position.x + deltaX,
                                y: node.position.y + deltaY,
                            },
                        };
                    }
                    return node;
                });
            });
 
            return updatedNodes;
        });
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
                nodes={nodes.map(node => ({
                    ...node,
                    data: {
                        ...node.data,
                        disconnectNode,
                        nodeId: node.id,
                    }
                }))}
                edges={edges.filter(
                    edge => !edge.hidden
                )}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onNodeDragStop={onNodeDragStop}
                onDragOver={onDragOver}
                onNodeClick={(event, node) => {
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