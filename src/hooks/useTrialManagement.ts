import { useState, useCallback } from 'react';
import { Trial } from '../types/experiment';
import { GraphData, parseCSV } from '../csv';

/**
 * Hook for managing trial loading and navigation
 */
export function useTrialManagement() {
  const [currentGraphData, setCurrentGraphData] = useState<GraphData | null>(null);
  const [currentTrialIndex, setCurrentTrialIndex] = useState<number>(0);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const loadTrial = useCallback(async (trial: Trial) => {
    setLoading(true);
    try {
      const response = await fetch(`/${trial.graph_file}`);
      const csvText = await response.text();
      const graphData = parseCSV(csvText);
      setCurrentGraphData(graphData);
    } catch (error) {
      console.error('Failed to load graph:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const setTrialIndex = useCallback((index: number) => {
    setCurrentTrialIndex(index);
  }, []);

  const setPracticeIndex = useCallback((index: number) => {
    setCurrentPracticeIndex(index);
  }, []);

  const resetIndices = useCallback(() => {
    setCurrentTrialIndex(0);
    setCurrentPracticeIndex(0);
  }, []);

  return {
    currentGraphData,
    currentTrialIndex,
    currentPracticeIndex,
    loading,
    loadTrial,
    setTrialIndex,
    setPracticeIndex,
    resetIndices,
  };
}

