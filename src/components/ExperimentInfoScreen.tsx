import React, { useState, useEffect } from 'react';
import { ja } from '../locales/ja';

interface ExperimentInfoScreenProps {
  onContinue: () => void;
}

/**
 * Check if the document is in fullscreen mode
 */
function isFullscreen(): boolean {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
}

/**
 * Request fullscreen mode
 */
async function requestFullscreen(): Promise<void> {
  const element = document.documentElement;
  
  if (element.requestFullscreen) {
    await element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    await (element as any).webkitRequestFullscreen();
  } else if ((element as any).mozRequestFullScreen) {
    await (element as any).mozRequestFullScreen();
  } else if ((element as any).msRequestFullscreen) {
    await (element as any).msRequestFullscreen();
  }
}

export function ExperimentInfoScreen({ onContinue }: ExperimentInfoScreenProps) {
  const [isFullscreenMode, setIsFullscreenMode] = useState<boolean>(isFullscreen());

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreenMode(isFullscreen());
    };

    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Check initial state
    setIsFullscreenMode(isFullscreen());

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleRequestFullscreen = async () => {
    try {
      await requestFullscreen();
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      alert('フルスクリーンに移行できませんでした。ブラウザの設定を確認してください。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        <h1 className="text-2xl font-bold mb-6 text-center">グラフの3Dレイアウトと奥行き知覚補助による可読性の向上の実験について</h1>
        
        <div className="flex-1 bg-white rounded-lg shadow-md p-8 overflow-y-auto">
          <div className="space-y-8">
            {/* Experiment flow */}
            <div>
              <h2 className="font-bold text-xl mb-4 text-gray-900 border-b pb-2">
                {ja.consentExperimentFlow}
              </h2>
              <ol className="space-y-3 text-base text-gray-700">
                <li className="flex items-start">
                  <span className="font-semibold mr-3 min-w-[2rem]">1.</span>
                  <span>{ja.consentFlowStep1}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-3 min-w-[2rem]">2.</span>
                  <span>{ja.consentFlowStep2}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-3 min-w-[2rem]">3.</span>
                  <span>{ja.consentFlowStep3}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-3 min-w-[2rem]">4.</span>
                  <span>{ja.consentFlowStep4}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-3 min-w-[2rem]">5.</span>
                  <span>{ja.consentFlowStep5}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-3 min-w-[2rem]">6.</span>
                  <span>{ja.consentFlowStep6}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-3 min-w-[2rem]">7.</span>
                  <span>{ja.consentFlowStep7}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-3 min-w-[2rem]">8.</span>
                  <span>{ja.consentFlowStep8}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-3 min-w-[2rem]">9.</span>
                  <span>{ja.consentFlowStep9}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-3 min-w-[2rem]">10.</span>
                  <span>{ja.consentFlowStep10}</span>
                </li>
              </ol>
            </div>

            {/* Estimated time */}
            <div>
              <h2 className="font-bold text-xl mb-3 text-gray-900 border-b pb-2">
                {ja.consentEstimatedTime}
              </h2>
              <p className="text-lg font-semibold text-blue-600">{ja.consentTimeValue}</p>
            </div>

            {/* Important notes */}
            <div>
              <h2 className="font-bold text-xl mb-4 text-gray-900 border-b pb-2">
                {ja.consentImportantNotes}
              </h2>
              <ul className="space-y-3 text-base text-gray-700">
                <li className="flex items-start">
                  <span className="mr-3">・</span>
                  <span>{ja.consentNote1}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">・</span>
                  <span>{ja.consentNote2}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">・</span>
                  <span>{ja.consentNote3}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">・</span>
                  <span>{ja.consentNote4}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fullscreen recommendation message */}
        {!isFullscreenMode && (
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <p className="text-center text-blue-800 font-semibold mb-3">
              全画面表示を推奨します。フルスクリーンにしますか？
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleRequestFullscreen}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold"
              >
                フルスクリーンにする
              </button>
            </div>
          </div>
        )}

        {/* Continue button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onContinue}
            className="px-8 py-3 rounded-md bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold text-lg"
          >
            {ja.next}
          </button>
        </div>
      </div>
    </div>
  );
}

