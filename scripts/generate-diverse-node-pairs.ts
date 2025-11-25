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
 * タスクA用のノードペアを検証・生成（多様性を考慮）
 * 要件：
 * - ノードの次数はそれぞれ4〜6
 * - 最短経路の距離が2または3
 * - ノード7を使いすぎない（最大3回まで）
 * - 中心ノード（0,1,2,3）を経由しないペアを優先
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
    
    // ノード1の次数が4〜6でない場合はスキップ
    if (degree1 < 4 || degree1 > 6) continue;
    
    for (let j = i + 1; j < nodes.length; j++) {
      const node2 = nodes[j].id;
      const degree2 = getNodeDegree(graph, node2);
      
      // ノード2の次数が4〜6でない場合はスキップ
      if (degree2 < 4 || degree2 > 6) continue;
      
      // 同じノードはスキップ
      if (node1 === node2) continue;
      
      // 最短経路の距離を計算
      const distance = getShortestPathDistance(graph, node1, node2);
      
      // 距離が2または3の場合のみ追加
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
 * タスクB用のノードペアを検証・生成（多様性を考慮）
 * 要件：
 * - ノードの次数はそれぞれ4〜6
 * - 共通隣接ノードが1個〜4個
 * - ノード7を使いすぎない（最大3回まで）
 */
function findTaskBPairs(graph: GraphData): Array<{ node1: number; node2: number; commonNeighbors: number }> {
  const { nodes } = graph;
  const pairs: Array<{ node1: number; node2: number; commonNeighbors: number }> = [];
  
  for (let i = 0; i < nodes.length; i++) {
    const node1 = nodes[i].id;
    const degree1 = getNodeDegree(graph, node1);
    
    // ノード1の次数が4〜6でない場合はスキップ
    if (degree1 < 4 || degree1 > 6) continue;
    
    for (let j = i + 1; j < nodes.length; j++) {
      const node2 = nodes[j].id;
      const degree2 = getNodeDegree(graph, node2);
      
      // ノード2の次数が4〜6でない場合はスキップ
      if (degree2 < 4 || degree2 > 6) continue;
      
      // 同じノードはスキップ
      if (node1 === node2) continue;
      
      // 共通隣接ノードを計算
      const commonNeighbors = findCommonNeighbors(graph, node1, node2);
      const commonNeighborCount = commonNeighbors.length;
      
      // 共通隣接ノードが1個〜4個の場合のみ追加
      if (commonNeighborCount >= 1 && commonNeighborCount <= 4) {
        pairs.push({ node1, node2, commonNeighbors: commonNeighborCount });
      }
    }
  }
  
  return pairs;
}

/**
 * ノード7の使用回数をカウント
 */
function countNode7Usage(pairs: Array<{ node1: number; node2: number }>): number {
  return pairs.filter(p => p.node1 === 7 || p.node2 === 7).length;
}

/**
 * 多様なノードペアを選択
 */
function selectDiversePairs<T extends { node1: number; node2: number }>(
  allPairs: T[],
  count: number,
  maxNode7Usage: number = 3
): T[] {
  // 中心ノードを経由しないペアを優先
  const withoutCenter = allPairs.filter(p => !passesThroughCenterNodes(
    graphData,
    p.node1,
    p.node2
  ));
  const withCenter = allPairs.filter(p => passesThroughCenterNodes(
    graphData,
    p.node1,
    p.node2
  ));
  
  const selected: T[] = [];
  let node7Count = 0;
  
  // まず中心ノードを経由しないペアから選択
  for (const pair of withoutCenter) {
    if (selected.length >= count) break;
    
    const usesNode7 = pair.node1 === 7 || pair.node2 === 7;
    if (usesNode7 && node7Count >= maxNode7Usage) continue;
    
    selected.push(pair);
    if (usesNode7) node7Count++;
  }
  
  // まだ足りない場合は中心ノードを経由するペアから選択
  for (const pair of withCenter) {
    if (selected.length >= count) break;
    
    const usesNode7 = pair.node1 === 7 || pair.node2 === 7;
    if (usesNode7 && node7Count >= maxNode7Usage) continue;
    
    selected.push(pair);
    if (usesNode7) node7Count++;
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
  
  console.log('=== 多様なノードペアの生成 ===\n');
  
  // タスクA用のペアを検索
  const taskA = findTaskAPairs(graphData);
  console.log(`タスクA用のペア:`);
  console.log(`  距離2: ${taskA.distance2.length}個（中心ノード経由: ${taskA.distance2.filter(p => p.passesCenter).length}個）`);
  console.log(`  距離3: ${taskA.distance3.length}個（中心ノード経由: ${taskA.distance3.filter(p => p.passesCenter).length}個）`);
  
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
  console.log('\n=== 選択されたペア（ノード7の使用を制限、中心ノード経由を避ける） ===\n');
  
  // タスクA: 距離2と距離3を各6個ずつ
  const selectedA2 = selectDiversePairs(
    taskA.distance2.map(p => ({ node1: p.node1, node2: p.node2 })),
    6,
    2 // 距離2ではノード7を最大2回まで
  );
  const selectedA3 = selectDiversePairs(
    taskA.distance3.map(p => ({ node1: p.node1, node2: p.node2 })),
    6,
    1 // 距離3ではノード7を最大1回まで
  );
  
  console.log('タスクA（距離2と距離3を各6個ずつ）:');
  console.log('距離2のペア:');
  selectedA2.forEach((p, i) => {
    const passesCenter = passesThroughCenterNodes(graphData, p.node1, p.node2);
    const usesNode7 = p.node1 === 7 || p.node2 === 7;
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2})${usesNode7 ? ' [ノード7使用]' : ''}${passesCenter ? ' [中心ノード経由]' : ''}`);
  });
  console.log('距離3のペア:');
  selectedA3.forEach((p, i) => {
    const passesCenter = passesThroughCenterNodes(graphData, p.node1, p.node2);
    const usesNode7 = p.node1 === 7 || p.node2 === 7;
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2})${usesNode7 ? ' [ノード7使用]' : ''}${passesCenter ? ' [中心ノード経由]' : ''}`);
  });
  
  console.log(`\nノード7の使用回数（タスクA）: ${countNode7Usage([...selectedA2, ...selectedA3])}回`);
  
  // タスクB: 共通隣接1〜4個から適切に選択（合計12個）
  // 共通隣接4個のペアがないため、他の共通隣接数のペアから追加で選択
  const selectedB1 = selectDiversePairs(taskBByCommon[1], 4, 1); // 4個に増やす
  const selectedB2 = selectDiversePairs(taskBByCommon[2], 4, 1); // 4個に増やす
  const selectedB3 = selectDiversePairs(taskBByCommon[3], 4, 0); // 4個に増やす、ノード7は使わない
  const selectedB4 = selectDiversePairs(taskBByCommon[4], 0, 0); // 共通隣接4個のペアがない
  
  const selectedB = [...selectedB1, ...selectedB2, ...selectedB3, ...selectedB4];
  
  console.log('\nタスクB（共通隣接1〜4個から適切に選択、合計12個）:');
  selectedB.forEach((p, i) => {
    const usesNode7 = p.node1 === 7 || p.node2 === 7;
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2}) - 共通隣接${p.commonNeighbors}個${usesNode7 ? ' [ノード7使用]' : ''}`);
  });
  
  console.log(`\nノード7の使用回数（タスクB）: ${countNode7Usage(selectedB)}回`);
  console.log(`\nノード7の総使用回数: ${countNode7Usage([...selectedA2, ...selectedA3, ...selectedB])}回`);
  
  // CSV生成用のデータを出力
  console.log('\n=== CSV生成用データ ===\n');
  console.log('// タスクA用のペア');
  console.log('const taskAPairs = {');
  console.log('  distance2: [');
  selectedA2.forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('  distance3: [');
  selectedA3.forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('};');
  console.log('\n// タスクB用のペア');
  console.log('const taskBPairs = {');
  console.log('  common1: [');
  selectedB1.forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('  common2: [');
  selectedB2.forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('  common3: [');
  selectedB3.forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('  common4: [');
  selectedB4.forEach(p => console.log(`    { node1: ${p.node1}, node2: ${p.node2} },`));
  console.log('  ],');
  console.log('};');
}

main();

