import { GraphData } from '../csv';

/**
 * Find shortest path between two nodes using BFS
 */
export function findShortestPath(
  graph: GraphData,
  startNode: number,
  targetNode: number
): number[] {
  const { nodes, edges } = graph;
  
  // Build adjacency list
  const adjacencyList = new Map<number, number[]>();
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });
  
  edges.forEach(edge => {
    adjacencyList.get(edge.from)?.push(edge.to);
    adjacencyList.get(edge.to)?.push(edge.from); // Undirected graph
  });
  
  // BFS to find shortest path
  const queue: { node: number; path: number[] }[] = [{ node: startNode, path: [startNode] }];
  const visited = new Set<number>();
  visited.add(startNode);
  
  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    
    if (node === targetNode) {
      return path;
    }
    
    const neighbors = adjacencyList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ node: neighbor, path: [...path, neighbor] });
      }
    }
  }
  
  // No path found
  return [];
}

/**
 * Get the shortest path distance between two nodes
 * Returns the distance (number of edges) in the shortest path
 */
export function getShortestPathDistance(
  graph: GraphData,
  node1: number,
  node2: number
): number {
  const shortestPath = findShortestPath(graph, node1, node2);
  if (shortestPath.length === 0) {
    // No path exists (should not happen in connected graphs)
    return -1;
  }
  // Distance is path length - 1 (number of edges)
  return shortestPath.length - 1;
}

/**
 * Find all nodes that are adjacent to both node1 and node2 (common neighbors)
 * Returns an array of node IDs
 */
export function findCommonNeighbors(
  graph: GraphData,
  node1: number,
  node2: number
): number[] {
  const { edges } = graph;
  
  // Build adjacency sets for each node
  const neighbors1 = new Set<number>();
  const neighbors2 = new Set<number>();
  
  edges.forEach(edge => {
    if (edge.from === node1 || edge.to === node1) {
      const neighbor = edge.from === node1 ? edge.to : edge.from;
      neighbors1.add(neighbor);
    }
    if (edge.from === node2 || edge.to === node2) {
      const neighbor = edge.from === node2 ? edge.to : edge.from;
      neighbors2.add(neighbor);
    }
  });
  
  // Find intersection (common neighbors)
  const commonNeighbors: number[] = [];
  neighbors1.forEach(neighbor => {
    if (neighbors2.has(neighbor)) {
      commonNeighbors.push(neighbor);
    }
  });
  
  return commonNeighbors.sort((a, b) => a - b); // Sort for consistency
}

