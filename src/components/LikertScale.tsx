import React from 'react';
import { ja } from '../locales/ja';

interface LikertScaleProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}

export function LikertScale({ label, value, onChange }: LikertScaleProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{ja.notAtAll}</span>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`w-10 h-10 rounded-full border-2 ${
                value === num
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-blue-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {num}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">{ja.veryMuch}</span>
      </div>
    </div>
  );
}

