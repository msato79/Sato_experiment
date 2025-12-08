import React, { useState, useCallback } from 'react';
import { ParticipantIdInput } from './components/ParticipantIdInput';
import { ExperimentInfoScreen } from './components/ExperimentInfoScreen';
import { ConsentForm } from './components/ConsentForm';
import { InstructionScreen } from './components/InstructionScreen';
import { TrialRunner } from './components/TrialRunner';
import { SurveyForm } from './components/SurveyForm';
import { SummaryScreen } from './components/SummaryScreen';
import { ReadyForMainScreen } from './components/ReadyForMainScreen';
import { Trial, TrialResult, SurveyResponse, TaskType } from './types/experiment';
import { useExperimentPhase } from './hooks/useExperimentPhase';
import { useConditionsLoader } from './hooks/useConditionsLoader';
import { useTrialManagement } from './hooks/useTrialManagement';
import { useDataLogging } from './hooks/useDataLogging';
import { generatePracticeTrials } from './utils/practiceTrials';
import { experimentConfig } from './config/experiment.config';
import {
  findFirstTrialIndexForTask,
  areAllTrialsComplete,
  hasTaskChanged,
  getNextTask,
  areBothTasksComplete,
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
    
    // Task order is always fixed: A -> B
    const firstTask: TaskType = 'A';
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
      // Practice completed - show ready-for-main screen
      if (currentTask) {
        const readyPhase = currentTask === 'A' ? 'ready-for-main-taskA' : 'ready-for-main-taskB';
        transitionToPhase(readyPhase, currentTask);
      }
    }
  }, [currentPracticeIndex, practiceTrials, currentTask, setPracticeIndex, loadTrial, transitionToPhase]);

  const handleReadyForMainContinue = useCallback(() => {
    if (currentTask) {
      const firstTrialForTask = findFirstTrialIndexForTask(trials, currentTask);
      if (firstTrialForTask !== -1) {
        setTrialIndex(firstTrialForTask);
        loadTrial(trials[firstTrialForTask]);
        transitionToPhase('trial');
      }
    }
  }, [currentTask, trials, setTrialIndex, loadTrial, transitionToPhase]);

  const moveToNextTrial = useCallback(async () => {
    if (!participantData) return;
    
    const nextIndex = currentTrialIndex + 1;
    
    if (areAllTrialsComplete(currentTrialIndex, trials.length)) {
      // All trials for current task are complete
      // Show survey for current task
      if (currentTask) {
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
      // Task changed - show survey for completed task before moving to next task
      if (currentTask) {
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
  }, [participantData, currentTrialIndex, trials, currentTask, setTrialIndex, setCurrentTask, loadTrial, transitionToPhase, finalizeExperiment]);

  const handleTrialComplete = useCallback(async (result: TrialResult, isPractice: boolean = false) => {
    if (isPractice) {
      handlePracticeComplete();
      return;
    }

    await logTrialResult(result);

    // Don't show survey after each trial anymore
    // Survey will be shown after both tasks are complete
    await moveToNextTrial();
  }, [logTrialResult, handlePracticeComplete, moveToNextTrial]);

  const handleSurveySubmit = useCallback(async (response: SurveyResponse) => {
    console.log('[App] handleSurveySubmit called:', response);
    if (!participantData) {
      console.error('[App] No participant data available');
      return;
    }

    console.log('[App] Calling logSurveyResponse...');
    await logSurveyResponse(response);

    // Task order is fixed: A -> B
    // After task A survey, move to task B instruction
    // After task B survey, finalize experiment
    if (response.task === 'A') {
      // Task A completed - move to task B instruction
      const firstTrialForTaskB = findFirstTrialIndexForTask(trials, 'B');
      if (firstTrialForTaskB !== -1) {
        setCurrentTask('B');
        transitionToPhase(getInstructionPhase('B'), 'B');
      } else {
        // No task B trials - finalize experiment
        const completedData = await finalizeExperiment();
        if (completedData) {
          transitionToPhase('summary');
        }
      }
    } else if (response.task === 'B') {
      // Task B completed - finalize experiment
      const completedData = await finalizeExperiment();
      if (completedData) {
        transitionToPhase('summary');
      }
    }
  }, [participantData, trials, logSurveyResponse, finalizeExperiment, setCurrentTask, transitionToPhase]);

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

  if (phase === 'ready-for-main-taskA' || phase === 'ready-for-main-taskB') {
    return (
      <ReadyForMainScreen
        task={currentTask || 'A'}
        onContinue={handleReadyForMainContinue}
      />
    );
  }

  if (phase === 'survey') {
    // Get first trial for current task to use its graph and nodes for survey
    const surveyTrial = currentTask ? trials.find(t => t.task === currentTask) : null;
    if (surveyTrial) {
      return (
        <SurveyForm
          task={currentTask || 'A'}
          graphFile={surveyTrial.graph_file}
          node1={surveyTrial.node1}
          node2={surveyTrial.node2}
          onSubmit={handleSurveySubmit}
        />
      );
    }
    return <SurveyForm task={currentTask || 'A'} graphFile="/graphs/graph_practice.csv" node1={0} node2={4} onSubmit={handleSurveySubmit} />;
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
    // Calculate total trials for current task
    const trialsForCurrentTask = trials.filter(t => t.task === currentTask);
    const taskTrialIndex = trialsForCurrentTask.findIndex(t => t.trial_id === currentTrial.trial_id);
    
    return (
      <TrialRunner
        trial={currentTrial}
        graphData={currentGraphData}
        onTrialComplete={handleTrialComplete}
        isPractice={false}
        currentTrialIndex={taskTrialIndex}
        totalMainTrials={trialsForCurrentTask.length}
      />
    );
  }

  return null;
}
