import React from 'react';
import { Trial, TrialResult } from '../types/experiment';
import { ja } from '../locales/ja';

interface PracticeFeedbackProps {
  trial: Trial;
  isComplete: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  isLastPractice: boolean;
  clickCount: number;
  onContinue: () => void;
}

export function PracticeFeedback({
  trial,
  isComplete,
  isCorrect,
  correctAnswer,
  userAnswer,
  isLastPractice,
  clickCount,
  onContinue,
}: PracticeFeedbackProps) {
  const handleContinue = () => {
    const result: TrialResult = {
      subject_id: '',
      task: trial.task,
      condition: trial.condition,
      axis_offset: trial.axis_offset,
      graph_file: trial.graph_file,
      trial_id: trial.trial_id,
      highlighted_nodes: [trial.node1, trial.node2],
      answer: userAnswer,
      correct: isCorrect,
      reaction_time_ms: 0,
      click_count: clickCount,
      timestamp: new Date().toISOString(),
    };
    onContinue();
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-sm shadow-lg z-20 overflow-y-auto pointer-events-auto">
      <div className="p-4 space-y-4">
        <div className="font-bold text-lg text-blue-700 border-b pb-2">
          {ja.practiceTitle}
        </div>
        
        {/* Task instructions */}
        <div className="space-y-4">
          {trial.task === 'A' ? (
            <div className="p-3 rounded border-2 border-blue-500 bg-blue-50">
              <div className="font-bold text-sm mb-2 text-blue-700">{ja.taskATitle}</div>
              <div className="text-xs text-gray-700 whitespace-pre-line">{ja.taskAInstruction}</div>
            </div>
          ) : (
            <div className="p-3 rounded border-2 border-purple-500 bg-purple-50">
              <div className="font-bold text-sm mb-2 text-purple-700">{ja.taskBTitle}</div>
              <div className="text-xs text-gray-700 whitespace-pre-line">{ja.taskBInstruction}</div>
            </div>
          )}
          
          {/* Feedback after completion */}
          {isComplete && (
            <>
              <div className={`p-3 rounded border-2 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <div className={`font-bold text-base ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? ja.correct : ja.incorrect}
                </div>
                {!isCorrect && trial.task === 'A' && (
                  <div className="mt-2 text-sm text-gray-700">
                    <div>{ja.correctAnswer}: {correctAnswer}</div>
                  </div>
                )}
                {!isCorrect && trial.task === 'B' && (
                  <div className="mt-2 text-sm text-gray-700">
                    <div>{ja.correctAnswer}: <span className="text-blue-600 font-semibold">{correctAnswer}</span></div>
                  </div>
                )}
              </div>
              
              {/* Continue button */}
              <button
                onClick={handleContinue}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold pointer-events-auto"
              >
                {isLastPractice ? ja.proceedToMain : ja.practiceContinue}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

