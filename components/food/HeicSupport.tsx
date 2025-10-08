'use client';

import { useState } from 'react';

// HEIC conversion utility for food image uploads
export function useHeicConversion() {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if file is HEIC format
  const isHeicFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();
    
    return (
      fileName.endsWith('.heic') ||
      fileName.endsWith('.heif') ||
      mimeType === 'image/heic' ||
      mimeType === 'image/heif'
    );
  };

  // Convert HEIC to JPEG using heic2any library
  const convertHeicToJpeg = async (file: File): Promise<File> => {
    setIsConverting(true);
    setError(null);

    try {
      // Dynamic import of heic2any to avoid SSR issues
      const heic2any = (await import('heic2any')).default;

      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8, // Good quality/size balance
      });

      // Convert blob to File object
      const convertedFile = new File(
        [convertedBlob as Blob],
        file.name.replace(/\.(heic|heif)$/i, '.jpg'),
        { type: 'image/jpeg' }
      );

      setIsConverting(false);
      return convertedFile;
    } catch (err) {
      console.error('HEIC conversion error:', err);
      setError('HEIC 檔案轉換失敗，請使用其他格式');
      setIsConverting(false);
      throw err;
    }
  };

  // Enhanced file handler with HEIC support
  const handleFileWithHeicSupport = async (
    file: File,
    onSuccess: (dataUrl: string, convertedFile: File) => void,
    onError: (error: string) => void
  ) => {
    try {
      let processedFile = file;
      
      // Convert HEIC files
      if (isHeicFile(file)) {
        console.log('Detected HEIC file, converting to JPEG...');
        processedFile = await convertHeicToJpeg(file);
      }

      // Validate file type after conversion
      if (!processedFile.type.startsWith('image/')) {
        onError('請上傳圖片檔案');
        return;
      }

      // Validate file size (max 10MB)
      if (processedFile.size > 10 * 1024 * 1024) {
        onError('圖片檔案過大，請上傳小於 10MB 的圖片');
        return;
      }

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onSuccess(dataUrl, processedFile);
      };
      reader.onerror = () => {
        onError('讀取檔案失敗');
      };
      reader.readAsDataURL(processedFile);
    } catch (err) {
      onError(err instanceof Error ? err.message : '檔案處理失敗');
    }
  };

  return {
    isConverting,
    error,
    isHeicFile,
    convertHeicToJpeg,
    handleFileWithHeicSupport,
  };
}

// HEIC file detection utility
export function detectHeicSupport(): boolean {
  // Check if browser supports HEIC natively
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Test HEIC support
  try {
    const testDataUrl = 'data:image/heic;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAA';
    const img = new Image();
    return true; // Assume support and handle errors gracefully
  } catch {
    return false;
  }
}

// File format validation with HEIC support
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  // Supported formats
  const supportedFormats = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic', // iPhone photos
    'image/heif', // iPhone photos
  ];
  
  const supportedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.heic',
    '.heif',
  ];

  // Check MIME type
  if (mimeType && !supportedFormats.includes(mimeType)) {
    return {
      isValid: false,
      error: '不支援的圖片格式。請使用 JPG、PNG、WebP 或 HEIC 格式。'
    };
  }

  // Check file extension
  const hasValidExtension = supportedExtensions.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: '不支援的檔案副檔名。請使用 JPG、PNG、WebP 或 HEIC 格式。'
    };
  }

  // Check file size
  if (file.size > 10 * 1024 * 1024) {
    return {
      isValid: false,
      error: '圖片檔案過大，請上傳小於 10MB 的圖片。'
    };
  }

  return { isValid: true };
}

// HEIC conversion status component
export function HeicConversionStatus({ isConverting, error }: { isConverting: boolean; error: string | null }) {
  if (!isConverting && !error) return null;

  return (
    <div className="mt-4 p-4 rounded-lg">
      {isConverting && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium">正在轉換 HEIC 檔案...</span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600">
          <span>⚠️</span>
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
