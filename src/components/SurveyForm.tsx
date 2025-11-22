import React, { useState } from 'react';
import { SurveyResponse } from '../types/experiment';
import { ja } from '../locales/ja';
import { LikertScale } from './LikertScale';

interface SurveyFormProps {
  onSubmit: (response: SurveyResponse) => void;
}

export function SurveyForm({ onSubmit }: SurveyFormProps) {
  const [clarity, setClarity] = useState<number | null>(null);
  const [fatigue, setFatigue] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clarity !== null && fatigue !== null) {
      onSubmit({
        clarity,
        fatigue,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">{ja.surveyTitle}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <LikertScale
            label={ja.clarityQuestion}
            value={clarity}
            onChange={setClarity}
          />
          <LikertScale
            label={ja.fatigueQuestion}
            value={fatigue}
            onChange={setFatigue}
          />
          <button
            type="submit"
            disabled={clarity === null || fatigue === null}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {ja.submit}
          </button>
        </form>
      </div>
    </div>
  );
}

