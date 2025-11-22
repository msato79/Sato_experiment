import React, { useState, useCallback } from 'react';
import { ParticipantIdInput } from './components/ParticipantIdInput';
import { ExperimentInfoScreen } from './components/ExperimentInfoScreen';
import { ConsentForm } from './components/ConsentForm';
import { InstructionScreen } from './components/InstructionScreen';
import { TrialRunner } from './components/TrialRunner';
import { SurveyForm } from './components/SurveyForm';
import { SummaryScreen } from './components/SummaryScreen';
import { Trial, TrialResult, SurveyResponse } from './types/experiment';
import { useExperimentPhase } from './hooks/useExperimentPhase';
import { useConditionsLoader } from './hooks/useConditionsLoader';
import { useTrialManagement } from './hooks/useTrialManagement';
import { useDataLogging } from './hooks/useDataLogging';
import { generatePracticeTrials } from './utils/practiceTrials';
import { determineTaskOrder } from './lib/counterbalancing';
import { experimentConfig } from './config/experiment.config';
import {
  findFirstTrialIndexForTask,
  areAllTrialsComplete,
  hasTaskChanged,
  getNextTask,
} from './utils/trialHelpers';
import {
  getInstructionPhase,
  getPracticePhase,
  shouldShowSurveyAfterTrial,
  shouldShowSurveyAfterBlock,
} from './utils/phaseHelpers';

export function App() {
  const [participantId, setParticipantId] = useState<string>('');
  const [practiceTrials, setPracticeTrials] = useState<Trial[]>([]);

  // Custom hooks
  const { phase, currentTask, setPhase, setCurrentTask, transitionToPhase, getPhaseForTask } = useExperimentPhase();
  const { trials, loadConditions } = useConditionsLoader(participantId);
  const {
    currentGraphData,
    currentTrialIndex,
    currentPracticeIndex,
    loading,
    loadTrial,
    setTrialIndex,
    setPracticeIndex,
    resetIndices,
  } = useTrialManagement();
  const {
    participantData,
    initializeParticipantData,
    logTrialResult,
    logSurveyResponse,
    finalizeExperiment,
  } = useDataLogging(participantId);

  const handleExperimentInfoContinue = useCallback(() => {
    transitionToPhase('consent');
  }, [transitionToPhase]);

  const handleConsentAgree = useCallback(() => {
    transitionToPhase('participant-input');
  }, [transitionToPhase]);

  const handleConsentDisagree = useCallback(() => {
    // Show message and stay on consent form
  }, []);

  const handleParticipantStart = useCallback(async (id: string) => {
    setParticipantId(id);
    initializeParticipantData(id);
    await loadConditions(id);
    
    // Determine first task from task order
    const taskOrder = determineTaskOrder(experimentConfig.COUNTERBALANCING_METHOD, id);
    const firstTask = taskOrder === 'A-B' ? 'A' : 'B';
    setCurrentTask(firstTask);
    transitionToPhase(getInstructionPhase(firstTask), firstTask);
  }, [initializeParticipantData, loadConditions, setCurrentTask, transitionToPhase]);

  const handleInstructionContinue = useCallback(() => {
    if (!currentTask) return;
    
    const practice = generatePracticeTrials(currentTask);
    setPracticeTrials(practice);
    setPracticeIndex(0);
    loadTrial(practice[0]);
    transitionToPhase(getPracticePhase(currentTask), currentTask);
  }, [currentTask, setPracticeIndex, loadTrial, transitionToPhase]);

  const handlePracticeComplete = useCallback(() => {
    const nextPracticeIndex = currentPracticeIndex + 1;
    
    if (nextPracticeIndex < practiceTrials.length) {
      setPracticeIndex(nextPracticeIndex);
      loadTrial(practiceTrials[nextPracticeIndex]);
    } else {
      if (currentTask) {
        const firstTrialForTask = findFirstTrialIndexForTask(trials, currentTask);
        if (firstTrialForTask !== -1) {
          setTrialIndex(firstTrialForTask);
          loadTrial(trials[firstTrialForTask]);
          transitionToPhase('trial');
        }
      }
    }
  }, [currentPracticeIndex, practiceTrials, currentTask, trials, setPracticeIndex, setTrialIndex, loadTrial, transitionToPhase]);

  const moveToNextTrial = useCallback(async () => {
    if (!participantData) return;
    
    const nextIndex = currentTrialIndex + 1;
    
    if (areAllTrialsComplete(currentTrialIndex, trials.length)) {
      if (shouldShowSurveyAfterBlock()) {
        transitionToPhase('survey');
      } else {
        await finalizeExperiment();
        transitionToPhase('summary');
      }
      return;
    }
    
    const currentTrial = trials[currentTrialIndex];
    const nextTrial = trials[nextIndex];
    
    if (hasTaskChanged(trials, currentTrialIndex, nextIndex)) {
      if (shouldShowSurveyAfterBlock()) {
        transitionToPhase('survey');
      } else {
        const nextTask = getNextTask(trials, currentTrialIndex);
        if (nextTask) {
          setCurrentTask(nextTask);
          transitionToPhase(getInstructionPhase(nextTask), nextTask);
        }
      }
    } else {
      setTrialIndex(nextIndex);
      loadTrial(nextTrial);
      transitionToPhase('trial');
    }
  }, [participantData, currentTrialIndex, trials, setTrialIndex, setCurrentTask, loadTrial, transitionToPhase, finalizeExperiment]);

  const handleTrialComplete = useCallback(async (result: TrialResult, isPractice: boolean = false) => {
    if (isPractice) {
      handlePracticeComplete();
      return;
    }

    await logTrialResult(result);

    if (shouldShowSurveyAfterTrial()) {
      transitionToPhase('survey');
    } else {
      await moveToNextTrial();
    }
  }, [logTrialResult, handlePracticeComplete, moveToNextTrial, transitionToPhase]);

  const handleSurveySubmit = useCallback(async (response: SurveyResponse) => {
    if (!participantData) return;

    await logSurveyResponse(response);

    const nextIndex = currentTrialIndex + 1;
    if (areAllTrialsComplete(currentTrialIndex, trials.length)) {
      const completedData = await finalizeExperiment();
      if (completedData) {
        transitionToPhase('summary');
      }
      return;
    }

    const nextTrial = trials[nextIndex];
    const currentTrial = trials[currentTrialIndex];
    
    if (hasTaskChanged(trials, currentTrialIndex, nextIndex)) {
      const nextTask = getNextTask(trials, currentTrialIndex);
      if (nextTask) {
        setCurrentTask(nextTask);
        transitionToPhase(getInstructionPhase(nextTask), nextTask);
      }
    } else {
      setTrialIndex(nextIndex);
      loadTrial(nextTrial);
      transitionToPhase('trial');
    }
  }, [participantData, currentTrialIndex, trials, logSurveyResponse, finalizeExperiment, setTrialIndex, setCurrentTask, loadTrial, transitionToPhase]);

  // Render phase-specific components
  if (phase === 'experiment-info') {
    return <ExperimentInfoScreen onContinue={handleExperimentInfoContinue} />;
  }

  if (phase === 'consent') {
    return (
      <ConsentForm
        onAgree={handleConsentAgree}
        onDisagree={handleConsentDisagree}
      />
    );
  }

  if (phase === 'participant-input') {
    return <ParticipantIdInput onStart={handleParticipantStart} />;
  }

  if (phase === 'instruction-taskA' || phase === 'instruction-taskB') {
    return (
      <InstructionScreen
        task={currentTask || 'A'}
        onContinue={handleInstructionContinue}
      />
    );
  }

  if (phase === 'practice-taskA' || phase === 'practice-taskB') {
    if (loading || !currentGraphData || currentPracticeIndex >= practiceTrials.length) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">読み込み中...</div>
        </div>
      );
    }

    const currentPracticeTrial = practiceTrials[currentPracticeIndex];
    return (
      <TrialRunner
        trial={currentPracticeTrial}
        graphData={currentGraphData}
        onTrialComplete={(result) => handleTrialComplete(result, true)}
        isPractice={true}
        practiceIndex={currentPracticeIndex}
        totalPracticeTrials={practiceTrials.length}
      />
    );
  }

  if (phase === 'survey') {
    return <SurveyForm onSubmit={handleSurveySubmit} />;
  }

  if (phase === 'summary') {
    return participantData ? <SummaryScreen data={participantData} /> : null;
  }

  if (phase === 'trial') {
    if (loading || !currentGraphData || currentTrialIndex >= trials.length) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">読み込み中...</div>
        </div>
      );
    }

    const currentTrial = trials[currentTrialIndex];
    return (
      <TrialRunner
        trial={currentTrial}
        graphData={currentGraphData}
        onTrialComplete={handleTrialComplete}
        isPractice={false}
      />
    );
  }

  return null;
}
