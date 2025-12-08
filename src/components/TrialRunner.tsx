import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Trial, TrialResult, Condition } from '../types/experiment';
import { GraphData } from '../csv';
import { GraphDisplay, GraphDisplayRef } from './GraphDisplay';
import { TaskDisplay } from './TaskDisplay';
import { PracticeFeedback } from './PracticeFeedback';
import { useTaskAHandler } from './TaskHandlers/TaskAHandler';
import { useTaskBHandler } from './TaskHandlers/TaskBHandler';
import { findCommonNeighbors } from '../lib/path-finder';
import { ja } from '../locales/ja';

const CONDITION_LABELS: Record<Condition, string> = {
  A: '条件A',
  B: '条件B',
  C: '条件C',
  D: '条件D',
};

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
  const [countdown, setCountdown] = useState<number>(3);
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());
  const graphDisplayRef = useRef<GraphDisplayRef>(null);
  
  // Practice mode: store correct answer and user answer for feedback
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);
  const [correctAnswerNodes, setCorrectAnswerNodes] = useState<number[]>([]);

  const handlePracticeFeedback = (correct: string, user: string, correctFlag: boolean, correctNodes?: number[]) => {
    setCorrectAnswer(correct);
    setUserAnswer(user);
    setIsCorrect(correctFlag);
    if (correctNodes) {
      setCorrectAnswerNodes(correctNodes);
    }
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
    startTime: startTimeRef.current,
    isPractice,
    onComplete: onTrialComplete,
    onPracticeFeedback: isPractice ? handlePracticeFeedback : undefined,
  });

  const taskBHandler = useTaskBHandler({
    trial,
    graphData,
    startTime: startTimeRef.current,
    isPractice,
    graphDisplayRef,
    onComplete: onTrialComplete,
    onPracticeFeedback: isPractice ? handlePracticeFeedback : undefined,
  });

  const isComplete = trial.task === 'A' ? taskAHandler.isComplete : taskBHandler.isComplete;
  const selectedNodes = trial.task === 'B' ? taskBHandler.selectedNodes : undefined;
  const currentClickCount = trial.task === 'A' ? taskAHandler.clickCount : taskBHandler.clickCount;
  
  // Calculate correct answer nodes for Task B practice (use state if available, otherwise calculate)
  const displayCorrectAnswerNodes = useMemo(() => {
    if (trial.task === 'B' && isPractice && isComplete) {
      // Use state if available (set by handlePracticeFeedback), otherwise calculate
      if (correctAnswerNodes.length > 0) {
        return correctAnswerNodes;
      }
      return findCommonNeighbors(graphData, trial.node1, trial.node2);
    }
    return [];
  }, [trial.task, trial.node1, trial.node2, graphData, isPractice, isComplete, correctAnswerNodes]);
  
  // Track click count for practice mode
  React.useEffect(() => {
    if (isComplete && isPractice) {
      setClickCount(currentClickCount);
    }
  }, [isComplete, isPractice, currentClickCount]);

  // Countdown effect
  useEffect(() => {
    setCountdown(3);
    setShowGraph(false);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startTimeRef.current = Date.now();
          setShowGraph(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [trial.trial_id]); // Reset countdown when trial changes

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

      {/* Countdown overlay */}
      {!showGraph && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80">
          <div className="text-white text-9xl font-bold mb-8">
            {countdown > 0 ? countdown : ''}
          </div>
          <div className="text-white text-2xl font-semibold mb-4">
            {CONDITION_LABELS[trial.condition]}
          </div>
          {trial.condition === 'A' && (
            <div className="text-white text-lg text-center px-8">
              2D平面表示です。視点は操作できません
            </div>
          )}
          {trial.condition === 'B' && (
            <div className="text-white text-lg text-center px-8">
              固定視点です。視点は操作できません
            </div>
          )}
          {trial.condition === 'C' && (
            <div className="text-white text-lg text-center px-8">
              自動で動きます。一時停止ボタンで制御できます
            </div>
          )}
          {trial.condition === 'D' && (
            <div className="text-white text-lg text-center px-8">
              自由視点です。マウスで視点を操作できます
            </div>
          )}
        </div>
      )}

      {/* GraphDisplay - takes remaining space, leaves room for side panel in practice mode */}
      {/* 進捗バーの高さに合わせてptを最小限に（約56px = py-1.5 + コンテンツ高さ） */}
      {showGraph && (
        <div className={`absolute inset-0 ${isPractice ? 'right-80' : ''} pt-14`}>
          <GraphDisplay
            ref={graphDisplayRef}
            graphData={graphData}
            condition={trial.condition}
            axisOffset={trial.axis_offset}
            onNodeClick={trial.task === 'A' ? handleNodeClickForTaskA : taskBHandler.handleNodeClick}
            highlightedNodes={[trial.node1, trial.node2]}
            correctAnswerNodes={trial.task === 'B' && isPractice && isComplete ? displayCorrectAnswerNodes : []}
            startNode={trial.node1}
            targetNode={trial.node2}
            scaleFactor={isPractice ? 0.85 : 1.0}
          />
        </div>
      )}
      
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
