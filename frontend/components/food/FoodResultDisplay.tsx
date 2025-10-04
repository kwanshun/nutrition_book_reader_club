'use client';

import { useState } from 'react';
import { FoodItem } from '@/app/(dashboard)/food/page';

interface FoodResultDisplayProps {
  foods: FoodItem[];
  imageSrc: string | null;
  onReset: () => void;
}

export default function FoodResultDisplay({
  foods,
  imageSrc,
  onReset,
}: FoodResultDisplayProps) {
  const [editedFoods, setEditedFoods] = useState<FoodItem[]>(foods);
  const [isSaving, setIsSaving] = useState(false);

  const handlePortionChange = (index: number, newPortion: string) => {
    const updated = [...editedFoods];
    updated[index] = { ...updated[index], portion: newPortion };
    setEditedFoods(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Save to database (food_logs table)
    // For MVP, we'll just show success message
    setTimeout(() => {
      setIsSaving(false);
      alert('食物記錄已儲存！');
      onReset();
    }, 1000);
  };

  return (
    <div>
      {/* Image Thumbnail */}
      {imageSrc && (
        <div className="mb-4">
          <img
            src={imageSrc}
            alt="Analyzed food"
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Results Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <span>✨</span>
          <span>識別結果</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          找到 {editedFoods.length} 種食物，你可以調整份量
        </p>
      </div>

      {/* Food Items List */}
      <div className="space-y-4 mb-6">
        {editedFoods.map((food, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            {/* Food Name */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{food.name}</h3>
                <p className="text-sm text-gray-600">{food.description}</p>
              </div>
              <div className="text-2xl ml-2">🍽️</div>
            </div>

            {/* Portion Input */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                份量 (可修改)
              </label>
              <input
                type="text"
                value={food.portion}
                onChange={(e) => handlePortionChange(index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：150g, 1碗, 2片"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>儲存中...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>儲存記錄</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          disabled={isSaving}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          重新拍攝
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          💡 提示：確認份量無誤後再儲存，之後可在記錄頁面查看
        </p>
      </div>
    </div>
  );
}

