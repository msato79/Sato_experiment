import { useState, useCallback } from 'react';
import { ParticipantData, TrialResult, SurveyResponse } from '../types/experiment';
import {
  createParticipantData,
  addTrialResult,
  addSurveyResponse,
  saveToLocalStorage,
  completeExperiment,
  saveTrialToServer,
  saveSurveyToServer,
  completeExperimentOnServer,
} from '../lib/data-logger';

/**
 * Hook for managing participant data and logging
 */
export function useDataLogging(participantId: string) {
  const [participantData, setParticipantData] = useState<ParticipantData | null>(null);

  const initializeParticipantData = useCallback((id: string) => {
    const data = createParticipantData(id);
    setParticipantData(data);
    return data;
  }, []);

  const logTrialResult = useCallback(async (result: TrialResult) => {
    if (!participantData) return;

    // Add subject_id to result
    const completeResult: TrialResult = {
      ...result,
      subject_id: participantData.participant_id,
    };

    // Add trial result to participant data
    const updatedData = addTrialResult(participantData, completeResult);
    setParticipantData(updatedData);
    
    // Save to local storage (バックアップ)
    saveToLocalStorage(participantId, updatedData);
    
    // Save to server (将来の実装用、現在はログ出力のみ)
    await saveTrialToServer(completeResult);

    return updatedData;
  }, [participantData, participantId]);

  const logSurveyResponse = useCallback(async (response: SurveyResponse) => {
    if (!participantData) return;

    // Add survey response to last trial
    const updatedData = addSurveyResponse(participantData, response);
    setParticipantData(updatedData);
    
    // Save to local storage (バックアップ)
    saveToLocalStorage(participantId, updatedData);
    
    // Save to server (将来の実装用、現在はログ出力のみ)
    await saveSurveyToServer(participantId, response);

    return updatedData;
  }, [participantData, participantId]);

  const finalizeExperiment = useCallback(async () => {
    if (!participantData) return null;

    const completedData = completeExperiment(participantData);
    setParticipantData(completedData);
    
    // Save to server (将来の実装用、現在はログ出力のみ)
    await completeExperimentOnServer(completedData);

    return completedData;
  }, [participantData]);

  return {
    participantData,
    initializeParticipantData,
    logTrialResult,
    logSurveyResponse,
    finalizeExperiment,
  };
}

