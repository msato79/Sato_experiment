import * as fs from 'fs';
import * as path from 'path';
import { parseConditionsCSV } from '../src/lib/csv-parser';
import { assignConditionsByLatinSquare } from '../src/lib/counterbalancing';

/**
 * ラテン方格法の動作をテスト
 */
function main() {
  const conditionsPath = path.join(process.cwd(), 'public/conditions.csv');
  const conditionsCsv = fs.readFileSync(conditionsPath, 'utf-8');
  const trials = parseConditionsCSV(conditionsCsv);
  
  console.log('=== ラテン方格法のテスト ===\n');
  console.log(`読み込んだトライアル数: ${trials.length}`);
  console.log(`タスクA: ${trials.filter(t => t.task === 'A').length}個`);
  console.log(`タスクB: ${trials.filter(t => t.task === 'B').length}個\n`);
  
  // 複数の被験者IDでテスト
  const testParticipantIds = ['1', '2', '3', '4', '5', '6', '7', '8'];
  
  console.log('=== 各被験者IDでの条件割り当て ===\n');
  
  const conditionDistribution: Record<string, Record<string, number>> = {};
  
  testParticipantIds.forEach(participantId => {
    const assignedTrials = assignConditionsByLatinSquare(trials, participantId);
    
    // セットごとの条件を確認
    const setConditions: Record<number, string> = {};
    assignedTrials.forEach(trial => {
      if (trial.set_id) {
        setConditions[trial.set_id] = trial.condition;
      }
    });
    
    console.log(`被験者${participantId}:`);
    console.log(`  セット1 → 条件${setConditions[1]}`);
    console.log(`  セット2 → 条件${setConditions[2]}`);
    console.log(`  セット3 → 条件${setConditions[3]}`);
    console.log(`  セット4 → 条件${setConditions[4]}`);
    
    // 条件の分布を記録
    assignedTrials.forEach(trial => {
      const key = `${trial.set_id}_${trial.condition}`;
      if (!conditionDistribution[key]) {
        conditionDistribution[key] = {};
      }
      conditionDistribution[key][participantId] = (conditionDistribution[key][participantId] || 0) + 1;
    });
    
    console.log('');
  });
  
  // バランスを確認
  console.log('=== バランス確認 ===\n');
  console.log('各セット×各条件の割り当て回数:');
  for (let setId = 1; setId <= 4; setId++) {
    for (const condition of ['A', 'B', 'C', 'D']) {
      const key = `${setId}_${condition}`;
      const count = Object.keys(conditionDistribution[key] || {}).length;
      console.log(`  セット${setId} × 条件${condition}: ${count}回`);
    }
  }
  
  // 各ノードペアがすべての条件で見られるか確認
  console.log('\n=== ノードペアの条件カバレッジ ===\n');
  const pairConditionCoverage: Record<string, Set<string>> = {};
  
  testParticipantIds.forEach(participantId => {
    const assignedTrials = assignConditionsByLatinSquare(trials, participantId);
    assignedTrials.forEach(trial => {
      if (trial.node_pair_id) {
        if (!pairConditionCoverage[trial.node_pair_id]) {
          pairConditionCoverage[trial.node_pair_id] = new Set();
        }
        pairConditionCoverage[trial.node_pair_id].add(trial.condition);
      }
    });
  });
  
  Object.entries(pairConditionCoverage).forEach(([pairId, conditions]) => {
    const coverage = Array.from(conditions).sort().join(', ');
    const isComplete = conditions.size === 4;
    console.log(`  ${pairId}: ${coverage} ${isComplete ? '✓' : '✗ (不完全)'}`);
  });
}

main();

