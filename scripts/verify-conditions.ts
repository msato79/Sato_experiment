import * as fs from 'fs';
import * as path from 'path';
import { GraphData, parseCSV } from '../src/csv';
import { getShortestPathDistance, findCommonNeighbors } from '../src/lib/path-finder';
import { parseConditionsCSV } from '../src/lib/csv-parser';

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
 * メイン処理
 */
function main() {
  // conditions.csvを読み込む
  const conditionsPath = path.join(process.cwd(), 'public/conditions.csv');
  const conditionsCsv = fs.readFileSync(conditionsPath, 'utf-8');
  const trials = parseConditionsCSV(conditionsCsv);
  
  // グラフデータを読み込む
  const graphPath = path.join(process.cwd(), 'public/graphs/graph_ba_n40_e114.csv');
  const graphCsv = fs.readFileSync(graphPath, 'utf-8');
  const graphData = parseCSV(graphCsv);
  
  console.log('=== ノードペアの検証 ===\n');
  
  const taskATrials = trials.filter(t => t.task === 'A');
  const taskBTrials = trials.filter(t => t.task === 'B');
  
  console.log(`タスクA: ${taskATrials.length}個のトライアル`);
  console.log(`タスクB: ${taskBTrials.length}個のトライアル\n`);
  
  // タスクAの検証
  console.log('=== タスクAの検証 ===');
  const distance2Count = { A: 0, B: 0, C: 0, D: 0 };
  const distance3Count = { A: 0, B: 0, C: 0, D: 0 };
  const invalidPairs: string[] = [];
  
  taskATrials.forEach(trial => {
    const degree1 = getNodeDegree(graphData, trial.node1);
    const degree2 = getNodeDegree(graphData, trial.node2);
    const distance = getShortestPathDistance(graphData, trial.node1, trial.node2);
    
    // ノードの次数が4〜6でない場合はエラー
    if (degree1 < 4 || degree1 > 6 || degree2 < 4 || degree2 > 6) {
      invalidPairs.push(`タスクA ${trial.trial_id}: ノード${trial.node1}(次数${degree1})とノード${trial.node2}(次数${degree2})の次数が4〜6の範囲外`);
    }
    
    // 距離が2または3でない場合はエラー
    if (distance !== 2 && distance !== 3) {
      invalidPairs.push(`タスクA ${trial.trial_id}: ノード${trial.node1}とノード${trial.node2}の距離が${distance}（2または3である必要があります）`);
    }
    
    if (distance === 2) {
      distance2Count[trial.condition]++;
    } else if (distance === 3) {
      distance3Count[trial.condition]++;
    }
  });
  
  console.log('距離2のペア数:');
  Object.entries(distance2Count).forEach(([cond, count]) => {
    console.log(`  条件${cond}: ${count}個`);
  });
  
  console.log('距離3のペア数:');
  Object.entries(distance3Count).forEach(([cond, count]) => {
    console.log(`  条件${cond}: ${count}個`);
  });
  
  const totalDistance2 = Object.values(distance2Count).reduce((a, b) => a + b, 0);
  const totalDistance3 = Object.values(distance3Count).reduce((a, b) => a + b, 0);
  console.log(`\n合計: 距離2=${totalDistance2}個、距離3=${totalDistance3}個`);
  
  if (totalDistance2 !== totalDistance3) {
    console.log(`⚠️  警告: 距離2と距離3のペア数が同じではありません（比率が同じである必要があります）`);
  }
  
  // タスクBの検証
  console.log('\n=== タスクBの検証 ===');
  const commonNeighborCounts: Record<string, Record<number, number>> = {
    A: { 1: 0, 2: 0, 3: 0, 4: 0 },
    B: { 1: 0, 2: 0, 3: 0, 4: 0 },
    C: { 1: 0, 2: 0, 3: 0, 4: 0 },
    D: { 1: 0, 2: 0, 3: 0, 4: 0 },
  };
  
  taskBTrials.forEach(trial => {
    const degree1 = getNodeDegree(graphData, trial.node1);
    const degree2 = getNodeDegree(graphData, trial.node2);
    const commonNeighbors = findCommonNeighbors(graphData, trial.node1, trial.node2);
    const commonCount = commonNeighbors.length;
    
    const hubNodes = new Set([1, 2, 3, 4, 5]);
    const isHub1 = hubNodes.has(trial.node1);
    const isHub2 = hubNodes.has(trial.node2);
    
    // ハブノードでない場合、次数が4〜8である必要がある
    // ハブノードの場合は次数制限を緩和
    if (!isHub1 && (degree1 < 4 || degree1 > 8)) {
      invalidPairs.push(`タスクB ${trial.trial_id}: ノード${trial.node1}(次数${degree1})の次数が4〜8の範囲外`);
    }
    if (!isHub2 && (degree2 < 4 || degree2 > 8)) {
      invalidPairs.push(`タスクB ${trial.trial_id}: ノード${trial.node2}(次数${degree2})の次数が4〜8の範囲外`);
    }
    
    // 共通隣接ノードが1〜4個でない場合はエラー
    if (commonCount < 1 || commonCount > 4) {
      invalidPairs.push(`タスクB ${trial.trial_id}: ノード${trial.node1}とノード${trial.node2}の共通隣接ノードが${commonCount}個（1〜4個である必要があります）`);
    }
    
    if (commonCount >= 1 && commonCount <= 4) {
      commonNeighborCounts[trial.condition][commonCount]++;
    }
  });
  
  console.log('共通隣接ノードの数:');
  ['A', 'B', 'C', 'D'].forEach(cond => {
    console.log(`  条件${cond}:`);
    for (let i = 1; i <= 4; i++) {
      console.log(`    共通隣接${i}個: ${commonNeighborCounts[cond][i]}個`);
    }
  });
  
  // エラーの表示
  if (invalidPairs.length > 0) {
    console.log('\n❌ エラー:');
    invalidPairs.forEach(err => console.log(`  ${err}`));
  } else {
    console.log('\n✅ すべてのノードペアが要件を満たしています');
  }
}

main();

