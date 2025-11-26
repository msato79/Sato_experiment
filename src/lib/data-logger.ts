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
      const parsed = JSON.parse(data) as ParticipantData;
      // 互換性のため: task_surveysが存在しない場合は空配列を設定
      if (!parsed.task_surveys) {
        parsed.task_surveys = [];
      }
      return parsed;
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
  
  // CSV header for trials
  const trialHeaders = [
    'subject_id',
    'task',
    'trial_id',
    'condition',
    'axis_offset',
    'graph_file',
    'node_pair_id',
    'node1',
    'node2',
    'highlighted_nodes',
    'answer',
    'correct',
    'reaction_time_ms',
    'click_count',
    'timestamp',
  ];
  rows.push(trialHeaders.join(','));
  
  // CSV rows for trials
  data.trials.forEach(trial => {
    const row = [
      data.participant_id,
      trial.task,
      trial.trial_id,
      trial.condition,
      trial.axis_offset.toString(),
      trial.graph_file,
      trial.node_pair_id || '',
      trial.highlighted_nodes[0]?.toString() || '',
      trial.highlighted_nodes[1]?.toString() || '',
      `"${trial.highlighted_nodes.join(',')}"`,
      `"${trial.answer}"`,
      trial.correct ? '1' : '0',
      trial.reaction_time_ms.toString(),
      trial.click_count.toString(),
      trial.timestamp,
    ];
    rows.push(row.join(','));
  });
  
  // Add empty row separator
  rows.push('');
  
  // CSV header for task surveys
  const surveyHeaders = [
    'subject_id',
    'task',
    'ranking_A',
    'ranking_B',
    'ranking_C',
    'ranking_D',
    'timestamp',
  ];
  rows.push(surveyHeaders.join(','));
  
  // CSV rows for task surveys
  data.task_surveys.forEach(survey => {
    const row = [
      data.participant_id,
      survey.task,
      survey.rankings.A.toString(),
      survey.rankings.B.toString(),
      survey.rankings.C.toString(),
      survey.rankings.D.toString(),
      survey.timestamp,
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
    task_surveys: [],
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
 * Add survey response to task surveys (タスクレベルのアンケートとして保存)
 */
export function addSurveyResponse(
  data: ParticipantData,
  response: SurveyResponse
): ParticipantData {
  return {
    ...data,
    task_surveys: [...data.task_surveys, response],
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
 * Save trial result to server (Supabase via Vercel API)
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
      throw new Error(`Failed to save trial: ${errorData.error || response.statusText}`);
    }
    
    console.log('[Server Save] Trial result saved successfully:', result.trial_id);
  } catch (error) {
    console.error('Error saving trial to server:', error);
    // エラーが発生しても実験は続行できるようにする（localStorageに保存されているため）
  }
}

/**
 * Save survey response to server (Supabase via Vercel API)
 */
export async function saveSurveyToServer(
  participantId: string,
  response: SurveyResponse
): Promise<void> {
  try {
    console.log('[Server Save] Attempting to save survey:', { participantId, task: response.task, rankings: response.rankings });
    
    const apiResponse = await fetch('/api/save-survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId, surveyResponse: response }),
    });
    
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[Server Save] Survey save failed:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        error: errorData
      });
      throw new Error(`Failed to save survey: ${errorData.error || apiResponse.statusText}`);
    }
    
    const result = await apiResponse.json();
    console.log('[Server Save] Survey response saved successfully:', { participantId, task: response.task, result });
  } catch (error) {
    console.error('[Server Save] Error saving survey to server:', error);
    // エラーが発生しても実験は続行できるようにする
  }
}

/**
 * Complete experiment on server (Supabase via Vercel API)
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
      throw new Error(`Failed to complete experiment: ${errorData.error || response.statusText}`);
    }
    
    console.log('[Server Save] Experiment completed successfully:', data.participant_id);
  } catch (error) {
    console.error('Error completing experiment on server:', error);
    // エラーが発生しても実験は続行できるようにする（localStorageに保存されているため）
  }
}

