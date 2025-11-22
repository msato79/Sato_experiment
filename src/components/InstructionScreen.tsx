import React from 'react';
import { TaskType } from '../types/experiment';
import { ja } from '../locales/ja';

interface InstructionScreenProps {
  task: TaskType;
  onContinue: () => void;
}

export function InstructionScreen({ task, onContinue }: InstructionScreenProps) {
  const title = task === 'A' ? ja.taskATitle : ja.taskBTitle;
  const instruction = task === 'A' ? ja.instructionTaskA : ja.instructionTaskB;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center">{title}</h1>
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
        <div className="flex justify-center">
          <button
            onClick={onContinue}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {ja.next}
          </button>
        </div>
      </div>
    </div>
  );
}

