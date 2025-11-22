import React, { useState } from 'react';
import { ja } from '../locales/ja';

interface ParticipantIdInputProps {
  onStart: (participantId: string) => void;
}

export function ParticipantIdInput({ onStart }: ParticipantIdInputProps) {
  const [participantId, setParticipantId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (participantId.trim()) {
      onStart(participantId.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">実験参加者登録</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="participantId" className="block text-sm font-medium text-gray-700 mb-2">
              {ja.participantIdLabel}
            </label>
            <input
              type="text"
              id="participantId"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              placeholder={ja.participantIdPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {ja.startExperiment}
          </button>
        </form>
      </div>
    </div>
  );
}

