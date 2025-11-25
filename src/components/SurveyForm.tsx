import React, { useState, useEffect } from 'react';
import { SurveyResponse, TaskType, Condition } from '../types/experiment';
import { ja } from '../locales/ja';
import { GraphDisplay } from './GraphDisplay';
import { GraphData, parseCSV } from '../csv';

interface SurveyFormProps {
  task: TaskType;
  graphFile: string;
  node1: number;
  node2: number;
  onSubmit: (response: SurveyResponse) => void;
}

const CONDITIONS: Condition[] = ['A', 'B', 'C', 'D'];
const CONDITION_LABELS: Record<Condition, string> = {
  A: '2D表示（平面表示）',
  B: '3D表示（固定視点）',
  C: '3D表示（小さい回転）',
  D: '3D表示（大きい回転）',
};

export function SurveyForm({ task, graphFile, node1, node2, onSubmit }: SurveyFormProps) {
  const [rankings, setRankings] = useState<Record<Condition, number | null>>({
    A: null,
    B: null,
    C: null,
    D: null,
  });
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load graph for survey (use actual trial graph)
    const loadSurveyGraph = async () => {
      try {
        const response = await fetch(`/${graphFile}`);
        const csvText = await response.text();
        const data = parseCSV(csvText);
        setGraphData(data);
      } catch (error) {
        console.error('Failed to load survey graph:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSurveyGraph();
  }, [graphFile]);

  const handleRankChange = (condition: Condition, rank: number | null) => {
    setRankings(prev => {
      const newRankings = { ...prev };
      
      // If selecting a rank, check if it's already used by another condition
      if (rank !== null) {
        // Find condition that currently has this rank
        const existingCondition = Object.keys(newRankings).find(
          c => c !== condition && newRankings[c as Condition] === rank
        ) as Condition | undefined;
        
        if (existingCondition) {
          // Clear the existing rank assignment
          newRankings[existingCondition] = null;
        }
      }
      
      newRankings[condition] = rank;
      return newRankings;
    });
  };

  const isFormValid = () => {
    const ranks = Object.values(rankings);
    // Check if all ranks are assigned (1-4)
    const assignedRanks = ranks.filter(r => r !== null);
    if (assignedRanks.length !== 4) return false;
    
    // Check if ranks 1-4 are all present
    const sortedRanks = [...assignedRanks].sort((a, b) => a! - b!);
    return sortedRanks[0] === 1 && sortedRanks[1] === 2 && sortedRanks[2] === 3 && sortedRanks[3] === 4;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit({
        task,
        rankings: rankings as Record<Condition, number>,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {task === 'A' ? 'タスクAについてのアンケート' : 'タスクBについてのアンケート'}
        </h2>
        <p className="text-center text-gray-700 mb-6">
          以下の4つの表示方法を比較して、わかりやすさの順位を付けてください（1位が一番わかりやすく、4位が一番わかりにくい）。
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : graphData ? (
          <>
            {/* 2x2 Grid of graph displays - larger square displays */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {CONDITIONS.map((condition) => (
                <div
                  key={condition}
                  className="relative border-2 border-gray-300 rounded-lg bg-gray-100"
                >
                  <div className="aspect-square w-full relative">
                    <GraphDisplay
                      graphData={graphData}
                      condition={condition}
                      axisOffset={0}
                      onNodeClick={() => {}}
                      skipNormalization={false}
                    />
                  </div>
                  {/* Label and rank selector - positioned below the graph */}
                  <div className="bg-black bg-opacity-70 text-white p-4 mt-2 rounded-b-lg">
                    <div className="text-center font-semibold mb-3">
                      {CONDITION_LABELS[condition]}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <label className="text-sm text-white font-medium">順位:</label>
                      <select
                        value={rankings[condition] || ''}
                        onChange={(e) => handleRankChange(condition, e.target.value ? parseInt(e.target.value) : null)}
                        className="bg-white text-gray-900 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold cursor-pointer relative z-50"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <option value="">選択してください</option>
                        <option value="1">1位（一番わかりやすい）</option>
                        <option value="2">2位</option>
                        <option value="3">3位</option>
                        <option value="4">4位（一番わかりにくい）</option>
                      </select>
                    </div>
                  </div>
                  {rankings[condition] !== null && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-lg z-50">
                      {rankings[condition]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit button */}
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
              {!isFormValid() && Object.values(rankings).some(r => r !== null) && (
                <p className="text-red-600 text-sm">
                  すべての表示方法に1位から4位までの順位を付けてください。
                </p>
              )}
              <button
                type="submit"
                disabled={!isFormValid()}
                className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {ja.submit}
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">グラフの読み込みに失敗しました</div>
          </div>
        )}
      </div>
    </div>
  );
}
