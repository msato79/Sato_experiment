import React, { useState } from 'react';
import { ja } from '../locales/ja';

interface ParticipantIdInputProps {
  onStart: (participantId: string) => void;
}

export function ParticipantIdInput({ onStart }: ParticipantIdInputProps) {
  const [participantId, setParticipantId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  // 半角数字かどうかをチェック
  const isValidParticipantId = (value: string): boolean => {
    // 空文字列はチェックしない（required属性で処理）
    if (!value.trim()) {
      return true;
    }
    // 半角数字のみかチェック
    return /^[0-9]+$/.test(value.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setParticipantId(value);
    // 入力中にエラーをクリア
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = participantId.trim();
    
    if (!trimmedId) {
      setError(ja.participantIdRequired);
      return;
    }
    
    if (!isValidParticipantId(trimmedId)) {
      setError(ja.participantIdInvalidFormat);
      return;
    }
    
    // バリデーション成功
    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (participantId.trim()) {
      onStart(participantId.trim());
    }
  };

  const handleBack = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">{ja.participantIdConfirm}</h1>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm font-medium text-gray-700 mb-2">
                {ja.participantIdConfirmMessage}
              </div>
              <div className="text-2xl font-bold text-gray-900 text-center py-2">
                {participantId}
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {ja.participantIdBackButton}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {ja.participantIdConfirmButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">実験参加者登録</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="participantId" className="block text-sm font-medium text-gray-700 mb-2">
              {ja.participantIdLabel}
            </label>
            <p className="text-sm text-gray-600 mb-2">
              必ず実験分担者から直接伝えられた参加者idを入力してください
            </p>
            <input
              type="text"
              id="participantId"
              value={participantId}
              onChange={handleChange}
              placeholder={ja.participantIdPlaceholder}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
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

