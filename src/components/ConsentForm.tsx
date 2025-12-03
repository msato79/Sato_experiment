import React from 'react';
import { ja } from '../locales/ja';

interface ConsentFormProps {
  onAgree: () => void;
  onDisagree: () => void;
}

export function ConsentForm({ onAgree, onDisagree }: ConsentFormProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        <h1 className="text-2xl font-bold mb-4 text-center">{ja.consentTitle}</h1>
        
        {/* Consent form content */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 flex flex-col">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-gray-700">{ja.consentIntroduction}</p>
            </div>

            {/* Scrollable consent content */}
            <div className="flex-1 overflow-y-auto mb-6 border border-gray-200 rounded-md p-6 bg-gray-50">
              <div className="space-y-6 text-sm leading-relaxed">
                {/* Section 1: 概要 */}
                <div>
                  <h2 className="font-bold text-base mb-3 text-gray-900">{ja.consentSection1Title}</h2>
                  <p className="text-gray-700 whitespace-pre-line">{ja.consentSection1Content}</p>
                </div>

                {/* Section 2: 実験への参加について */}
                <div>
                  <h2 className="font-bold text-base mb-3 text-gray-900">{ja.consentSection2Title}</h2>
                  <p className="text-gray-700 whitespace-pre-line">{ja.consentSection2Content}</p>
                </div>

                {/* Section 3: 安全性、個人情報保護、データ管理について */}
                <div>
                  <h2 className="font-bold text-base mb-3 text-gray-900">{ja.consentSection3Title}</h2>
                  <p className="text-gray-700 whitespace-pre-line">{ja.consentSection3Content}</p>
                </div>

                {/* Section 4: 連絡先等 */}
                <div>
                  <h2 className="font-bold text-base mb-3 text-gray-900">{ja.consentSection4Title}</h2>
                  <p className="text-gray-700 whitespace-pre-line">{ja.consentSection4Content}</p>
                </div>
              </div>
            </div>

            {/* Disagree message */}
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">{ja.consentDisagreeMessage}</p>
            </div>

            {/* Agree button */}
            <div className="flex justify-center">
              <button
                onClick={onAgree}
                className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold text-lg"
              >
                {ja.consentAgree}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
