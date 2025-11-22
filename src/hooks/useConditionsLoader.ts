import { useState, useEffect } from 'react';
import { Trial } from '../types/experiment';
import { parseConditionsCSV, separateTrialsByTask } from '../lib/csv-parser';
import { determineTaskOrder, reorderTrials } from '../lib/counterbalancing';
import { experimentConfig } from '../config/experiment.config';

/**
 * Hook for loading and managing experiment conditions
 */
export function useConditionsLoader(participantId: string) {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load conditions CSV on mount (without participant ID)
  useEffect(() => {
    const loadConditionsStructure = async () => {
      try {
        const response = await fetch('/conditions.csv');
        const csvText = await response.text();
        const allTrials = parseConditionsCSV(csvText);
        const { taskA, taskB } = separateTrialsByTask(allTrials);
        // Store trials temporarily - will be reordered when participant starts
        setTrials([...taskA, ...taskB]);
      } catch (error) {
        console.error('Failed to load conditions:', error);
      }
    };
    loadConditionsStructure();
  }, []);

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
        // Determine task order
        const taskOrder = determineTaskOrder(
          experimentConfig.COUNTERBALANCING_METHOD,
          participantIdToUse
        );
        
        console.log('Task order for participant', participantIdToUse, ':', taskOrder);
        
        // Reorder trials based on task order
        const orderedTrials = reorderTrials(taskA, taskB, taskOrder);
        
        // Verify both tasks are included
        const taskACount = orderedTrials.filter(t => t.task === 'A').length;
        const taskBCount = orderedTrials.filter(t => t.task === 'B').length;
        console.log('Ordered trials:', {
          total: orderedTrials.length,
          taskA: taskACount,
          taskB: taskBCount,
          order: taskOrder
        });
        
        if (taskACount === 0 || taskBCount === 0) {
          console.error('ERROR: Missing trials for one or both tasks!', {
            taskA: taskACount,
            taskB: taskBCount
          });
        }
        
        setTrials(orderedTrials);
      } else {
        // Default order (both tasks)
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

