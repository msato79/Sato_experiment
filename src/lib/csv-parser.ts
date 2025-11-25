import { Trial } from '../types/experiment';

/**
 * Parse conditions CSV file
 * Expected format: trial_id, task, graph_file, condition, axis_offset, node1, node2 [, node_pair_id]
 * node_pair_id is optional (for backward compatibility)
 */
export function parseConditionsCSV(csvText: string): Trial[] {
  const lines = csvText.trim().split('\n');
  const trials: Trial[] = [];
  
  // Skip header line if present
  const startIndex = lines[0].includes('trial_id') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',').map(p => p.trim());
    
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
      node_pair_id: parts[7] || undefined, // Optional: node_pair_id
    };
    
    // Validate trial data
    if (!trial.trial_id || !trial.task || !trial.condition || !trial.graph_file) {
      console.warn(`Skipping invalid trial at line ${i + 1}: ${line}`);
      continue;
    }
    
    trials.push(trial);
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

