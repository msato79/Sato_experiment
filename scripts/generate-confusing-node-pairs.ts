import * as fs from 'fs';
import * as path from 'path';
import { GraphData, parseCSV } from '../src/csv';
import { getShortestPathDistance, findCommonNeighbors, findShortestPath } from '../src/lib/path-finder';

/**
 * ノードの次数を計算
 */
function getNodeDegree(graph: GraphData, nodeId: number): number {
  const { edges } = graph;
  let degree = 0;
  edges.forEach(edge => {
    if (edge.from === nodeId || edge.to === nodeId) {
      degree++;
    }
  });
  return degree;
}

/**
 * ノード間の3D空間でのユークリッド距離を計算
 */
function getEuclideanDistance(graph: GraphData, node1: number, node2: number): number {
  const node1Data = graph.nodes.find(n => n.id === node1);
  const node2Data = graph.nodes.find(n => n.id === node2);
  
  if (!node1Data || !node2Data) return Infinity;
  
  const dx = node1Data.x - node2Data.x;
  const dy = node1Data.y - node2Data.y;
  const dz = node1Data.z - node2Data.z;
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * タスクA用のノードペアを検証・生成
 * 要件：
 * - ノードの次数はそれぞれ4〜6
 * - 最短経路の距離が2または3
 * - 「距離2っぽいけど距離3」や「距離3っぽいけど距離2」のような紛らわしいペアを優先
 */
function findTaskAPairs(graph: GraphData): {
  distance2: Array<{ node1: number; node2: number; euclideanDist: number; confusing: boolean }>;
  distance3: Array<{ node1: number; node2: number; euclideanDist: number; confusing: boolean }>;
} {
  const { nodes } = graph;
  const distance2Pairs: Array<{ node1: number; node2: number; euclideanDist: number; confusing: boolean }> = [];
  const distance3Pairs: Array<{ node1: number; node2: number; euclideanDist: number; confusing: boolean }> = [];
  
  // すべてのペアのユークリッド距離を計算して中央値を求める
  const allEuclideanDists: number[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = getEuclideanDistance(graph, nodes[i].id, nodes[j].id);
      if (dist !== Infinity) {
        allEuclideanDists.push(dist);
      }
    }
  }
  allEuclideanDists.sort((a, b) => a - b);
  const medianEuclideanDist = allEuclideanDists[Math.floor(allEuclideanDists.length / 2)];
  
  for (let i = 0; i < nodes.length; i++) {
    const node1 = nodes[i].id;
    const degree1 = getNodeDegree(graph, node1);
    
    if (degree1 < 4 || degree1 > 6) continue;
    
    for (let j = i + 1; j < nodes.length; j++) {
      const node2 = nodes[j].id;
      const degree2 = getNodeDegree(graph, node2);
      
      if (degree2 < 4 || degree2 > 6) continue;
      if (node1 === node2) continue;
      
      const distance = getShortestPathDistance(graph, node1, node2);
      const euclideanDist = getEuclideanDistance(graph, node1, node2);
      
      if (distance === 2 || distance === 3) {
        // 紛らわしいペア: 距離2なのに視覚的に遠い、または距離3なのに視覚的に近い
        const confusing = (distance === 2 && euclideanDist > medianEuclideanDist) ||
                         (distance === 3 && euclideanDist < medianEuclideanDist);
        
        const pair = { node1, node2, euclideanDist, confusing };
        
        if (distance === 2) {
          distance2Pairs.push(pair);
        } else if (distance === 3) {
          distance3Pairs.push(pair);
        }
      }
    }
  }
  
  return { distance2: distance2Pairs, distance3: distance3Pairs };
}

/**
 * タスクB用のノードペアを検証・生成
 * 要件：
 * - ノードの次数はそれぞれ4〜8（拡張）
 * - ハブノード（1~5）を含むペアの場合、ハブノードの次数制限を緩和
 * - 共通隣接ノードが1個〜4個
 */
function findTaskBPairs(graph: GraphData): Array<{ node1: number; node2: number; commonNeighbors: number; hasHub: boolean }> {
  const { nodes } = graph;
  const hubNodes = new Set([1, 2, 3, 4, 5]);
  const pairs: Array<{ node1: number; node2: number; commonNeighbors: number; hasHub: boolean }> = [];
  
  for (let i = 0; i < nodes.length; i++) {
    const node1 = nodes[i].id;
    const degree1 = getNodeDegree(graph, node1);
    const isHub1 = hubNodes.has(node1);
    
    // ハブノードでない場合、次数が4〜8である必要がある
    // ハブノードの場合は次数制限を緩和
    if (!isHub1 && (degree1 < 4 || degree1 > 8)) continue;
    
    for (let j = i + 1; j < nodes.length; j++) {
      const node2 = nodes[j].id;
      const degree2 = getNodeDegree(graph, node2);
      const isHub2 = hubNodes.has(node2);
      
      // ハブノードでない場合、次数が4〜8である必要がある
      // ハブノードの場合は次数制限を緩和
      if (!isHub2 && (degree2 < 4 || degree2 > 8)) continue;
      
      // 両方ともハブノードの場合はスキップ（ハブノードは1つだけ含む）
      if (isHub1 && isHub2) continue;
      
      if (node1 === node2) continue;
      
      const commonNeighbors = findCommonNeighbors(graph, node1, node2);
      const commonNeighborCount = commonNeighbors.length;
      
      if (commonNeighborCount >= 1 && commonNeighborCount <= 4) {
        const hasHub = isHub1 || isHub2;
        pairs.push({ node1, node2, commonNeighbors: commonNeighborCount, hasHub });
      }
    }
  }
  
  return pairs;
}

/**
 * タスクA用の紛らわしいペアを選択
 * 距離2と距離3を各6個ずつ、紛らわしいペアを優先
 */
function selectConfusingTaskAPairs<T extends { node1: number; node2: number; confusing: boolean }>(
  distance2Pairs: T[],
  distance3Pairs: T[],
  count: number = 6
): { distance2: T[]; distance3: T[] } {
  // 紛らわしいペアを優先的に選択
  const distance2Confusing = distance2Pairs.filter(p => p.confusing).sort((a, b) => b.euclideanDist - a.euclideanDist);
  const distance2Normal = distance2Pairs.filter(p => !p.confusing);
  const distance3Confusing = distance3Pairs.filter(p => p.confusing).sort((a, b) => a.euclideanDist - b.euclideanDist);
  const distance3Normal = distance3Pairs.filter(p => !p.confusing);
  
  const selected2: T[] = [];
  const selected3: T[] = [];
  
  // 距離2のペアを選択（紛らわしいものを優先）
  for (const pair of [...distance2Confusing, ...distance2Normal]) {
    if (selected2.length >= count) break;
    selected2.push(pair);
  }
  
  // 距離3のペアを選択（紛らわしいものを優先）
  for (const pair of [...distance3Confusing, ...distance3Normal]) {
    if (selected3.length >= count) break;
    selected3.push(pair);
  }
  
  return { distance2: selected2, distance3: selected3 };
}

/**
 * タスクB用の多様なペアを選択
 * ハブノードを含むペアもいくつか含める
 */
function selectDiverseTaskBPairs<T extends { node1: number; node2: number; hasHub: boolean }>(
  allPairs: T[],
  count: number = 12,
  hubPairCount: number = 3
): T[] {
  const selected: T[] = [];
  const nodeUsage = new Map<number, number>();
  const maxUsagePerNode = 3;
  
  // 共通隣接ノードの数ごとにグループ化
  const pairsByCommon: Record<number, T[]> = { 1: [], 2: [], 3: [], 4: [] };
  allPairs.forEach(p => {
    const commonCount = (p as any).commonNeighbors;
    if (commonCount >= 1 && commonCount <= 4) {
      pairsByCommon[commonCount].push(p);
    }
  });
  
  // まずハブノードを含むペアを選択
  const hubPairs: T[] = [];
  for (let commonCount = 1; commonCount <= 4; commonCount++) {
    const hubPairsInGroup = pairsByCommon[commonCount].filter(p => p.hasHub);
    hubPairs.push(...hubPairsInGroup);
  }
  
  let hubSelected = 0;
  for (const pair of hubPairs) {
    if (hubSelected >= hubPairCount || selected.length >= count) break;
    
    const usage1 = nodeUsage.get(pair.node1) || 0;
    const usage2 = nodeUsage.get(pair.node2) || 0;
    
    if (usage1 < maxUsagePerNode && usage2 < maxUsagePerNode) {
      selected.push(pair);
      nodeUsage.set(pair.node1, usage1 + 1);
      nodeUsage.set(pair.node2, usage2 + 1);
      hubSelected++;
    }
  }
  
  // 残りを通常のペアから選択
  // ハブノードを含むペアを既に選んだので、残りを均等に配分
  const remainingCount = count - selected.length;
  const targetCounts = { 1: Math.ceil(remainingCount / 3), 2: Math.ceil(remainingCount / 3), 3: Math.floor(remainingCount / 3), 4: 0 };
  
  for (let commonCount = 1; commonCount <= 3; commonCount++) {
    const targetCount = targetCounts[commonCount as keyof typeof targetCounts];
    const availablePairs = pairsByCommon[commonCount].filter(p => 
      !selected.some(s => s.node1 === p.node1 && s.node2 === p.node2)
    );
    
    for (const pair of availablePairs) {
      if (selected.length >= count) break;
      
      const usage1 = nodeUsage.get(pair.node1) || 0;
      const usage2 = nodeUsage.get(pair.node2) || 0;
      
      if (usage1 < maxUsagePerNode && usage2 < maxUsagePerNode) {
        const currentCount = selected.filter(p => (p as any).commonNeighbors === commonCount).length;
        if (currentCount >= targetCount) continue;
        
        selected.push(pair);
        nodeUsage.set(pair.node1, usage1 + 1);
        nodeUsage.set(pair.node2, usage2 + 1);
      }
    }
  }
  
  // まだ足りない場合は、使用回数の少ないノードから追加
  if (selected.length < count) {
    const allRemainingPairs = allPairs.filter(p => 
      !selected.some(s => s.node1 === p.node1 && s.node2 === p.node2)
    );
    
    for (const pair of allRemainingPairs) {
      if (selected.length >= count) break;
      
      const usage1 = nodeUsage.get(pair.node1) || 0;
      const usage2 = nodeUsage.get(pair.node2) || 0;
      
      if (usage1 < maxUsagePerNode + 1 && usage2 < maxUsagePerNode + 1) {
        selected.push(pair);
        nodeUsage.set(pair.node1, usage1 + 1);
        nodeUsage.set(pair.node2, usage2 + 1);
      }
    }
  }
  
  return selected;
}

let graphData: GraphData;

/**
 * メイン処理
 */
function main() {
  const graphPath = path.join(process.cwd(), 'public/graphs/graph_ba_n40_e114.csv');
  const graphCsv = fs.readFileSync(graphPath, 'utf-8');
  graphData = parseCSV(graphCsv);
  
  console.log('=== 紛らわしいノードペアの生成 ===\n');
  
  // タスクA用のペアを検索
  const taskA = findTaskAPairs(graphData);
  console.log(`タスクA用のペア:`);
  console.log(`  距離2: ${taskA.distance2.length}個（紛らわしい: ${taskA.distance2.filter(p => p.confusing).length}個）`);
  console.log(`  距離3: ${taskA.distance3.length}個（紛らわしい: ${taskA.distance3.filter(p => p.confusing).length}個）`);
  
  // タスクB用のペアを検索
  const taskB = findTaskBPairs(graphData);
  const taskBByCommon = {
    1: taskB.filter(p => p.commonNeighbors === 1),
    2: taskB.filter(p => p.commonNeighbors === 2),
    3: taskB.filter(p => p.commonNeighbors === 3),
    4: taskB.filter(p => p.commonNeighbors === 4),
  };
  const hubPairs = taskB.filter(p => p.hasHub);
  console.log(`\nタスクB用のペア:`);
  console.log(`  共通隣接1個: ${taskBByCommon[1].length}個（ハブ含む: ${taskBByCommon[1].filter(p => p.hasHub).length}個）`);
  console.log(`  共通隣接2個: ${taskBByCommon[2].length}個（ハブ含む: ${taskBByCommon[2].filter(p => p.hasHub).length}個）`);
  console.log(`  共通隣接3個: ${taskBByCommon[3].length}個（ハブ含む: ${taskBByCommon[3].filter(p => p.hasHub).length}個）`);
  console.log(`  共通隣接4個: ${taskBByCommon[4].length}個（ハブ含む: ${taskBByCommon[4].filter(p => p.hasHub).length}個）`);
  console.log(`  ハブノードを含むペア: ${hubPairs.length}個`);
  
  // 多様なペアを選択
  console.log('\n=== 選択されたペア ===\n');
  
  // タスクA: 距離2と距離3を各6個ずつ、紛らわしいペアを優先
  const selectedA = selectConfusingTaskAPairs(taskA.distance2, taskA.distance3, 6);
  
  console.log('タスクA（距離2:6個、距離3:6個、紛らわしいペアを優先）:');
  console.log('距離2のペア:');
  selectedA.distance2.forEach((p, i) => {
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2}) - ユークリッド距離: ${p.euclideanDist.toFixed(2)}${p.confusing ? ' [紛らわしい]' : ''}`);
  });
  console.log('距離3のペア:');
  selectedA.distance3.forEach((p, i) => {
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2}) - ユークリッド距離: ${p.euclideanDist.toFixed(2)}${p.confusing ? ' [紛らわしい]' : ''}`);
  });
  
  // タスクB: ハブノードを含むペアもいくつか含める
  const selectedB = selectDiverseTaskBPairs(taskB, 12, 3);
  
  console.log('\nタスクB（共通隣接1〜3個から適切に選択、合計12個、ハブノード含む）:');
  selectedB.forEach((p, i) => {
    const commonCount = (p as any).commonNeighbors;
    const hubInfo = p.hasHub ? ' [ハブノード含む]' : '';
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2}) - 共通隣接${commonCount}個${hubInfo}`);
  });
  
  // CSV生成用のデータを出力
  console.log('\n=== CSV生成用データ ===\n');
  console.log('// タスクA用のペア');
  console.log('const taskAPairs = {');
  console.log('  distance2: [');
  selectedA.distance2.forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('  distance3: [');
  selectedA.distance3.forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('};');
  console.log('\n// タスクB用のペア');
  console.log('const taskBPairs = {');
  const selectedBByCommon = {
    1: selectedB.filter(p => (p as any).commonNeighbors === 1),
    2: selectedB.filter(p => (p as any).commonNeighbors === 2),
    3: selectedB.filter(p => (p as any).commonNeighbors === 3),
    4: selectedB.filter(p => (p as any).commonNeighbors === 4),
  };
  console.log('  common1: [');
  selectedBByCommon[1].forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('  common2: [');
  selectedBByCommon[2].forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('  common3: [');
  selectedBByCommon[3].forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('  common4: [');
  selectedBByCommon[4].forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('};');
}

main();

