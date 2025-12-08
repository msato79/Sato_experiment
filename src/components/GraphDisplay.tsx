import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { GraphData } from '../csv';
import { Condition, AxisOffset, GraphViewerAPI } from '../types/experiment';
import { createGraphViewer } from '../lib/graph-viewer';

interface GraphDisplayProps {
  graphData: GraphData;
  condition: Condition;
  axisOffset: AxisOffset;
  onNodeClick: (nodeId: number) => void;
  highlightedNodes?: number[];
  startNode?: number;
  targetNode?: number;
  skipNormalization?: boolean;
  wiggleFrequencyMs?: number; // Wiggle stereoscopy frequency in milliseconds (for dev mode)
  scaleFactor?: number; // Scale factor for graph size (default: 1.0)
}

export interface GraphDisplayRef {
  setSelectedNodes: (nodes: number[]) => void;
}

export const GraphDisplay = forwardRef<GraphDisplayRef, GraphDisplayProps>(({
  graphData,
  condition,
  axisOffset,
  onNodeClick,
  highlightedNodes = [],
  startNode,
  targetNode,
  skipNormalization = false,
  wiggleFrequencyMs,
  scaleFactor = 1.0,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<GraphViewerAPI | null>(null);
  const [isRotationPaused, setIsRotationPaused] = useState(false);

  // Expose setSelectedNodes method via ref
  useImperativeHandle(ref, () => ({
    setSelectedNodes: (nodes: number[]) => {
      if (viewerRef.current) {
        viewerRef.current.setSelectedNodes(nodes);
      }
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Create graph viewer
    const viewer = createGraphViewer(containerRef.current, { skipNormalization, scaleFactor });
    viewerRef.current = viewer;
    
    // Set click callback
    viewer.onNodeClick(onNodeClick);

    // Set condition first (will initialize camera)
    viewer.setCondition(condition, axisOffset);

    // Load graph if available
    if (graphData) {
      viewer.loadGraph(graphData);
    }

    // Cleanup
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [skipNormalization, scaleFactor]); // Recreate viewer if skipNormalization or scaleFactor changes

  // Update click callback when it changes
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.onNodeClick(onNodeClick);
    }
  }, [onNodeClick]);

  // Update graph data and condition when they change
  useEffect(() => {
    if (viewerRef.current && graphData) {
      viewerRef.current.setCondition(condition, axisOffset);
      viewerRef.current.loadGraph(graphData);
    }
  }, [graphData, condition, axisOffset]);

  // Update start and target nodes when they change (after graph is loaded)
  useEffect(() => {
    if (!viewerRef.current || !graphData) return;
    
    // Use setTimeout to ensure graph is fully loaded before setting nodes
    const timeoutId = setTimeout(() => {
      if (viewerRef.current) {
        if (startNode !== undefined) {
          viewerRef.current.setStartNode(startNode);
        }
        if (targetNode !== undefined) {
          viewerRef.current.setTargetNode(targetNode);
        }
        // Re-apply highlights after setting start/target nodes
        // This ensures highlights are correctly applied even when nodes change
        highlightedNodes.forEach(nodeId => {
          viewerRef.current?.highlightNode(nodeId, true);
        });
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [graphData, startNode, targetNode, highlightedNodes]);

  // Update highlighted nodes
  const prevHighlightedNodesRef = useRef<number[]>([]);
  useEffect(() => {
    if (!viewerRef.current) return;

    // Create sets for comparison
    const prevSet = new Set(prevHighlightedNodesRef.current);
    const currentSet = new Set(highlightedNodes);

    // Clear highlights that are no longer in the list
    prevHighlightedNodesRef.current.forEach(nodeId => {
      if (!currentSet.has(nodeId)) {
        viewerRef.current?.highlightNode(nodeId, false);
      }
    });

    // Apply new highlights (including re-highlighting if needed)
    highlightedNodes.forEach(nodeId => {
      // Always call highlightNode to ensure correct state
      viewerRef.current?.highlightNode(nodeId, true);
    });

    // Update previous highlights
    prevHighlightedNodesRef.current = [...highlightedNodes];
  }, [highlightedNodes]);

  // Update wiggle frequency when it changes
  useEffect(() => {
    if (viewerRef.current && wiggleFrequencyMs !== undefined && viewerRef.current.setWiggleFrequency) {
      viewerRef.current.setWiggleFrequency(wiggleFrequencyMs);
    }
  }, [wiggleFrequencyMs]);

  const handleToggleRotation = useCallback(() => {
    if (!viewerRef.current) return;
    
    if (isRotationPaused) {
      viewerRef.current.resumeRotation();
      setIsRotationPaused(false);
    } else {
      viewerRef.current.pauseRotation();
      setIsRotationPaused(true);
    }
  }, [isRotationPaused]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
      />
      {condition === 'C' && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleRotation();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-4 right-4 z-50 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md pointer-events-auto"
          style={{ pointerEvents: 'auto' }}
        >
          {isRotationPaused ? '揺れを再開' : '揺れを一時停止'}
        </button>
      )}
      {condition === 'D' && (
        <div className="absolute top-4 right-4 z-50 bg-gray-600 text-white px-4 py-2 rounded-md shadow-md pointer-events-none">
          視点操作可能
        </div>
      )}
    </div>
  );
});

