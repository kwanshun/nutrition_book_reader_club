'use client';

import { useState } from 'react';
import { FoodItem } from '@/app/(dashboard)/food/page';
import { useHeicConversion, HeicConversionStatus, validateImageFile } from './HeicSupport';

interface FoodUploadFormProps {
  onAnalysisComplete: (foods: FoodItem[], imageSrc: string) => void;
}

export default function FoodUploadForm({ onAnalysisComplete }: FoodUploadFormProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // HEIC conversion support
  const { 
    isConverting, 
    error: heicError, 
    handleFileWithHeicSupport 
  } = useHeicConversion();

  // Handle image upload with HEIC support
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input triggered');
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    
    if (file) {
      // Validate file first
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || '檔案驗證失敗');
        return;
      }

      console.log('Processing file with HEIC support...');
      
      // Use HEIC-aware file handler
      handleFileWithHeicSupport(
        file,
        (dataUrl: string, convertedFile: File) => {
          console.log('File processed successfully:', convertedFile);
          setImageSrc(dataUrl);
          setError(null);
        },
        (errorMessage: string) => {
          console.error('File processing error:', errorMessage);
          setError(errorMessage);
        }
      );
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

  const handleRemoveImage = () => {
    setImageSrc(null);
    setError(null);
  };

  return (
    <div>
      {/* Image Preview or Upload Button */}
      {!imageSrc ? (
        <div className="space-y-3">
          {/* Visible file input - works on all platforms including iPad */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
            <div className="mb-4">
              <span className="text-4xl">📷</span>
              <p className="text-gray-700 font-medium mt-2">選擇或拍攝食物照片</p>
              <p className="text-gray-500 text-sm mt-1">支援 JPG、PNG、HEIC 等圖片格式</p>
            </div>
            <input
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-3 file:px-6
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                cursor-pointer"
            />
          </div>
        </div>
      ) : (
        <div>
          {/* Image Preview */}
          <div className="relative mb-6">
            <img
              src={imageSrc}
              alt="Food preview"
              className="w-full h-64 object-cover rounded-lg shadow-md"
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

      {/* HEIC Conversion Status */}
      <HeicConversionStatus isConverting={isConverting} error={heicError} />

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
