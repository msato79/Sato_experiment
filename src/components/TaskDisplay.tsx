import React from 'react';
import { TaskType } from '../types/experiment';
import { ja } from '../locales/ja';

interface TaskDisplayProps {
  task: TaskType;
  node1: number;
  node2: number;
  onAnswerClick?: (answer: '2' | '3') => void; // For Task A
  onProceedClick?: () => void; // For Task B
  selectedNodes?: number[]; // For Task B
}

export function TaskDisplay({ 
  task, 
  node1, 
  node2, 
  onAnswerClick,
  onProceedClick,
  selectedNodes = []
}: TaskDisplayProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md mb-4 inline-block">
      <div className="space-y-1.5">
        {task === 'A' ? (
          /* Task A: Show two answer buttons */
          <div className="flex space-x-2">
            <button
              onClick={() => onAnswerClick?.('2')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold pointer-events-auto"
            >
              {ja.distance2}
            </button>
            <button
              onClick={() => onAnswerClick?.('3')}
              className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-semibold pointer-events-auto"
            >
              {ja.distance3}
            </button>
          </div>
        ) : (
          /* Task B: Show selected nodes count and proceed button */
          <div className="mt-2 space-y-2">
            {selectedNodes.length > 0 && (
              <div className="text-sm text-gray-700">
                選択されたノード: {selectedNodes.sort((a, b) => a - b).join(', ')}
              </div>
            )}
            <button
              onClick={onProceedClick}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-semibold pointer-events-auto"
            >
              {ja.proceedNext}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
