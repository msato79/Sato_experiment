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
 * 最短経路が中心ノード（0,1,2,3）を経由するかチェック
 */
function passesThroughCenterNodes(graph: GraphData, node1: number, node2: number): boolean {
  const centerNodes = new Set([0, 1, 2, 3]);
  const path = findShortestPath(graph, node1, node2);
  
  // 経路の中間ノード（始点と終点以外）に中心ノードが含まれるかチェック
  for (let i = 1; i < path.length - 1; i++) {
    if (centerNodes.has(path[i])) {
      return true;
    }
  }
  return false;
}

/**
 * タスクA用のノードペアを検証・生成
 * 要件：
 * - ノードの次数はそれぞれ4〜6
 * - 最短経路の距離が2または3
 * - 距離3のペアを多く選ぶ（距離2:距離3 = 4:8）
 */
function findTaskAPairs(graph: GraphData): {
  distance2: Array<{ node1: number; node2: number; passesCenter: boolean }>;
  distance3: Array<{ node1: number; node2: number; passesCenter: boolean }>;
} {
  const { nodes } = graph;
  const distance2Pairs: Array<{ node1: number; node2: number; passesCenter: boolean }> = [];
  const distance3Pairs: Array<{ node1: number; node2: number; passesCenter: boolean }> = [];
  
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
      
      if (distance === 2 || distance === 3) {
        const passesCenter = passesThroughCenterNodes(graph, node1, node2);
        const pair = { node1, node2, passesCenter };
        
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
 * - ノードの次数はそれぞれ4〜6
 * - 共通隣接ノードが1個〜4個
 * - ノードの使用を分散させる（同じノードを使いすぎない）
 */
function findTaskBPairs(graph: GraphData): Array<{ node1: number; node2: number; commonNeighbors: number }> {
  const { nodes } = graph;
  const pairs: Array<{ node1: number; node2: number; commonNeighbors: number }> = [];
  
  for (let i = 0; i < nodes.length; i++) {
    const node1 = nodes[i].id;
    const degree1 = getNodeDegree(graph, node1);
    
    if (degree1 < 4 || degree1 > 6) continue;
    
    for (let j = i + 1; j < nodes.length; j++) {
      const node2 = nodes[j].id;
      const degree2 = getNodeDegree(graph, node2);
      
      if (degree2 < 4 || degree2 > 6) continue;
      if (node1 === node2) continue;
      
      const commonNeighbors = findCommonNeighbors(graph, node1, node2);
      const commonNeighborCount = commonNeighbors.length;
      
      if (commonNeighborCount >= 1 && commonNeighborCount <= 4) {
        pairs.push({ node1, node2, commonNeighbors: commonNeighborCount });
      }
    }
  }
  
  return pairs;
}

/**
 * ノードの使用回数をカウント
 */
function countNodeUsage(pairs: Array<{ node1: number; node2: number }>): Map<number, number> {
  const usage = new Map<number, number>();
  pairs.forEach(p => {
    usage.set(p.node1, (usage.get(p.node1) || 0) + 1);
    usage.set(p.node2, (usage.get(p.node2) || 0) + 1);
  });
  return usage;
}

/**
 * 多様なノードペアを選択（タスクA用）
 * 距離3のペアを多く選ぶ（距離2:距離3 = 4:8）
 */
function selectDiverseTaskAPairs<T extends { node1: number; node2: number; passesCenter: boolean }>(
  distance2Pairs: T[],
  distance3Pairs: T[],
  countDistance2: number = 4,
  countDistance3: number = 8
): { distance2: T[]; distance3: T[] } {
  // 中心ノードを経由しないペアを優先
  const distance2WithoutCenter = distance2Pairs.filter(p => !p.passesCenter);
  const distance2WithCenter = distance2Pairs.filter(p => p.passesCenter);
  const distance3WithoutCenter = distance3Pairs.filter(p => !p.passesCenter);
  const distance3WithCenter = distance3Pairs.filter(p => p.passesCenter);
  
  const selected2: T[] = [];
  const selected3: T[] = [];
  
  // 距離2のペアを選択（中心ノード経由しないものを優先）
  for (const pair of [...distance2WithoutCenter, ...distance2WithCenter]) {
    if (selected2.length >= countDistance2) break;
    selected2.push(pair);
  }
  
  // 距離3のペアを選択（中心ノード経由しないものを優先）
  for (const pair of [...distance3WithoutCenter, ...distance3WithCenter]) {
    if (selected3.length >= countDistance3) break;
    selected3.push(pair);
  }
  
  return { distance2: selected2, distance3: selected3 };
}

/**
 * 多様なノードペアを選択（タスクB用）
 * ノードの使用を分散させる
 */
function selectDiverseTaskBPairs<T extends { node1: number; node2: number }>(
  allPairs: T[],
  count: number,
  maxUsagePerNode: number = 2
): T[] {
  const selected: T[] = [];
  const nodeUsage = new Map<number, number>();
  
  // 共通隣接ノードの数ごとにグループ化
  const pairsByCommon: Record<number, T[]> = { 1: [], 2: [], 3: [], 4: [] };
  allPairs.forEach(p => {
    const commonCount = (p as any).commonNeighbors;
    if (commonCount >= 1 && commonCount <= 4) {
      pairsByCommon[commonCount].push(p);
    }
  });
  
  // 各共通隣接ノード数から均等に選択（各3個ずつ）
  const targetCounts = { 1: 4, 2: 4, 3: 4, 4: 0 }; // 共通隣接4個のペアがないため0
  
  for (let commonCount = 1; commonCount <= 3; commonCount++) {
    const targetCount = targetCounts[commonCount as keyof typeof targetCounts];
    const availablePairs = pairsByCommon[commonCount];
    
    for (const pair of availablePairs) {
      if (selected.length >= count) break;
      
      const usage1 = nodeUsage.get(pair.node1) || 0;
      const usage2 = nodeUsage.get(pair.node2) || 0;
      
      // ノードの使用回数が上限を超えていないかチェック
      if (usage1 >= maxUsagePerNode || usage2 >= maxUsagePerNode) {
        continue;
      }
      
      selected.push(pair);
      nodeUsage.set(pair.node1, usage1 + 1);
      nodeUsage.set(pair.node2, usage2 + 1);
      
      if (selected.filter(p => (p as any).commonNeighbors === commonCount).length >= targetCount) {
        break;
      }
    }
  }
  
  // まだ足りない場合は、使用回数の少ないノードから追加
  if (selected.length < count) {
    for (const pair of allPairs) {
      if (selected.length >= count) break;
      
      // 既に選択されているペアはスキップ
      if (selected.some(p => p.node1 === pair.node1 && p.node2 === pair.node2)) {
        continue;
      }
      
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
  
  console.log('=== 改良されたノードペアの生成 ===\n');
  
  // タスクA用のペアを検索
  const taskA = findTaskAPairs(graphData);
  console.log(`タスクA用のペア:`);
  console.log(`  距離2: ${taskA.distance2.length}個`);
  console.log(`  距離3: ${taskA.distance3.length}個`);
  
  // タスクB用のペアを検索
  const taskB = findTaskBPairs(graphData);
  const taskBByCommon = {
    1: taskB.filter(p => p.commonNeighbors === 1),
    2: taskB.filter(p => p.commonNeighbors === 2),
    3: taskB.filter(p => p.commonNeighbors === 3),
    4: taskB.filter(p => p.commonNeighbors === 4),
  };
  console.log(`\nタスクB用のペア:`);
  console.log(`  共通隣接1個: ${taskBByCommon[1].length}個`);
  console.log(`  共通隣接2個: ${taskBByCommon[2].length}個`);
  console.log(`  共通隣接3個: ${taskBByCommon[3].length}個`);
  console.log(`  共通隣接4個: ${taskBByCommon[4].length}個`);
  
  // 多様なペアを選択
  console.log('\n=== 選択されたペア ===\n');
  
  // タスクA: 距離2を4個、距離3を8個（距離3の割合を増やす）
  const selectedA = selectDiverseTaskAPairs(taskA.distance2, taskA.distance3, 4, 8);
  
  console.log('タスクA（距離2:4個、距離3:8個）:');
  console.log('距離2のペア:');
  selectedA.distance2.forEach((p, i) => {
    const passesCenter = passesThroughCenterNodes(graphData, p.node1, p.node2);
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2})${passesCenter ? ' [中心ノード経由]' : ''}`);
  });
  console.log('距離3のペア:');
  selectedA.distance3.forEach((p, i) => {
    const passesCenter = passesThroughCenterNodes(graphData, p.node1, p.node2);
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2})${passesCenter ? ' [中心ノード経由]' : ''}`);
  });
  
  const taskAUsage = countNodeUsage([...selectedA.distance2, ...selectedA.distance3]);
  console.log(`\nノードの使用回数（タスクA）:`);
  Array.from(taskAUsage.entries()).sort((a, b) => b[1] - a[1]).forEach(([node, count]) => {
    console.log(`  ノード${node}: ${count}回`);
  });
  
  // タスクB: ノードの使用を分散させる
  const selectedB = selectDiverseTaskBPairs(taskB, 12, 2);
  
  console.log('\nタスクB（共通隣接1〜3個から適切に選択、合計12個）:');
  selectedB.forEach((p, i) => {
    const commonCount = (p as any).commonNeighbors;
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2}) - 共通隣接${commonCount}個`);
  });
  
  const taskBUsage = countNodeUsage(selectedB);
  console.log(`\nノードの使用回数（タスクB）:`);
  Array.from(taskBUsage.entries()).sort((a, b) => b[1] - a[1]).forEach(([node, count]) => {
    console.log(`  ノード${node}: ${count}回`);
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


