import { TaskOrder } from '../types/experiment';
import { Trial } from '../types/experiment';

/**
 * Determine task order using counterbalancing
 */
export function determineTaskOrder(method: 'latin-square' | 'random', participantId: string): TaskOrder {
  if (method === 'random') {
    // Random assignment: 50% chance for each order
    return Math.random() < 0.5 ? 'A-B' : 'B-A';
  } else {
    // Latin square: alternate based on participant ID
    // Simple implementation: use participant ID hash
    const hash = hashString(participantId);
    return hash % 2 === 0 ? 'A-B' : 'B-A';
  }
}

/**
 * Reorder trials based on task order
 * Ensures both task A and task B trials are included
 */
export function reorderTrials(
  taskATrials: Trial[],
  taskBTrials: Trial[],
  taskOrder: TaskOrder
): Trial[] {
  // Validate that both tasks have trials
  if (taskATrials.length === 0 || taskBTrials.length === 0) {
    console.warn('Warning: One or both tasks have no trials', {
      taskA: taskATrials.length,
      taskB: taskBTrials.length
    });
  }
  
  if (taskOrder === 'A-B') {
    return [...taskATrials, ...taskBTrials];
  } else {
    return [...taskBTrials, ...taskATrials];
  }
}

/**
 * Simple string hash function
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

