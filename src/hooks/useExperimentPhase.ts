import { useState, useCallback } from 'react';
import { TaskType } from '../types/experiment';

export type ExperimentPhase =
  | 'experiment-info'
  | 'participant-input'
  | 'consent'
  | 'instruction-taskA'
  | 'instruction-taskB'
  | 'practice-taskA'
  | 'practice-taskB'
  | 'trial'
  | 'survey'
  | 'summary';

/**
 * Hook for managing experiment phase transitions
 */
export function useExperimentPhase() {
  const [phase, setPhase] = useState<ExperimentPhase>('experiment-info');
  const [currentTask, setCurrentTask] = useState<TaskType | null>(null);

  const transitionToPhase = useCallback((newPhase: ExperimentPhase, task?: TaskType) => {
    setPhase(newPhase);
    if (task) {
      setCurrentTask(task);
    }
  }, []);

  const getPhaseForTask = useCallback((task: TaskType, phaseType: 'instruction' | 'practice'): ExperimentPhase => {
    if (phaseType === 'instruction') {
      return task === 'A' ? 'instruction-taskA' : 'instruction-taskB';
    } else {
      return task === 'A' ? 'practice-taskA' : 'practice-taskB';
    }
  }, []);

  return {
    phase,
    currentTask,
    setPhase,
    setCurrentTask,
    transitionToPhase,
    getPhaseForTask,
  };
}

