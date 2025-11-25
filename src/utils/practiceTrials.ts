import { Trial, TaskType } from '../types/experiment';

/**
 * Generate practice trials for a given task
 * Uses graph_practice.csv for all practice trials
 */
export function generatePracticeTrials(task: TaskType): Trial[] {
  if (task === 'A') {
    // Task A practice: 2 trials with different conditions
    // Using node pairs that have distance 2 and distance 3 for practice
    // ノードの次数は4〜6、距離2と距離3のペアを1つずつ
    return [
      {
        trial_id: 'practice_A_1',
        task: 'A',
        condition: 'A',
        axis_offset: 0,
        graph_file: 'graphs/graph_practice.csv',
        node1: 4,
        node2: 7,
        is_practice: true,
      },
      {
        trial_id: 'practice_A_2',
        task: 'A',
        condition: 'B',
        axis_offset: 0,
        graph_file: 'graphs/graph_practice.csv',
        node1: 4,
        node2: 14,
        is_practice: true,
      },
    ];
  } else {
    // Task B practice: 2 trials with different conditions
    // Using node pairs that have common neighbors for practice
    // ノードの次数は4〜6、共通隣接ノード1個と2個のペアを1つずつ
    return [
      {
        trial_id: 'practice_B_1',
        task: 'B',
        condition: 'A',
        axis_offset: 0,
        graph_file: 'graphs/graph_practice.csv',
        node1: 4,
        node2: 7,
        is_practice: true,
      },
      {
        trial_id: 'practice_B_2',
        task: 'B',
        condition: 'B',
        axis_offset: 0,
        graph_file: 'graphs/graph_practice.csv',
        node1: 4,
        node2: 11,
        is_practice: true,
      },
    ];
  }
}

