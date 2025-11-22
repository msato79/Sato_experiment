import { Trial, TaskType } from '../types/experiment';

/**
 * Generate practice trials for a given task
 * Uses 4 practice graph files: graph_practice_1.csv through graph_practice_4.csv
 */
export function generatePracticeTrials(task: TaskType): Trial[] {
  if (task === 'A') {
    // Task A practice: 2 trials with different conditions
    return [
      {
        trial_id: 'practice_A_1',
        task: 'A',
        condition: 'A',
        axis_offset: 0,
        graph_file: 'graphs/graph_practice_1.csv',
        node1: 0,
        node2: 3,
        is_practice: true,
      },
      {
        trial_id: 'practice_A_2',
        task: 'A',
        condition: 'B',
        axis_offset: 0,
        graph_file: 'graphs/graph_practice_2.csv',
        node1: 1,
        node2: 4,
        is_practice: true,
      },
    ];
  } else {
    // Task B practice: 2 trials with different conditions
    return [
      {
        trial_id: 'practice_B_1',
        task: 'B',
        condition: 'A',
        axis_offset: 0,
        graph_file: 'graphs/graph_practice_3.csv',
        node1: 0,
        node2: 2,
        is_practice: true,
      },
      {
        trial_id: 'practice_B_2',
        task: 'B',
        condition: 'B',
        axis_offset: 0,
        graph_file: 'graphs/graph_practice_4.csv',
        node1: 1,
        node2: 3,
        is_practice: true,
      },
    ];
  }
}

