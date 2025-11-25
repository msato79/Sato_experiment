import { useState, useEffect } from 'react';
import { Trial } from '../types/experiment';
import { parseConditionsCSV, separateTrialsByTask } from '../lib/csv-parser';
import { reorderTrials } from '../lib/counterbalancing';

/**
 * Hook for loading and managing experiment conditions
 */
export function useConditionsLoader(participantId: string) {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadConditions = async (id?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/conditions.csv');
      const csvText = await response.text();
      const allTrials = parseConditionsCSV(csvText);
      const { taskA, taskB } = separateTrialsByTask(allTrials);
      
      // Debug: Log trial counts
      console.log('Loaded trials:', {
        total: allTrials.length,
        taskA: taskA.length,
        taskB: taskB.length
      });
      
      const participantIdToUse = id || participantId;
      
      if (participantIdToUse) {
        // Task order is fixed (A->B), but trial order within each task is randomized
        // Uses participant ID as seed for reproducible randomization
        const orderedTrials = reorderTrials(taskA, taskB, participantIdToUse);
        
        // Verify both tasks are included
        const taskACount = orderedTrials.filter(t => t.task === 'A').length;
        const taskBCount = orderedTrials.filter(t => t.task === 'B').length;
        console.log('Ordered trials:', {
          total: orderedTrials.length,
          taskA: taskACount,
          taskB: taskBCount,
          taskOrder: 'A->B (fixed)',
          participantId: participantIdToUse,
          firstFewTrials: orderedTrials.slice(0, 5).map(t => ({ id: t.trial_id, condition: t.condition }))
        });
        
        if (taskACount === 0 || taskBCount === 0) {
          console.error('ERROR: Missing trials for one or both tasks!', {
            taskA: taskACount,
            taskB: taskBCount
          });
        }
        
        setTrials(orderedTrials);
      } else {
        // Default order (both tasks, no randomization) - should not happen in normal flow
        console.warn('Warning: Loading conditions without participant ID - no randomization applied');
        setTrials([...taskA, ...taskB]);
      }
    } catch (error) {
      console.error('Failed to load conditions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    trials,
    isLoading,
    loadConditions,
  };
}

