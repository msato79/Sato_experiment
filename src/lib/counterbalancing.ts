import { Trial } from '../types/experiment';

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

