import React, { useState, useRef, useCallback, useMemo } from 'react';
import { GraphData, parseCSV } from '../csv';
import { Condition, AxisOffset, TaskType } from '../types/experiment';
import { GraphDisplay, GraphDisplayRef } from './GraphDisplay';
import { TaskDisplay } from './TaskDisplay';
import { GraphInfoPanel } from './GraphInfoPanel';
import { useTaskAHandler } from './TaskHandlers/TaskAHandler';
import { useTaskBHandler } from './TaskHandlers/TaskBHandler';
import { getShortestPathDistance, findShortestPath } from '../lib/path-finder';

interface DevTrialRunnerProps {
  graphData: GraphData | null;
  condition: Condition;
  axisOffset: AxisOffset;
  task: TaskType;
  node1: number;
  node2: number;
  onGraphDataChange: (graphData: GraphData) => void;
}

export function DevTrialRunner({
  graphData,
  condition,
  axisOffset,
  task,
  node1,
  node2,
  onGraphDataChange,
}: DevTrialRunnerProps) {
  const [startTime] = useState<number>(Date.now());
  const graphDisplayRef = useRef<GraphDisplayRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      try {
        const parsedGraphData = parseCSV(csvText);
        onGraphDataChange(parsedGraphData);
      } catch (error) {
        console.error('Failed to parse CSV:', error);
        alert('CSVファイルの解析に失敗しました。');
      }
    };
    reader.readAsText(file);
  }, [onGraphDataChange]);

  // Create a mock trial for handlers
  const mockTrial = {
    trial_id: 'dev',
    task,
    condition,
    axis_offset: axisOffset,
    graph_file: 'dev.csv',
    node1,
    node2,
  };

  const handleTrialComplete = useCallback(() => {
    // In dev mode, just log to console
    console.log('Trial completed');
  }, []);

  const taskAHandler = useTaskAHandler({
    trial: mockTrial,
    graphData: graphData || { nodes: [], edges: [] },
    startTime,
    isPractice: false,
    onComplete: handleTrialComplete,
  });

  const taskBHandler = useTaskBHandler({
    trial: mockTrial,
    graphData: graphData || { nodes: [], edges: [] },
    startTime,
    isPractice: false,
    graphDisplayRef,
    onComplete: handleTrialComplete,
  });

  const isComplete = task === 'A' ? taskAHandler.isComplete : taskBHandler.isComplete;
  const selectedNodes = task === 'B' ? taskBHandler.selectedNodes : undefined;
  const currentClickCount = task === 'A' ? taskAHandler.clickCount : taskBHandler.clickCount;

  // Calculate answer for display
  const answerInfo = useMemo(() => {
    if (!graphData) return null;
    
    const distance = getShortestPathDistance(graphData, node1, node2);
    if (distance === -1) return null;
    
    const path = findShortestPath(graphData, node1, node2);
    
    if (task === 'A') {
      // Task A: show actual distance (number of edges)
      return {
        answer: `最短距離: ${distance}本`,
        distance,
        path,
      };
    } else {
      // Task B: show shortest path
      return {
        answer: `最短経路: ${path.join(' → ')}`,
        distance,
        path,
      };
    }
  }, [graphData, node1, node2, task]);

  const handleNodeClickForTaskA = () => {
    // Do nothing for Task A
  };

  if (!graphData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-xl mb-4">グラフデータを読み込んでください</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            CSVファイルを選択
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-50">
      {/* CSV Upload Button */}
      <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md"
        >
          📁 CSV読み込み
        </button>
        
        {/* Graph Info Panel */}
        <GraphInfoPanel
          graphData={graphData}
          highlightedNodes={[node1, node2]}
          startNode={node1}
          targetNode={node2}
        />
      </div>

      {/* GraphDisplay */}
      <div className="absolute inset-0">
        <GraphDisplay
          ref={graphDisplayRef}
          graphData={graphData}
          condition={condition}
          axisOffset={axisOffset}
          onNodeClick={task === 'A' ? handleNodeClickForTaskA : taskBHandler.handleNodeClick}
          highlightedNodes={[node1, node2]}
          startNode={node1}
          targetNode={node2}
        />
      </div>

      {/* TaskDisplay */}
      <div className="absolute top-4 left-4 z-10 right-4">
        <TaskDisplay
          task={task}
          node1={node1}
          node2={node2}
          onAnswerClick={task === 'A' && !isComplete ? taskAHandler.handleAnswerClick : undefined}
          onProceedClick={task === 'B' && !isComplete ? taskBHandler.handleProceedClick : undefined}
          selectedNodes={selectedNodes}
        />
      </div>

      {/* Answer Display (bottom right) */}
      {answerInfo && (
        <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg p-3">
          <div className="font-semibold text-gray-800 mb-1">正解:</div>
          <div className="text-lg font-bold text-blue-600">
            {answerInfo.answer}
          </div>
          {task === 'B' && answerInfo.path.length > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              距離: {answerInfo.distance}本
            </div>
          )}
        </div>
      )}
    </div>
  );
}

