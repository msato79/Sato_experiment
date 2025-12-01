import React, { useState, useRef } from 'react';
import { Trial, TrialResult } from '../types/experiment';
import { GraphData } from '../csv';
import { GraphDisplay, GraphDisplayRef } from './GraphDisplay';
import { TaskDisplay } from './TaskDisplay';
import { PracticeFeedback } from './PracticeFeedback';
import { useTaskAHandler } from './TaskHandlers/TaskAHandler';
import { useTaskBHandler } from './TaskHandlers/TaskBHandler';
import { ja } from '../locales/ja';

interface TrialRunnerProps {
  trial: Trial;
  graphData: GraphData;
  onTrialComplete: (result: TrialResult) => void;
  isPractice?: boolean;
  practiceIndex?: number; // Current practice trial index (0-based)
  totalPracticeTrials?: number; // Total number of practice trials
  currentTrialIndex?: number; // Current main trial index (0-based)
  totalMainTrials?: number; // Total number of main trials for current task
}

export function TrialRunner({ trial, graphData, onTrialComplete, isPractice = false, practiceIndex = 0, totalPracticeTrials = 0, currentTrialIndex = 0, totalMainTrials = 0 }: TrialRunnerProps) {
  const isLastPractice = isPractice && practiceIndex !== undefined && totalPracticeTrials !== undefined && practiceIndex === totalPracticeTrials - 1;
  const [startTime] = useState<number>(Date.now());
  const graphDisplayRef = useRef<GraphDisplayRef>(null);
  
  // Practice mode: store correct answer and user answer for feedback
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);

  const handlePracticeFeedback = (correct: string, user: string, correctFlag: boolean) => {
    setCorrectAnswer(correct);
    setUserAnswer(user);
    setIsCorrect(correctFlag);
  };

  const handlePracticeContinue = () => {
    const result: TrialResult = {
      subject_id: '',
      task: trial.task,
      condition: trial.condition,
      axis_offset: trial.axis_offset,
      graph_file: trial.graph_file,
      trial_id: trial.trial_id,
      node_pair_id: trial.node_pair_id,
      set_id: trial.set_id,
      node1: trial.node1,
      node2: trial.node2,
      highlighted_nodes: [trial.node1, trial.node2],
      answer: userAnswer,
      correct: isCorrect,
      reaction_time_ms: 0,
      click_count: clickCount,
      timestamp: new Date().toISOString(),
    };
    onTrialComplete(result);
  };

  // Use task-specific handlers
  const taskAHandler = useTaskAHandler({
    trial,
    graphData,
    startTime,
    isPractice,
    onComplete: onTrialComplete,
    onPracticeFeedback: isPractice ? handlePracticeFeedback : undefined,
  });

  const taskBHandler = useTaskBHandler({
    trial,
    graphData,
    startTime,
    isPractice,
    graphDisplayRef,
    onComplete: onTrialComplete,
    onPracticeFeedback: isPractice ? handlePracticeFeedback : undefined,
  });

  const isComplete = trial.task === 'A' ? taskAHandler.isComplete : taskBHandler.isComplete;
  const selectedNodes = trial.task === 'B' ? taskBHandler.selectedNodes : undefined;
  const currentClickCount = trial.task === 'A' ? taskAHandler.clickCount : taskBHandler.clickCount;
  
  // Track click count for practice mode
  React.useEffect(() => {
    if (isComplete && isPractice) {
      setClickCount(currentClickCount);
    }
  }, [isComplete, isPractice, currentClickCount]);

  // For Task A: no node clicks needed
  const handleNodeClickForTaskA = () => {
    // Do nothing for Task A
  };

  // Calculate progress
  const progressText = isPractice 
    ? `練習 ${practiceIndex + 1}/${totalPracticeTrials}`
    : `本番 ${currentTrialIndex + 1}/${totalMainTrials}`;
  const progressPercentage = isPractice
    ? ((practiceIndex + 1) / totalPracticeTrials) * 100
    : ((currentTrialIndex + 1) / totalMainTrials) * 100;

  return (
    <div className="relative h-screen bg-gray-50 flex flex-col">
      {/* Progress bar and TaskDisplay side by side at the top */}
      {/* pointer-events-noneでノードクリックを妨げないようにする */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 pointer-events-none">
        <div className="px-3 py-1.5">
          <div className="flex items-center gap-3">
            {/* TaskDisplay（ボタン）を左側に配置 */}
            <div className="pointer-events-none flex-shrink-0">
              <TaskDisplay
                task={trial.task}
                node1={trial.node1}
                node2={trial.node2}
                onAnswerClick={trial.task === 'A' && !isComplete ? taskAHandler.handleAnswerClick : undefined}
                onProceedClick={trial.task === 'B' && !isComplete ? taskBHandler.handleProceedClick : undefined}
                selectedNodes={selectedNodes}
              />
            </div>
            {/* 進捗バーを右側に配置 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold text-gray-700">{progressText}</span>
                <span className="text-xs text-gray-500">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GraphDisplay - takes remaining space, leaves room for side panel in practice mode */}
      {/* 進捗バーの高さに合わせてptを最小限に（約56px = py-1.5 + コンテンツ高さ） */}
      <div className={`absolute inset-0 ${isPractice ? 'right-80' : ''} pt-14`}>
        <GraphDisplay
          ref={graphDisplayRef}
          graphData={graphData}
          condition={trial.condition}
          axisOffset={trial.axis_offset}
          onNodeClick={trial.task === 'A' ? handleNodeClickForTaskA : taskBHandler.handleNodeClick}
          highlightedNodes={[trial.node1, trial.node2]}
          startNode={trial.node1}
          targetNode={trial.node2}
          scaleFactor={isPractice ? 0.85 : 1.0}
        />
      </div>
      
      {/* Practice mode: Side panel with instructions */}
      {isPractice && (
        <PracticeFeedback
          trial={trial}
          isComplete={isComplete}
          isCorrect={isCorrect}
          correctAnswer={correctAnswer}
          userAnswer={userAnswer}
          isLastPractice={isLastPractice}
          clickCount={clickCount}
          onContinue={handlePracticeContinue}
        />
      )}
      
      {/* Main trial completion message (not shown in practice mode) */}
      {isComplete && !isPractice && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-10">
          トライアル完了
        </div>
      )}
    </div>
  );
}
