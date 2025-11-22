import { ParticipantData, TrialResult, SurveyResponse } from '../types/experiment';

const STORAGE_PREFIX = 'experiment_data_';

/**
 * Save participant data to local storage
 */
export function saveToLocalStorage(participantId: string, data: ParticipantData): void {
  try {
    const key = `${STORAGE_PREFIX}${participantId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to local storage:', error);
  }
}

/**
 * Load participant data from local storage
 */
export function loadFromLocalStorage(participantId: string): ParticipantData | null {
  try {
    const key = `${STORAGE_PREFIX}${participantId}`;
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as ParticipantData;
    }
  } catch (error) {
    console.error('Failed to load from local storage:', error);
  }
  return null;
}

/**
 * Export data as CSV
 */
export function exportToCSV(data: ParticipantData): void {
  const rows: string[] = [];
  
  // CSV header
  const headers = [
    'subject_id',
    'task',
    'trial_id',
    'condition',
    'axis_offset',
    'graph_file',
    'highlighted_nodes',
    'answer',
    'correct',
    'reaction_time_ms',
    'click_count',
    'timestamp',
    'survey_clarity',
    'survey_fatigue',
    'survey_timestamp',
  ];
  rows.push(headers.join(','));
  
  // CSV rows
  data.trials.forEach(trial => {
    const row = [
      data.participant_id,
      trial.task,
      trial.trial_id,
      trial.condition,
      trial.axis_offset.toString(),
      trial.graph_file,
      `"${trial.highlighted_nodes.join(',')}"`,
      `"${trial.answer}"`,
      trial.correct ? '1' : '0',
      trial.reaction_time_ms.toString(),
      trial.click_count.toString(),
      trial.timestamp,
      trial.survey_response?.clarity.toString() || '',
      trial.survey_response?.fatigue.toString() || '',
      trial.survey_response?.timestamp || '',
    ];
    rows.push(row.join(','));
  });
  
  // Create CSV content
  const csvContent = rows.join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `experiment_results_${data.participant_id}_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data as JSON
 */
export function exportToJSON(data: ParticipantData): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `experiment_results_${data.participant_id}_${Date.now()}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Create a new participant data object
 */
export function createParticipantData(participantId: string): ParticipantData {
  return {
    participant_id: participantId,
    trials: [],
    start_time: new Date().toISOString(),
  };
}

/**
 * Add trial result to participant data
 */
export function addTrialResult(
  data: ParticipantData,
  result: TrialResult
): ParticipantData {
  return {
    ...data,
    trials: [...data.trials, result],
  };
}

/**
 * Add survey response to the last trial
 */
export function addSurveyResponse(
  data: ParticipantData,
  response: SurveyResponse
): ParticipantData {
  if (data.trials.length === 0) {
    return data;
  }
  
  const updatedTrials = [...data.trials];
  const lastTrial = updatedTrials[updatedTrials.length - 1];
  updatedTrials[updatedTrials.length - 1] = {
    ...lastTrial,
    survey_response: response,
  };
  
  return {
    ...data,
    trials: updatedTrials,
  };
}

/**
 * Mark experiment as complete
 */
export function completeExperiment(data: ParticipantData): ParticipantData {
  return {
    ...data,
    end_time: new Date().toISOString(),
  };
}

/**
 * Save trial result to server
 */
export async function saveTrialToServer(result: TrialResult): Promise<void> {
  try {
    const response = await fetch('/api/save-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to save trial');
    }
    
    console.log('[Server Save] Trial result saved:', result.trial_id);
  } catch (error) {
    console.error('Error saving trial to server:', error);
    // エラーが発生しても実験は続行できるようにする（localStorageには保存されている）
  }
}

/**
 * Save survey response to server
 * 注意: 現在はトライアルと一緒に保存されるため、この関数は使用されない可能性があります
 */
export async function saveSurveyToServer(
  participantId: string,
  response: SurveyResponse
): Promise<void> {
  try {
    // サーベイはトライアルデータと一緒に保存されるため、ここでは何もしない
    console.log('[Server Save] Survey response included in trial data');
  } catch (error) {
    console.error('Error saving survey to server:', error);
  }
}

/**
 * Complete experiment on server
 */
export async function completeExperimentOnServer(
  data: ParticipantData
): Promise<void> {
  try {
    const response = await fetch('/api/complete-experiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to complete experiment');
    }
    
    console.log('[Server Save] Experiment completed:', data.participant_id);
  } catch (error) {
    console.error('Error completing experiment on server:', error);
    // エラーが発生しても実験は続行できるようにする
  }
}

