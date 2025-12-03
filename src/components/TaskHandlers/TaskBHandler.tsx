import { useState, useCallback, useRef } from 'react';
import { Trial, TrialResult } from '../../types/experiment';
import { GraphData } from '../../csv';
import { GraphDisplayRef } from '../GraphDisplay';
import { findCommonNeighbors } from '../../lib/path-finder';

interface TaskBHandlerProps {
  trial: Trial;
  graphData: GraphData;
  startTime: number;
  isPractice: boolean;
  graphDisplayRef: React.RefObject<GraphDisplayRef>;
  onComplete: (result: TrialResult) => void;
  onPracticeFeedback?: (correctAnswer: string, userAnswer: string, isCorrect: boolean) => void;
}

export function useTaskBHandler({
  trial,
  graphData,
  startTime,
  isPractice,
  graphDisplayRef,
  onComplete,
  onPracticeFeedback,
}: TaskBHandlerProps) {
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [selectedNodes, setSelectedNodes] = useState<Set<number>>(new Set());
  const [clickCount, setClickCount] = useState<number>(0);

  const handleNodeClick = useCallback((nodeId: number) => {
    if (isComplete || trial.task !== 'B') return;

    // Toggle selection
    const newSelectedNodes = new Set(selectedNodes);
    if (newSelectedNodes.has(nodeId)) {
      newSelectedNodes.delete(nodeId);
    } else {
      // Don't allow selecting the highlighted nodes
      if (nodeId !== trial.node1 && nodeId !== trial.node2) {
        newSelectedNodes.add(nodeId);
      }
    }
    
    setSelectedNodes(newSelectedNodes);
    setClickCount(prev => prev + 1);
    
    // Update graph display to highlight selected nodes
    if (graphDisplayRef.current) {
      graphDisplayRef.current.setSelectedNodes(Array.from(newSelectedNodes));
    }
  }, [isComplete, trial, selectedNodes, graphDisplayRef]);

  const handleProceedClick = useCallback(() => {
    if (isComplete || trial.task !== 'B') return;

    const endTime = Date.now();
    const reactionTime = endTime - startTime;
    
    // Compute correct answer (common neighbors)
    const correctNodes = findCommonNeighbors(graphData, trial.node1, trial.node2);
    const selectedArray = Array.from(selectedNodes).sort((a, b) => a - b);
    const correctArray = correctNodes.sort((a, b) => a - b);
    
    // All-or-nothing correctness: must match exactly
    const correct = selectedArray.length === correctArray.length &&
      selectedArray.every((nodeId, index) => nodeId === correctArray[index]);
    
    setIsComplete(true);
    
    // Store answers for practice feedback
    if (isPractice && onPracticeFeedback) {
      // For Task B practice, show only the count
      const correctAnswer = `${correctArray.length}個`;
      const userAnswer = `${selectedArray.length}個`;
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
      set_id: trial.set_id,
      node1: trial.node1,
      node2: trial.node2,
      highlighted_nodes: [trial.node1, trial.node2],
      answer: selectedArray.join(','),
      correct,
      reaction_time_ms: reactionTime,
      click_count: clickCount,
      timestamp: new Date().toISOString(),
    };
    onComplete(result);
  }, [isComplete, trial, graphData, startTime, selectedNodes, clickCount, isPractice, onComplete, onPracticeFeedback]);

  return {
    isComplete,
    selectedNodes: Array.from(selectedNodes),
    clickCount,
    handleNodeClick,
    handleProceedClick,
  };
}

