'use client';

import { useState, useRef } from 'react';
import { FoodItem } from '@/app/(dashboard)/food/page';

interface FoodUploadFormProps {
  onAnalysisComplete: (foods: FoodItem[], imageSrc: string) => void;
}

export default function FoodUploadForm({ onAnalysisComplete }: FoodUploadFormProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('請上傳圖片檔案');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('圖片檔案過大，請上傳小於 10MB 的圖片');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Prepare image (resize for efficiency)
  async function prepareImage(imgSrc: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 640;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imgSrc;
    });
  }

  // Analyze food image
  const analyzeFoodImage = async () => {
    if (!imageSrc) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Prepare image
      const processedImage = await prepareImage(imageSrc);

      // Call API route
      const response = await fetch('/api/food/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: processedImage.replace('data:image/png;base64,', ''),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '分析失敗');
      }

      const data = await response.json();
      onAnalysisComplete(data.foods, imageSrc);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err instanceof Error ? err.message : '分析失敗，請稍後再試');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setImageSrc(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Image Preview or Upload Button */}
      {!imageSrc ? (
        <div className="space-y-3">
          <button
            onClick={handleCameraClick}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span className="text-2xl">📷</span>
            <span>拍攝食物照片</span>
          </button>

          <button
            onClick={handleCameraClick}
            className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <span className="text-2xl">🖼️</span>
            <span>從相簿選擇</span>
          </button>
        </div>
      ) : (
        <div>
          {/* Image Preview */}
          <div className="relative mb-4">
            <img
              src={imageSrc}
              alt="Food preview"
              className="w-full h-auto rounded-lg shadow-md"
            />
            {!isAnalyzing && (
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeFoodImage}
            disabled={isAnalyzing}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>AI 分析中...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>開始辨識</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="text-red-600">⚠️</div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

