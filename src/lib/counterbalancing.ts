import { Trial, Condition } from '../types/experiment';

/**
 * Simple seeded random number generator
 * Uses Linear Congruential Generator (LCG)
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    // LCG parameters (used by glibc)
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm with seeded random
 */
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const rng = new SeededRandom(seed);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Simple string hash function to generate seed from participant ID
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * ラテン方格法で条件を割り当て
 * 各セット（3ペア）に条件A, B, C, Dを1つずつ割り当て
 * 被験者IDに基づいてセットと条件の対応を変える
 * 
 * ラテン方格のパターン:
 * 被験者1: セット1→A, セット2→B, セット3→C, セット4→D
 * 被験者2: セット1→B, セット2→C, セット3→D, セット4→A
 * 被験者3: セット1→C, セット2→D, セット3→A, セット4→B
 * 被験者4: セット1→D, セット2→A, セット3→B, セット4→C
 * 被験者5以降は被験者1-4のパターンを繰り返す
 */
export function assignConditionsByLatinSquare(
  trials: Trial[],
  participantId: string
): Trial[] {
  // セットIDごとにグループ化
  const trialsBySet = new Map<number, Trial[]>();
  trials.forEach(trial => {
    if (trial.set_id === undefined) {
      // set_idがない場合は、node_pair_idから推測
      const pairIdMatch = trial.node_pair_id?.match(/pair_(\d+)/);
      if (pairIdMatch) {
        const pairId = parseInt(pairIdMatch[1]);
        // タスクA: pair_1-3→セット1, pair_7-9→セット2, pair_13-15→セット3, pair_19-21→セット4
        // タスクB: pair_4-6→セット1, pair_10-12→セット2, pair_16-18→セット3, pair_22-24→セット4
        let setId: number;
        if (trial.task === 'A') {
          if (pairId <= 3) setId = 1;
          else if (pairId <= 9) setId = 2;
          else if (pairId <= 15) setId = 3;
          else setId = 4;
        } else {
          if (pairId <= 6) setId = 1;
          else if (pairId <= 12) setId = 2;
          else if (pairId <= 18) setId = 3;
          else setId = 4;
        }
        trial.set_id = setId;
      } else {
        console.warn(`Cannot determine set_id for trial ${trial.trial_id}`);
        return;
      }
    }
    
    const setId = trial.set_id;
    if (!trialsBySet.has(setId)) {
      trialsBySet.set(setId, []);
    }
    trialsBySet.get(setId)!.push(trial);
  });
  
  // 被験者IDを数値に変換（文字列の場合はハッシュ）
  let participantNumber: number;
  const numericId = parseInt(participantId);
  if (!isNaN(numericId)) {
    participantNumber = numericId;
  } else {
    participantNumber = hashString(participantId);
  }
  
  // ラテン方格: 被験者番号を4で割った余りでパターンを決定
  const patternIndex = participantNumber % 4;
  
  // ラテン方格のパターン定義（4×4のラテン方格）
  const latinSquarePatterns: Condition[][] = [
    ['A', 'B', 'C', 'D'], // パターン0: セット1→A, セット2→B, セット3→C, セット4→D
    ['B', 'C', 'D', 'A'], // パターン1: セット1→B, セット2→C, セット3→D, セット4→A
    ['C', 'D', 'A', 'B'], // パターン2: セット1→C, セット2→D, セット3→A, セット4→B
    ['D', 'A', 'B', 'C'], // パターン3: セット1→D, セット2→A, セット3→B, セット4→C
  ];
  
  const conditionPattern = latinSquarePatterns[patternIndex];
  
  // 各セットに条件を割り当て
  const assignedTrials: Trial[] = [];
  const setNumbers = Array.from(trialsBySet.keys()).sort((a, b) => a - b);
  
  setNumbers.forEach((setNumber) => {
    const setTrials = trialsBySet.get(setNumber)!;
    // ラテン方格に基づいて条件を割り当て
    const assignedCondition = conditionPattern[setNumber - 1];
    
    setTrials.forEach(trial => {
      assignedTrials.push({
        ...trial,
        condition: assignedCondition,
      });
    });
  });
  
  return assignedTrials;
}

/**
 * Reorder trials: Task order is fixed (A->B), but trial order within each task is randomized
 * Uses participant ID as seed for reproducible randomization
 */
export function reorderTrials(
  taskATrials: Trial[],
  taskBTrials: Trial[],
  participantId: string
): Trial[] {
  // Validate that both tasks have trials
  if (taskATrials.length === 0 || taskBTrials.length === 0) {
    console.warn('Warning: One or both tasks have no trials', {
      taskA: taskATrials.length,
      taskB: taskBTrials.length
    });
  }
  
  // Generate seed from participant ID
  const seed = hashString(participantId);
  
  // Shuffle trials within each task using seeded random
  const shuffledTaskA = shuffleArray(taskATrials, seed);
  const shuffledTaskB = shuffleArray(taskBTrials, seed + 1); // Use different seed for task B
  
  // Always return A->B order (fixed task order)
  return [...shuffledTaskA, ...shuffledTaskB];
}

