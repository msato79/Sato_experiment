import React, { useMemo } from 'react';
import { GraphData } from '../csv';

interface GraphInfoPanelProps {
  graphData: GraphData;
  highlightedNodes: number[];
  startNode?: number;
  targetNode?: number;
}

/**
 * Calculate node degree (number of edges connected to a node)
 */
function calculateNodeDegree(graphData: GraphData, nodeId: number): number {
  return graphData.edges.filter(
    edge => edge.from === nodeId || edge.to === nodeId
  ).length;
}

export function GraphInfoPanel({ graphData, highlightedNodes, startNode, targetNode }: GraphInfoPanelProps) {
  const nodeCount = graphData.nodes.length;
  const edgeCount = graphData.edges.length;
  
  const nodeDegrees = useMemo(() => {
    const degrees: Record<number, number> = {};
    highlightedNodes.forEach(nodeId => {
      degrees[nodeId] = calculateNodeDegree(graphData, nodeId);
    });
    return degrees;
  }, [graphData, highlightedNodes]);

  // Determine node color based on start/target node
  const getNodeColor = (nodeId: number) => {
    if (startNode !== undefined && nodeId === startNode) {
      return 'text-green-600'; // Green for start node
    }
    if (targetNode !== undefined && nodeId === targetNode) {
      return 'text-blue-600'; // Blue for target node
    }
    return 'text-gray-700'; // Default color
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg p-3 text-sm">
      <div className="font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">
        グラフ情報
      </div>
      <div className="space-y-1 text-gray-700">
        <div className="flex justify-between">
          <span>ノード数:</span>
          <span className="font-medium">{nodeCount}</span>
        </div>
        <div className="flex justify-between">
          <span>エッジ数:</span>
          <span className="font-medium">{edgeCount}</span>
        </div>
        {highlightedNodes.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300">
            <div className="font-semibold text-gray-800 mb-1">ハイライトノードの次数:</div>
            {highlightedNodes.map(nodeId => (
              <div key={nodeId} className="flex justify-between items-center">
                <span className={getNodeColor(nodeId)}>
                  ノード <span className="font-bold">{nodeId}</span>:
                </span>
                <span className="font-medium">{nodeDegrees[nodeId] ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

