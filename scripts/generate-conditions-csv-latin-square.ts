import * as fs from 'fs';
import * as path from 'path';

/**
 * ラテン方格法用のconditions.csvを生成
 * 
 * 条件は固定せず、セット情報のみを定義
 * 条件は参加者IDに基づいて動的に割り当てられる
 */

// タスクA用のペア（距離2と距離3を各6個ずつ、紛らわしいペアを優先）
const taskAPairs = {
  distance2: [
    { node1: 16, node2: 18, pairId: 'pair_1' },
    { node1: 14, node2: 16, pairId: 'pair_2' },
    { node1: 7, node2: 36, pairId: 'pair_3' },
    { node1: 14, node2: 22, pairId: 'pair_7' },
    { node1: 17, node2: 30, pairId: 'pair_8' },
    { node1: 12, node2: 38, pairId: 'pair_9' },
  ],
  distance3: [
    { node1: 17, node2: 22, pairId: 'pair_13' },
    { node1: 16, node2: 30, pairId: 'pair_14' },
    { node1: 17, node2: 30, pairId: 'pair_15' },
    { node1: 22, node2: 36, pairId: 'pair_19' },
    { node1: 30, node2: 38, pairId: 'pair_20' },
    { node1: 7, node2: 16, pairId: 'pair_21' },
  ],
};

// タスクB用のペア（共通隣接ノード1〜3個、合計12個、ハブノード含む）
const taskBPairs = {
  common1: [
    { node1: 1, node2: 14, pairId: 'pair_4' },
    { node1: 1, node2: 16, pairId: 'pair_10' },
    { node1: 1, node2: 17, pairId: 'pair_16' },
    { node1: 2, node2: 7, pairId: 'pair_22' },
  ],
  common2: [
    { node1: 2, node2: 11, pairId: 'pair_5' },
    { node1: 2, node2: 12, pairId: 'pair_11' },
    { node1: 3, node2: 14, pairId: 'pair_17' },
    { node1: 3, node2: 16, pairId: 'pair_23' },
  ],
  common3: [
    { node1: 3, node2: 8, pairId: 'pair_6' },
    { node1: 4, node2: 8, pairId: 'pair_12' },
    { node1: 4, node2: 11, pairId: 'pair_18' },
    { node1: 4, node2: 18, pairId: 'pair_24' },
  ],
};

// セットごとにグループ化（各セット3ペア）
// タスクA: セット1-4（各セット3ペア）
// タスクB: セット1-4（各セット3ペア）
const taskASets = [
  // セット1: 距離2の最初の3ペア
  taskAPairs.distance2.slice(0, 3),
  // セット2: 距離2の残り3ペア
  taskAPairs.distance2.slice(3, 6),
  // セット3: 距離3の最初の3ペア
  taskAPairs.distance3.slice(0, 3),
  // セット4: 距離3の残り3ペア
  taskAPairs.distance3.slice(3, 6),
];

const taskBSets = [
  // セット1: 共通隣接1個の最初の3ペア
  [...taskBPairs.common1.slice(0, 3), taskBPairs.common1[3]],
  // セット2: 共通隣接2個の最初の3ペア
  [...taskBPairs.common2.slice(0, 3), taskBPairs.common2[3]],
  // セット3: 共通隣接3個の最初の3ペア
  [...taskBPairs.common3.slice(0, 3), taskBPairs.common3[3]],
  // セット4: 残り（実際には各セット3ペアになるように調整）
  [],
];

// タスクBのセットを再調整（各セット3ペア）
const taskBSetsAdjusted = [
  taskBPairs.common1.slice(0, 3),
  taskBPairs.common2.slice(0, 3),
  taskBPairs.common3.slice(0, 3),
  [...taskBPairs.common1.slice(3, 4), ...taskBPairs.common2.slice(3, 4), ...taskBPairs.common3.slice(3, 4)],
];

// CSVを生成（条件は含めず、セット情報のみ）
function generateCSV(): string {
  const lines: string[] = ['node_pair_id,task,graph_file,node1,node2,set_id'];
  
  // タスクAのセット
  taskASets.forEach((set, setIndex) => {
    set.forEach((pair, pairIndex) => {
      const setId = setIndex + 1;
      const trialId = `tA_${setId}_${pairIndex + 1}`;
      lines.push(`${pair.pairId},A,graphs/graph_ba_n40_e114.csv,${pair.node1},${pair.node2},${setId}`);
    });
  });
  
  // タスクBのセット
  taskBSetsAdjusted.forEach((set, setIndex) => {
    set.forEach((pair, pairIndex) => {
      const setId = setIndex + 1;
      const trialId = `tB_${setId}_${pairIndex + 1}`;
      lines.push(`${pair.pairId},B,graphs/graph_ba_n40_e114.csv,${pair.node1},${pair.node2},${setId}`);
    });
  });
  
  return lines.join('\n');
}

// メイン処理
function main() {
  const csvContent = generateCSV();
  const outputPath = path.join(process.cwd(), 'public/conditions.csv');
  
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
  console.log('conditions.csvを生成しました（ラテン方格法用）:');
  console.log(csvContent);
  console.log('\n各セットのペア数:');
  console.log('タスクA:');
  taskASets.forEach((set, i) => {
    console.log(`  セット${i + 1}: ${set.length}ペア`);
  });
  console.log('タスクB:');
  taskBSetsAdjusted.forEach((set, i) => {
    console.log(`  セット${i + 1}: ${set.length}ペア`);
  });
}

main();

