import { Trial, TaskType } from '../types/experiment';

/**
 * Find the first trial index for a given task
 */
export function findFirstTrialIndexForTask(trials: Trial[], task: TaskType): number {
  return trials.findIndex(t => t.task === task);
}

/**
 * Check if all trials are completed
 */
export function areAllTrialsComplete(currentIndex: number, totalTrials: number): boolean {
  return currentIndex + 1 >= totalTrials;
}

/**
 * Check if task changed between current and next trial
 */
export function hasTaskChanged(
  trials: Trial[],
  currentIndex: number,
  nextIndex: number
): boolean {
  if (nextIndex >= trials.length) return false;
  const currentTrial = trials[currentIndex];
  const nextTrial = trials[nextIndex];
  return nextTrial.task !== currentTrial.task;
}

/**
 * Get the next task from trials
 */
export function getNextTask(trials: Trial[], currentIndex: number): TaskType | null {
  const nextIndex = currentIndex + 1;
  if (nextIndex >= trials.length) return null;
  return trials[nextIndex].task;
}

/**
 * Check if both tasks (A and B) are completed
 */
export function areBothTasksComplete(trials: Trial[], currentIndex: number): boolean {
  if (currentIndex + 1 < trials.length) return false; // Not all trials completed yet
  
  // Check if both task A and task B exist in trials
  const hasTaskA = trials.some(t => t.task === 'A');
  const hasTaskB = trials.some(t => t.task === 'B');
  
  if (!hasTaskA || !hasTaskB) return false; // Both tasks must exist
  
  // Check if all trials for both tasks are completed
  // Since currentIndex + 1 >= trials.length, all trials are completed
  return true;
}

