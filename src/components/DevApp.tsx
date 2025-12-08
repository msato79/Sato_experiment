import React, { useState, useCallback } from 'react';
import { GraphData } from '../csv';
import { Condition, AxisOffset, TaskType } from '../types/experiment';
import { DevTrialRunner } from './DevTrialRunner';

export function DevApp() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [condition, setCondition] = useState<Condition>('A');
  const [axisOffset, setAxisOffset] = useState<AxisOffset>(0);
  const [task, setTask] = useState<TaskType>('A');
  const [node1, setNode1] = useState<number>(1);
  const [node2, setNode2] = useState<number>(2);
  const [wiggleFrequencyMs, setWiggleFrequencyMs] = useState<number>(100);

  const handleGraphDataChange = useCallback((data: GraphData) => {
    setGraphData(data);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Control Panel */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold mb-4">開発者モード - グラフ選択ツール</h1>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {/* Task Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タスク
              </label>
              <select
                value={task}
                onChange={(e) => setTask(e.target.value as TaskType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">タスクA</option>
                <option value="B">タスクB</option>
              </select>
            </div>

            {/* Condition Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                表示条件
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">条件A</option>
                <option value="B">条件B</option>
                <option value="C">条件C</option>
                <option value="D">条件D</option>
              </select>
            </div>

            {/* Axis Offset */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                軸オフセット
              </label>
              <select
                value={axisOffset}
                onChange={(e) => setAxisOffset(parseInt(e.target.value) as AxisOffset)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>なし</option>
                <option value={1}>あり</option>
              </select>
            </div>

            {/* Node 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ノード1
              </label>
              <input
                type="number"
                value={node1}
                onChange={(e) => setNode1(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            {/* Node 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ノード2
              </label>
              <input
                type="number"
                value={node2}
                onChange={(e) => setNode2(parseInt(e.target.value) || 2)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            {/* Wiggle Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                切り替え間隔 (ms)
              </label>
              <input
                type="number"
                value={wiggleFrequencyMs}
                onChange={(e) => setWiggleFrequencyMs(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="16"
                max="1000"
                step="10"
              />
              <div className="text-xs text-gray-500 mt-1">
                {wiggleFrequencyMs > 0 ? `${(1000 / wiggleFrequencyMs).toFixed(1)}Hz` : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Runner */}
      <div className="flex-1 overflow-hidden">
        <DevTrialRunner
          graphData={graphData}
          condition={condition}
          axisOffset={axisOffset}
          task={task}
          node1={node1}
          node2={node2}
          wiggleFrequencyMs={wiggleFrequencyMs}
          onGraphDataChange={handleGraphDataChange}
        />
      </div>
    </div>
  );
}

