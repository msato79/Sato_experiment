import React from 'react';
import { TaskType } from '../types/experiment';
import { ja } from '../locales/ja';

interface ReadyForMainScreenProps {
  task: TaskType;
  onContinue: () => void;
}

export function ReadyForMainScreen({ task, onContinue }: ReadyForMainScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-4">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">
            これから本番が始まります
          </h1>
          
          <div className="text-lg text-gray-600 space-y-4">
            <p>
              練習問題は終了しました。
            </p>
            <p>
              準備ができたら「本番へ進む」を押してください。
            </p>
            <p className="text-base text-gray-500 mt-6">
              本番の結果は記録されます。
            </p>
          </div>

          <button
            onClick={onContinue}
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-lg transition-colors"
          >
            本番へ進む
          </button>
        </div>
      </div>
    </div>
  );
}

