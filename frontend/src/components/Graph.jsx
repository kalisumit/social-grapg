import { useEffect, useState, useCallback, useContext } from "react";
import { ReactFlow, Controls, MiniMap, Background, addEdge, applyNodeChanges, applyEdgeChanges, BackgroundVariant } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { getGraph } from "../services/graphApi";
import { UserContext } from "../context/UserContext";
import HighScoreNode from "./nodes/HighScoreNode";
import LowScoreNode from "./nodes/LowScoreNode";

function Graph() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [error, setError] = useState(null);

    // Load saved positions from localStorage on mount
    const [savedPositions, setSavedPositions] = useState(() => {
        try {
            const saved = localStorage.getItem('graphNodePositions');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Error loading saved positions:', e);
            return {};
        }
    });
    const [hoveredNodeId, setHoveredNodeId] = useState(null);

    const { refreshKey, updateUserHobbies, showToast, users, selectUser } = useContext(UserContext);

    const [onNode, setOnNode] = useState()
    const [onEdge, setOnEdge] = useState()
    const nodeTypes = {
        highScore: HighScoreNode,
        lowScore: LowScoreNode,
    }

    const onConnect = useCallback((connection) => {
        setEdges((eds) => addEdge(connection, eds));
    }, []);

    const onNodesChange = useCallback(
        (changes) => {
            setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));

            // Update savedPositions separately to avoid interfering with drag operations
            changes.forEach(change => {
                if (change.type === 'position' && change.position) {
                    setSavedPositions(prev => {
                        const updated = {
                            ...prev,
                            [change.id]: change.position
                        };
                        // Persist to localStorage
                        try {
                            localStorage.setItem('graphNodePositions', JSON.stringify(updated));
                        } catch (e) {
                            console.error('Error saving positions:', e);
                        }
                        return updated;
                    });
                }
            });
        },
        [],
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );

    const loadGraph = useCallback(async () => {
        try {
            const data = await getGraph();

            // Load current saved positions from localStorage (fresh copy)
            let currentPositions = {};
            try {
                const saved = localStorage.getItem('graphNodePositions');
                if (saved) {
                    currentPositions = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Error loading positions from localStorage:', e);
            }

            // Validate nodes and add default positions if missing
            const nodesWithData = (data.nodes || []).map((node, index) => {
                // Restore saved position, or use default if not saved
                const position = currentPositions[node.id] || node.position || {
                    x: (index % 5) * 250,
                    y: Math.floor(index / 5) * 150,
                };

                // Determine node type based on popularity score
                const popularityScore = node.data?.popularityScore || 0;
                const nodeType = popularityScore > 5 ? "highScore" : "lowScore";

                return {
                    ...node,
                    position,
                    type: nodeType,
                    data: node.data || { label: node.id },
                };
            });

            setNodes(nodesWithData);
            setEdges(data.edges || []);
            setError(null);
        } catch (error) {
            console.error("Error loading graph:", error);
            setError(error.message);
        }
    }, []);

    useEffect(() => {
        loadGraph();
    }, [loadGraph, refreshKey]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        // Check if hovering over a React Flow node
        const target = e.target.closest('[data-id]');
        if (target) {
            const nodeId = target.getAttribute('data-id');
            if (nodeId && nodes.some(n => n.id === nodeId)) {
                setHoveredNodeId(nodeId);
                return;
            }
        }
        setHoveredNodeId(null);
    }, [nodes]);

    const handleDragLeave = useCallback((e) => {
        // Only clear hovered node if leaving the entire graph container
        if (e.currentTarget === e.target) {
            setHoveredNodeId(null);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const hobby = e.dataTransfer.getData('hobby');

        if (!hobby) {
            showToast('Invalid drop data', 'error');
            return;
        }

        // Use the currently hovered node or ask user to select
        if (!hoveredNodeId) {
            showToast('Please drop the hobby on a user node', 'error');
            return;
        }

        // Find the actual user from the users array to get real hobbies
        const user = users.find(u => u._id === hoveredNodeId);
        if (!user) {
            showToast('User not found', 'error');
            return;
        }

        const currentHobbies = user.hobbies || [];
        if (currentHobbies.includes(hobby)) {
            showToast('Hobby already added to this user', 'error');
            return;
        }

        const updatedHobbies = [...currentHobbies, hobby];
        updateUserHobbies(hoveredNodeId, updatedHobbies);
        setHoveredNodeId(null);
    }, [users, updateUserHobbies, showToast, hoveredNodeId]);

    const handleNodeClick = useCallback((event, node) => {
        selectUser(node.id);
        showToast(`Selected ${node.data?.username || node.id}`, 'success');
    }, [selectUser, showToast]);

    if (error) {
        return (
            <div className="h-full w-full rounded-xl overflow-hidden bg-white shadow-lg flex items-center justify-center">
                <div className="text-center text-red-600">
                    <p className="font-semibold">Error loading graph</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="bg-gray-200 relative" style={{ flex: 1, width: '100%', height: '100%' }}>
                {hoveredNodeId && (
                    <div className="absolute top-2 left-2 bg-gray-200 border-2 border-slate-600 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium z-50">
                        ✓ Drop hobby here
                    </div>
                )}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onConnect={onConnect}
                    fitView
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={handleNodeClick}
                >
                    <MiniMap />
                    <Controls />
                    <Background variant={BackgroundVariant.Dots} />
                </ReactFlow>
            </div>
        </div>
    );
}

export default Graph;