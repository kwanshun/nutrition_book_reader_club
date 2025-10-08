"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UploadImagesPage() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [foodLogs, setFoodLogs] = useState<any[]>([]);

  const supabase = createClient();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const fetchFoodLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('food_logs')
        .select('id, image_url, food_name')
        .not('image_url', 'is', null);

      if (error) {
        addResult(`Error fetching food logs: ${error.message}`);
        return;
      }

      setFoodLogs(data || []);
      addResult(`Found ${data?.length || 0} food logs with image URLs`);
    } catch (error) {
      addResult(`Error: ${error}`);
    }
  };

  const uploadImage = async (fileName: string) => {
    try {
      // Fetch the image from the public directory
      const response = await fetch(`/demo-images/${fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${fileName}`);
      }

      const blob = await response.blob();
      
      const { data, error } = await supabase.storage
        .from('food-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        throw error;
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/food-images/${data.path}`;
      addResult(`✓ Uploaded ${fileName} -> ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      addResult(`✗ Failed to upload ${fileName}: ${error}`);
      return null;
    }
  };

  const updateFoodLog = async (foodLogId: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('food_logs')
        .update({ image_url: imageUrl })
        .eq('id', foodLogId);

      if (error) {
        throw error;
      }

      addResult(`✓ Updated food log ${foodLogId} with new image URL`);
    } catch (error) {
      addResult(`✗ Failed to update food log ${foodLogId}: ${error}`);
    }
  };

  const fixTestImages = async () => {
    setUploading(true);
    setResults([]);
    
    try {
      addResult('Starting to fix test images...');
      
      // First fetch food logs
      await fetchFoodLogs();
      
      // Find food logs that reference demo-images
      const demoImageLogs = foodLogs.filter(log => 
        log.image_url && log.image_url.includes('/demo-images/')
      );
      
      addResult(`Found ${demoImageLogs.length} food logs referencing demo images`);
      
      for (const log of demoImageLogs) {
        const fileName = log.image_url.split('/').pop();
        if (fileName) {
          addResult(`Processing ${fileName} for food log ${log.id} (${log.food_name})`);
          
          // Upload to Supabase Storage
          const newUrl = await uploadImage(fileName);
          
          if (newUrl) {
            // Update the food log
            await updateFoodLog(log.id, newUrl);
          }
        }
      }
      
      addResult('✅ All test images fixed!');
      
    } catch (error) {
      addResult(`Error: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  const removeMissingImages = async () => {
    setUploading(true);
    setResults([]);
    
    try {
      addResult('Removing references to missing images...');
      
      await fetchFoodLogs();
      
      // Find food logs that reference demo-images but the file doesn't exist
      const missingImageLogs = foodLogs.filter(log => {
        if (!log.image_url || !log.image_url.includes('/demo-images/')) {
          return false;
        }
        
        const fileName = log.image_url.split('/').pop();
        // We'll assume it's missing if it's not snack-1.jpg
        return fileName !== 'snack-1.jpg';
      });
      
      addResult(`Found ${missingImageLogs.length} food logs with missing images`);
      
      for (const log of missingImageLogs) {
        const { error } = await supabase
          .from('food_logs')
          .update({ image_url: null })
          .eq('id', log.id);

        if (error) {
          addResult(`✗ Failed to remove image_url from food log ${log.id}: ${error.message}`);
        } else {
          addResult(`✓ Removed image_url from food log ${log.id} (${log.food_name})`);
        }
      }
      
      addResult('✅ Missing image references removed!');
      
    } catch (error) {
      addResult(`Error: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Fix Test Images</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={fetchFoodLogs}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Fetch Food Logs
            </button>
            
            <button
              onClick={fixTestImages}
              disabled={uploading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {uploading ? 'Fixing...' : 'Fix Test Images'}
            </button>
            
            <button
              onClick={removeMissingImages}
              disabled={uploading}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {uploading ? 'Removing...' : 'Remove Missing Images'}
            </button>
          </div>
        </div>

        {foodLogs.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Food Logs ({foodLogs.length})</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {foodLogs.map((log) => (
                <div key={log.id} className="border p-3 rounded">
                  <div className="font-medium">{log.food_name}</div>
                  <div className="text-sm text-gray-600">ID: {log.id}</div>
                  <div className="text-sm text-gray-600 break-all">URL: {log.image_url}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
