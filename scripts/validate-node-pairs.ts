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
 * - 距離2と距離3の比率は同じ
 */
function findTaskAPairs(graph: GraphData): Array<{ node1: number; node2: number; distance: number }> {
  const { nodes } = graph;
  const pairs: Array<{ node1: number; node2: number; distance: number }> = [];
  
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
        pairs.push({ node1, node2, distance });
      }
    }
  }
  
  return pairs;
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
  const graphFiles = [
    'public/graphs/graph_practice.csv',
    'public/graphs/graph_ba_n40_e114.csv',
  ];
  
  for (const graphFile of graphFiles) {
    const filePath = path.join(process.cwd(), graphFile);
    
    if (!fs.existsSync(filePath)) {
      console.error(`ファイルが見つかりません: ${graphFile}`);
      continue;
    }
    
    console.log(`\n=== ${graphFile} ===`);
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const graphData = parseCSV(csvContent);
    
    // ノードの次数を表示
    console.log('\nノードの次数:');
    const nodeDegrees = graphData.nodes.map(node => ({
      id: node.id,
      degree: getNodeDegree(graphData, node.id)
    }));
    nodeDegrees.forEach(({ id, degree }) => {
      console.log(`  ノード ${id}: 次数 ${degree}`);
    });
    
    // タスクA用のペアを検索
    console.log('\nタスクA用のペア（距離2または3）:');
    const taskAPairs = findTaskAPairs(graphData);
    const distance2Pairs = taskAPairs.filter(p => p.distance === 2);
    const distance3Pairs = taskAPairs.filter(p => p.distance === 3);
    
    console.log(`  距離2のペア: ${distance2Pairs.length}個`);
    distance2Pairs.forEach(p => {
      console.log(`    (${p.node1}, ${p.node2})`);
    });
    
    console.log(`  距離3のペア: ${distance3Pairs.length}個`);
    distance3Pairs.forEach(p => {
      console.log(`    (${p.node1}, ${p.node2})`);
    });
    
    // タスクB用のペアを検索
    console.log('\nタスクB用のペア（共通隣接ノード1〜4個）:');
    const taskBPairs = findTaskBPairs(graphData);
    const commonNeighborGroups = new Map<number, number>();
    taskBPairs.forEach(p => {
      const count = commonNeighborGroups.get(p.commonNeighbors) || 0;
      commonNeighborGroups.set(p.commonNeighbors, count + 1);
    });
    
    console.log(`  合計: ${taskBPairs.length}個`);
    for (let i = 1; i <= 4; i++) {
      const pairs = taskBPairs.filter(p => p.commonNeighbors === i);
      console.log(`  共通隣接ノード${i}個: ${pairs.length}個`);
      pairs.forEach(p => {
        console.log(`    (${p.node1}, ${p.node2})`);
      });
    }
  }
}

main();

