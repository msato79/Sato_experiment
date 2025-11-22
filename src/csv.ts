export interface Node {
  id: number;
  x: number;
  y: number;
  z: number;
}

export interface Edge {
  from: number;
  to: number;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export function parseCSV(csv: string): GraphData {
  const lines = csv.trim().split('\n');
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim());
    if (parts[0] === 'N') {
      nodes.push({
        id: parseInt(parts[1]),
        x: parseFloat(parts[2]),
        y: parseFloat(parts[3]),
        z: parseFloat(parts[4]),
      });
    } else if (parts[0] === 'E') {
      edges.push({
        from: parseInt(parts[1]),
        to: parseInt(parts[2]),
      });
    }
  }

  return { nodes, edges };
}