import React, { useState } from 'react';
import { ja } from '../locales/ja';

interface ParticipantIdInputProps {
  onStart: (participantId: string) => void;
}

export function ParticipantIdInput({ onStart }: ParticipantIdInputProps) {
  const [participantId, setParticipantId] = useState('');

  // 全角数字を半角数字に変換し、数値以外の文字を除去する
  const normalizeInput = (value: string): string => {
    // 全角数字を半角数字に変換
    const halfWidth = value.replace(/[０-９]/g, (char) => {
      return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
    });
    // 数値以外の文字を除去
    return halfWidth.replace(/[^0-9]/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeInput(e.target.value);
    setParticipantId(normalized);
  };

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
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]*"
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

