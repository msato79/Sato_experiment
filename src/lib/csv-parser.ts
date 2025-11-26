import { Trial, Condition } from '../types/experiment';

/**
 * Parse conditions CSV file
 * Supports two formats:
 * 1. Old format: trial_id, task, graph_file, condition, axis_offset, node1, node2 [, node_pair_id]
 * 2. New format (Latin Square): node_pair_id, task, graph_file, node1, node2, set_id
 */
export function parseConditionsCSV(csvText: string): Trial[] {
  const lines = csvText.trim().split('\n');
  const trials: Trial[] = [];
  
  // Skip header line if present
  const startIndex = lines[0].includes('node_pair_id') || lines[0].includes('trial_id') ? 1 : 0;
  
  // Check format by looking at header
  const isLatinSquareFormat = lines[0].includes('set_id');
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',').map(p => p.trim());
    
    if (isLatinSquareFormat) {
      // New format: node_pair_id, task, graph_file, node1, node2, set_id
      if (parts.length < 6) {
        console.warn(`Skipping invalid line ${i + 1}: ${line}`);
        continue;
      }
      
      const trial: Trial = {
        trial_id: `${parts[1]}_${parts[5]}_${parts[0]}`, // task_set_pairId形式
        task: parts[1] as 'A' | 'B',
        graph_file: parts[2],
        condition: 'A' as Condition, // 仮の値、後でラテン方格法で割り当てられる
        axis_offset: 0 as 0 | 1,
        node1: parseInt(parts[3]),
        node2: parseInt(parts[4]),
        node_pair_id: parts[0],
        set_id: parseInt(parts[5]),
      };
      
      // Validate trial data
      if (!trial.node_pair_id || !trial.task || !trial.graph_file || !trial.set_id) {
        console.warn(`Skipping invalid trial at line ${i + 1}: ${line}`);
        continue;
      }
      
      trials.push(trial);
    } else {
      // Old format: trial_id, task, graph_file, condition, axis_offset, node1, node2 [, node_pair_id]
      if (parts.length < 7) {
        console.warn(`Skipping invalid line ${i + 1}: ${line}`);
        continue;
      }
      
      const trial: Trial = {
        trial_id: parts[0],
        task: parts[1] as 'A' | 'B',
        graph_file: parts[2],
        condition: parts[3] as 'A' | 'B' | 'C' | 'D',
        axis_offset: parseInt(parts[4]) as 0 | 1,
        node1: parseInt(parts[5]),
        node2: parseInt(parts[6]),
        node_pair_id: parts[7] || undefined,
      };
      
      // Validate trial data
      if (!trial.trial_id || !trial.task || !trial.condition || !trial.graph_file) {
        console.warn(`Skipping invalid trial at line ${i + 1}: ${line}`);
        continue;
      }
      
      trials.push(trial);
    }
  }
  
  return trials;
}

/**
 * Separate trials by task
 */
export function separateTrialsByTask(trials: Trial[]): { taskA: Trial[]; taskB: Trial[] } {
  const taskA: Trial[] = [];
  const taskB: Trial[] = [];
  
  trials.forEach(trial => {
    if (trial.task === 'A') {
      taskA.push(trial);
    } else if (trial.task === 'B') {
      taskB.push(trial);
    }
  });
  
  return { taskA, taskB };
}

