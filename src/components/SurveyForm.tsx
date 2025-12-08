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
  A: '条件A',
  B: '条件B',
  C: '条件C',
  D: '条件D',
};

export function SurveyForm({ task, graphFile, node1, node2, onSubmit }: SurveyFormProps) {
  const [preferredCondition, setPreferredCondition] = useState<Condition | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preferredCondition !== null) {
      const response: SurveyResponse = {
        task,
        preferredCondition,
        timestamp: new Date().toISOString(),
      };
      console.log('[SurveyForm] Calling onSubmit with:', response);
      onSubmit(response);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {task === 'A' ? 'タスクAについてのアンケート' : 'タスクBについてのアンケート'}
        </h2>
        <p className="text-center text-gray-700 mb-6">
          以下の4つの表示方法を比較して、最もわかりやすい表示方法を1つ選択してください。
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
                      scaleFactor={0.85}
                    />
                  </div>
                  {/* Label and radio button - positioned below the graph */}
                  <div className="bg-black bg-opacity-70 text-white p-4 mt-2 rounded-b-lg">
                    <div className="text-center font-semibold mb-2">
                      {CONDITION_LABELS[condition]}
                    </div>
                    {condition === 'C' && (
                      <div className="text-xs text-gray-200 mb-3 text-center">
                        <div className="font-medium">自動で動きます。一時停止ボタンで制御できます</div>
                      </div>
                    )}
                    {condition === 'D' && (
                      <div className="text-xs text-gray-200 mb-3 space-y-1 text-left">
                        <div className="font-medium mb-1">この表示方法では以下のような操作ができます：</div>
                        <div>・マウス左ボタンドラッグ：グラフを回転</div>
                        <div>・マウスホイール：拡大・縮小</div>
                        <div>・マウス右ボタンドラッグ：平行移動</div>
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="preferredCondition"
                          value={condition}
                          checked={preferredCondition === condition}
                          onChange={() => setPreferredCondition(condition)}
                          className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          style={{ pointerEvents: 'auto' }}
                        />
                        <span className="text-sm text-white font-medium">最もわかりやすい</span>
                      </label>
                    </div>
                  </div>
                  {preferredCondition === condition && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-lg z-50">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit button */}
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
              {preferredCondition === null && (
                <p className="text-gray-600 text-sm">
                  最もわかりやすい表示方法を選択してください。
                </p>
              )}
              <button
                type="submit"
                disabled={preferredCondition === null}
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
