import { ExperimentConfig } from '../types/experiment';

export const experimentConfig: ExperimentConfig = {
  // If true, show survey after each trial. If false, show survey after each task block.
  PER_TRIAL_SURVEY: true,
  
  // Method for task order counterbalancing
  COUNTERBALANCING_METHOD: 'latin-square', // 'latin-square' | 'random'
};

