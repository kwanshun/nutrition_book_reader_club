'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import FoodUploadForm from '@/components/food/FoodUploadForm';
import FoodResultDisplay from '@/components/food/FoodResultDisplay';

export interface FoodItem {
  name: string;
  portion: string;
  description: string;
}

export default function FoodPage() {
  const [analyzedFoods, setAnalyzedFoods] = useState<FoodItem[]>([]);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleAnalysisComplete = (foods: FoodItem[], image: string) => {
    setAnalyzedFoods(foods);
    setImageSrc(image);
  };

  const handleReset = () => {
    setAnalyzedFoods([]);
    setImageSrc(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader period={21} />
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📸 食物辨識 (正在更新)</h1>
          <p className="text-gray-600 text-sm mb-6">
            拍攝或上傳食物照片，AI 將自動識別食物並估算份量
          </p>

          {analyzedFoods.length === 0 ? (
            <FoodUploadForm onAnalysisComplete={handleAnalysisComplete} />
          ) : (
            <FoodResultDisplay
              foods={analyzedFoods}
              imageSrc={imageSrc}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Info Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-gray-600 text-xl">💡</div>
            <div className="flex-1">
              <h4 className="text-gray-900 font-medium mb-1">使用提示</h4>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                <li>拍照時確保光線充足</li>
                <li>盡量將食物置於畫面中央</li>
                <li>可以識別多種食物</li>
                <li>AI 估算的份量可以手動調整</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

