import { ExperimentPhase } from '../hooks/useExperimentPhase';
import { TaskType } from '../types/experiment';
import { experimentConfig } from '../config/experiment.config';

/**
 * Get instruction phase for a task
 */
export function getInstructionPhase(task: TaskType): ExperimentPhase {
  return task === 'A' ? 'instruction-taskA' : 'instruction-taskB';
}

/**
 * Get practice phase for a task
 */
export function getPracticePhase(task: TaskType): ExperimentPhase {
  return task === 'A' ? 'practice-taskA' : 'practice-taskB';
}

/**
 * Determine if survey should be shown after trial
 */
export function shouldShowSurveyAfterTrial(): boolean {
  return experimentConfig.PER_TRIAL_SURVEY;
}

/**
 * Determine if survey should be shown after task block
 */
export function shouldShowSurveyAfterBlock(): boolean {
  return !experimentConfig.PER_TRIAL_SURVEY;
}

