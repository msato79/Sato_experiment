import * as fs from 'fs';
import * as path from 'path';

/**
 * 本番用のconditions.csvを生成
 * 
 * タスクA: 距離2と距離3を各6個ずつ（半々）、紛らわしいペアを優先
 * タスクB: 共通隣接ノード1〜3個のペア（合計12個）、ハブノード（1~5）を含むペアも含む
 * 
 * 各条件（A, B, C, D）に適切に配分
 */

// タスクA用のペア（距離2と距離3を各6個ずつ、紛らわしいペアを優先）
const taskAPairs = {
  distance2: [
    { node1: 16, node2: 18 },
    { node1: 14, node2: 16 },
    { node1: 7, node2: 36 },
    { node1: 14, node2: 22 },
    { node1: 22, node2: 36 },
    { node1: 30, node2: 38 },
  ],
  distance3: [
    { node1: 17, node2: 22 },
    { node1: 16, node2: 30 },
    { node1: 17, node2: 30 },
    { node1: 12, node2: 38 },
    { node1: 7, node2: 19 },
    { node1: 7, node2: 16 },
  ],
};

// タスクB用のペア（共通隣接ノード1〜3個、合計12個、ハブノード含む）
const taskBPairs = {
  common1: [
    { node1: 1, node2: 14 },
    { node1: 1, node2: 16 },
    { node1: 1, node2: 17 },
    { node1: 2, node2: 7 },
  ],
  common2: [
    { node1: 2, node2: 11 },
    { node1: 2, node2: 12 },
    { node1: 3, node2: 14 },
    { node1: 3, node2: 16 },
  ],
  common3: [
    { node1: 3, node2: 8 },
    { node1: 4, node2: 8 },
    { node1: 4, node2: 11 },
    { node1: 4, node2: 18 },
  ],
};

// 条件ごとの配分
// タスクA: 各条件に3個ずつ（距離2と距離3を適切に配分）
// タスクB: 各条件に3個ずつ（共通隣接ノード1〜3個を適切に配分）
const conditions = [
  {
    condition: 'A',
    taskA: [
      ...taskAPairs.distance2.slice(0, 1), // 距離2: 1個
      ...taskAPairs.distance3.slice(0, 2), // 距離3: 2個
    ],
    taskB: [
      ...taskBPairs.common1.slice(0, 1), // 共通隣接1個: 1個
      ...taskBPairs.common2.slice(0, 1), // 共通隣接2個: 1個
      ...taskBPairs.common3.slice(0, 1), // 共通隣接3個: 1個
    ],
  },
  {
    condition: 'B',
    taskA: [
      ...taskAPairs.distance2.slice(1, 2), // 距離2: 1個
      ...taskAPairs.distance3.slice(2, 4), // 距離3: 2個
    ],
    taskB: [
      ...taskBPairs.common1.slice(1, 2), // 共通隣接1個: 1個
      ...taskBPairs.common2.slice(1, 2), // 共通隣接2個: 1個
      ...taskBPairs.common3.slice(1, 2), // 共通隣接3個: 1個
    ],
  },
  {
    condition: 'C',
    taskA: [
      ...taskAPairs.distance2.slice(2, 4), // 距離2: 2個
      ...taskAPairs.distance3.slice(4, 5), // 距離3: 1個
    ],
    taskB: [
      ...taskBPairs.common1.slice(2, 3), // 共通隣接1個: 1個
      ...taskBPairs.common2.slice(2, 3), // 共通隣接2個: 1個
      ...taskBPairs.common3.slice(2, 3), // 共通隣接3個: 1個
    ],
  },
  {
    condition: 'D',
    taskA: [
      ...taskAPairs.distance2.slice(4, 6), // 距離2: 2個
      ...taskAPairs.distance3.slice(5, 6), // 距離3: 1個
    ],
    taskB: [
      ...taskBPairs.common1.slice(3, 4), // 共通隣接1個: 1個
      ...taskBPairs.common2.slice(3, 4), // 共通隣接2個: 1個
      ...taskBPairs.common3.slice(3, 4), // 共通隣接3個: 1個
    ],
  },
];

// CSVを生成
function generateCSV(): string {
  const lines: string[] = ['trial_id,task,graph_file,condition,axis_offset,node1,node2,node_pair_id'];
  
  let pairIdCounter = 1;
  
  // 各条件について
  conditions.forEach((cond, condIndex) => {
    // タスクAのトライアル
    cond.taskA.forEach((pair, index) => {
      const trialId = `tA_${condIndex * 3 + index + 1}`;
      const pairId = `pair_${pairIdCounter++}`;
      lines.push(`${trialId},A,graphs/graph_ba_n40_e114.csv,${cond.condition},0,${pair.node1},${pair.node2},${pairId}`);
    });
    
    // タスクBのトライアル
    cond.taskB.forEach((pair, index) => {
      const trialId = `tB_${condIndex * 3 + index + 1}`;
      const pairId = `pair_${pairIdCounter++}`;
      lines.push(`${trialId},B,graphs/graph_ba_n40_e114.csv,${cond.condition},0,${pair.node1},${pair.node2},${pairId}`);
    });
  });
  
  return lines.join('\n');
}

// メイン処理
function main() {
  const csvContent = generateCSV();
  const outputPath = path.join(process.cwd(), 'public/conditions.csv');
  
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
  console.log('conditions.csvを生成しました:');
  console.log(csvContent);
}

main();
