import React, { useEffect, useState } from 'react';
import { TaskType, Condition } from '../types/experiment';
import { ja } from '../locales/ja';
import { GraphDisplay } from './GraphDisplay';
import { GraphData, parseCSV } from '../csv';

interface InstructionScreenProps {
  task: TaskType;
  onContinue: () => void;
}

const CONDITIONS: Condition[] = ['A', 'B', 'C', 'D'];
const CONDITION_LABELS: Record<Condition, string> = {
  A: '条件A',
  B: '条件B',
  C: '条件C',
  D: '条件D',
};

// 説明用のサンプルグラフ
const INSTRUCTION_GRAPH_FILE = '/graphs/graph_practice.csv';

export function InstructionScreen({ task, onContinue }: InstructionScreenProps) {
  const title = task === 'A' ? ja.taskATitle : ja.taskBTitle;
  const instruction = task === 'A' ? ja.instructionTaskA : ja.instructionTaskB;
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Load sample graph for demonstration
    const loadSampleGraph = async () => {
      try {
        const response = await fetch(INSTRUCTION_GRAPH_FILE);
        const csvText = await response.text();
        const data = parseCSV(csvText);
        setGraphData(data);
      } catch (error) {
        console.error('Failed to load sample graph:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSampleGraph();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">{title}</h1>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
          {/* Left side: Instructions */}
          <div className="flex-1 min-w-0">
            <div className="prose max-w-none mb-6">
              <div className="whitespace-pre-line text-gray-700 text-sm leading-relaxed space-y-2">
                {instruction.split('\n').map((line, index) => {
                  if (line.startsWith('【') && line.endsWith('】')) {
                    return (
                      <div key={index} className="font-bold text-base text-gray-900 mt-4 mb-2">
                        {line}
                      </div>
                    );
                  } else if (line.startsWith('・')) {
                    return (
                      <div key={index} className="ml-4 text-gray-700">
                        {line}
                      </div>
                    );
                  } else if (line.trim() === '') {
                    return <div key={index} className="h-2" />;
                  } else {
                    return (
                      <div key={index} className="text-gray-700">
                        {line}
                      </div>
                    );
                  }
                })}
              </div>
              <p className="mt-6 text-gray-600 font-medium">{ja.readyToStart}</p>
            </div>
          </div>
        </div>

        {/* 4つの表示方法を2x2で表示 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-900">
            表示方法の例
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500">読み込み中...</div>
            </div>
          ) : graphData ? (
            <div className="grid grid-cols-2 gap-6">
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
                  {/* Label below the graph - same style as SurveyForm */}
                  <div className="bg-black bg-opacity-70 text-white p-4 mt-2 rounded-b-lg">
                    <div className="text-center font-semibold mb-2">
                      {CONDITION_LABELS[condition]}
                    </div>
                    {condition === 'C' && (
                      <div className="text-xs text-gray-200 mt-2 text-center">
                        <div className="font-medium">自動で動きます。一時停止ボタンで制御できます</div>
                      </div>
                    )}
                    {condition === 'D' && (
                      <div className="text-xs text-gray-200 mt-2 space-y-1 text-left">
                        <div className="font-medium mb-1">この表示方法では以下のような操作ができます：</div>
                        <div>・マウス左ボタンドラッグ：グラフを回転</div>
                        <div>・マウスホイール：拡大・縮小</div>
                        <div>・マウス右ボタンドラッグ：平行移動</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500">グラフの読み込みに失敗しました</div>
            </div>
          )}
        </div>

        {/* Continue button */}
        <div className="flex justify-center">
          <button
            onClick={onContinue}
            className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-semibold"
          >
            {ja.next}
          </button>
        </div>
      </div>
    </div>
  );
}

