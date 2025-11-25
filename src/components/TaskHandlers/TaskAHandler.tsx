import { useState, useCallback } from 'react';
import { Trial, TrialResult } from '../../types/experiment';
import { GraphData } from '../../csv';
import { getShortestPathDistance } from '../../lib/path-finder';

interface TaskAHandlerProps {
  trial: Trial;
  graphData: GraphData;
  startTime: number;
  isPractice: boolean;
  onComplete: (result: TrialResult) => void;
  onPracticeFeedback?: (correctAnswer: string, userAnswer: string, isCorrect: boolean) => void;
}

export function useTaskAHandler({
  trial,
  graphData,
  startTime,
  isPractice,
  onComplete,
  onPracticeFeedback,
}: TaskAHandlerProps) {
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const handleAnswerClick = useCallback((answer: '2' | '3') => {
    if (isComplete || trial.task !== 'A') return;

    const endTime = Date.now();
    const reactionTime = endTime - startTime;
    
    // Compute correct answer
    const correctDistance = getShortestPathDistance(graphData, trial.node1, trial.node2);
    const correct = (correctDistance === 2 && answer === '2') || (correctDistance >= 3 && answer === '3');
    
    setIsComplete(true);
    
    // Store answers for practice feedback
    if (isPractice && onPracticeFeedback) {
      const correctAnswer = correctDistance === 2 ? 'エッジ2本' : 'エッジ3本以上';
      const userAnswer = answer === '2' ? 'エッジ2本' : 'エッジ3本以上';
      onPracticeFeedback(correctAnswer, userAnswer, correct);
      return;
    }
    
    const result: TrialResult = {
      subject_id: '', // Will be set by parent
      task: trial.task,
      condition: trial.condition,
      axis_offset: trial.axis_offset,
      graph_file: trial.graph_file,
      trial_id: trial.trial_id,
      node_pair_id: trial.node_pair_id,
      highlighted_nodes: [trial.node1, trial.node2],
      answer: answer,
      correct,
      reaction_time_ms: reactionTime,
      click_count: 1, // Button click
      timestamp: new Date().toISOString(),
    };
    onComplete(result);
  }, [isComplete, trial, graphData, startTime, isPractice, onComplete, onPracticeFeedback]);

  return {
    isComplete,
    clickCount: 1, // Task A always has 1 click (button click)
    handleAnswerClick,
  };
}

