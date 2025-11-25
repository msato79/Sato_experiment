import * as fs from 'fs';
import * as path from 'path';
import { GraphData, parseCSV } from '../src/csv';
import { getShortestPathDistance, findCommonNeighbors } from '../src/lib/path-finder';

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
 * タスクA用のノードペアを検証・生成
 * 要件：
 * - ノードの次数はそれぞれ4〜6
 * - 最短経路の距離が2または3
 */
function findTaskAPairs(graph: GraphData): {
  distance2: Array<{ node1: number; node2: number }>;
  distance3: Array<{ node1: number; node2: number }>;
} {
  const { nodes } = graph;
  const distance2Pairs: Array<{ node1: number; node2: number }> = [];
  const distance3Pairs: Array<{ node1: number; node2: number }> = [];
  
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
      if (distance === 2) {
        distance2Pairs.push({ node1, node2 });
      } else if (distance === 3) {
        distance3Pairs.push({ node1, node2 });
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
 * メイン処理
 */
function main() {
  console.log('=== 練習用グラフ (graph_practice.csv) ===\n');
  const practiceGraphPath = path.join(process.cwd(), 'public/graphs/graph_practice.csv');
  const practiceCsvContent = fs.readFileSync(practiceGraphPath, 'utf-8');
  const practiceGraphData = parseCSV(practiceCsvContent);
  
  // タスクA用のペアを検索
  const practiceTaskA = findTaskAPairs(practiceGraphData);
  console.log('タスクA用のペア:');
  console.log(`  距離2: ${practiceTaskA.distance2.length}個`);
  console.log(`  距離3: ${practiceTaskA.distance3.length}個`);
  
  // タスクB用のペアを検索
  const practiceTaskB = findTaskBPairs(practiceGraphData);
  const practiceTaskBByCommon = {
    1: practiceTaskB.filter(p => p.commonNeighbors === 1),
    2: practiceTaskB.filter(p => p.commonNeighbors === 2),
    3: practiceTaskB.filter(p => p.commonNeighbors === 3),
    4: practiceTaskB.filter(p => p.commonNeighbors === 4),
  };
  console.log('\nタスクB用のペア:');
  console.log(`  共通隣接1個: ${practiceTaskBByCommon[1].length}個`);
  console.log(`  共通隣接2個: ${practiceTaskBByCommon[2].length}個`);
  console.log(`  共通隣接3個: ${practiceTaskBByCommon[3].length}個`);
  console.log(`  共通隣接4個: ${practiceTaskBByCommon[4].length}個`);
  
  // 練習用の推奨ペアを表示
  console.log('\n=== 練習用推奨ペア ===');
  console.log('\nタスクA（距離2と距離3を1つずつ）:');
  if (practiceTaskA.distance2.length > 0 && practiceTaskA.distance3.length > 0) {
    console.log(`  距離2: (${practiceTaskA.distance2[0].node1}, ${practiceTaskA.distance2[0].node2})`);
    console.log(`  距離3: (${practiceTaskA.distance3[0].node1}, ${practiceTaskA.distance3[0].node2})`);
  }
  
  console.log('\nタスクB（共通隣接1個と2個を1つずつ）:');
  if (practiceTaskBByCommon[1].length > 0 && practiceTaskBByCommon[2].length > 0) {
    console.log(`  共通隣接1個: (${practiceTaskBByCommon[1][0].node1}, ${practiceTaskBByCommon[1][0].node2})`);
    console.log(`  共通隣接2個: (${practiceTaskBByCommon[2][0].node1}, ${practiceTaskBByCommon[2][0].node2})`);
  }
  
  console.log('\n\n=== 本番用グラフ (graph_ba_n40_e114.csv) ===\n');
  const mainGraphPath = path.join(process.cwd(), 'public/graphs/graph_ba_n40_e114.csv');
  const mainCsvContent = fs.readFileSync(mainGraphPath, 'utf-8');
  const mainGraphData = parseCSV(mainCsvContent);
  
  // タスクA用のペアを検索
  const mainTaskA = findTaskAPairs(mainGraphData);
  console.log('タスクA用のペア:');
  console.log(`  距離2: ${mainTaskA.distance2.length}個`);
  console.log(`  距離3: ${mainTaskA.distance3.length}個`);
  
  // タスクB用のペアを検索
  const mainTaskB = findTaskBPairs(mainGraphData);
  const mainTaskBByCommon = {
    1: mainTaskB.filter(p => p.commonNeighbors === 1),
    2: mainTaskB.filter(p => p.commonNeighbors === 2),
    3: mainTaskB.filter(p => p.commonNeighbors === 3),
    4: mainTaskB.filter(p => p.commonNeighbors === 4),
  };
  console.log('\nタスクB用のペア:');
  console.log(`  共通隣接1個: ${mainTaskBByCommon[1].length}個`);
  console.log(`  共通隣接2個: ${mainTaskBByCommon[2].length}個`);
  console.log(`  共通隣接3個: ${mainTaskBByCommon[3].length}個`);
  console.log(`  共通隣接4個: ${mainTaskBByCommon[4].length}個`);
  
  // 本番用の推奨ペアを表示（距離2と距離3を同じ数だけ選ぶ）
  console.log('\n=== 本番用推奨ペア ===');
  const minPairs = Math.min(mainTaskA.distance2.length, mainTaskA.distance3.length);
  const selectedDistance2 = mainTaskA.distance2.slice(0, Math.min(6, mainTaskA.distance2.length));
  const selectedDistance3 = mainTaskA.distance3.slice(0, Math.min(6, mainTaskA.distance3.length));
  
  console.log('\nタスクA（距離2と距離3を同じ数ずつ、各6個）:');
  console.log('距離2のペア:');
  selectedDistance2.forEach((p, i) => {
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2})`);
  });
  console.log('距離3のペア:');
  selectedDistance3.forEach((p, i) => {
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2})`);
  });
  
  console.log('\nタスクB（共通隣接1〜4個から適切に選択）:');
  const selectedTaskB = [
    ...mainTaskBByCommon[1].slice(0, 3),
    ...mainTaskBByCommon[2].slice(0, 3),
    ...mainTaskBByCommon[3].slice(0, 3),
    ...mainTaskBByCommon[4].slice(0, 3),
  ];
  selectedTaskB.forEach((p, i) => {
    console.log(`  ${i + 1}. (${p.node1}, ${p.node2}) - 共通隣接${p.commonNeighbors}個`);
  });
}

main();

