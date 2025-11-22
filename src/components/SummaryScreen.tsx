import React from 'react';
import { ParticipantData } from '../types/experiment';
import { ja } from '../locales/ja';

interface SummaryScreenProps {
  data: ParticipantData;
}

export function SummaryScreen({ data }: SummaryScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">{ja.experimentComplete}</h1>
        <p className="text-gray-700 mb-6 text-center">{ja.summaryMessage}</p>
      </div>
    </div>
  );
}

