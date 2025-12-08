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
    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md inline-block">
      <div className="space-y-1">
        {task === 'A' ? (
          /* Task A: Show two answer buttons */
          <div className="flex space-x-1.5">
            <button
              onClick={() => onAnswerClick?.('2')}
              className="bg-gray-600 text-white px-4 py-1.5 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-semibold pointer-events-auto"
            >
              {ja.distance2}
            </button>
            <button
              onClick={() => onAnswerClick?.('3')}
              className="bg-gray-600 text-white px-4 py-1.5 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-semibold pointer-events-auto"
            >
              {ja.distance3}
            </button>
          </div>
        ) : (
          /* Task B: Show proceed button only */
          <div>
            <button
              onClick={onProceedClick}
              className="bg-gray-600 text-white px-4 py-1.5 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-semibold pointer-events-auto"
            >
              {ja.proceedNext}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
