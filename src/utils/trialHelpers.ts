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

