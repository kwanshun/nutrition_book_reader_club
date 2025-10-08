"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CheckStoragePage() {
  const [results, setResults] = useState<string[]>([]);
  const [buckets, setBuckets] = useState<any[]>([]);

  const supabase = createClient();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkStorage = async () => {
    try {
      addResult('Checking Supabase Storage...');
      
      // List all buckets
      const { data: bucketData, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        addResult(`Error listing buckets: ${bucketError.message}`);
        return;
      }

      setBuckets(bucketData || []);
      addResult(`Found ${bucketData?.length || 0} buckets`);
      
      bucketData?.forEach(bucket => {
        addResult(`Bucket: ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });

      // Check if food-images bucket exists
      const foodImagesBucket = bucketData?.find(b => b.name === 'food-images');
      if (foodImagesBucket) {
        addResult('✓ food-images bucket exists');
        
        // List files in food-images bucket
        const { data: files, error: filesError } = await supabase.storage
          .from('food-images')
          .list();
          
        if (filesError) {
          addResult(`Error listing files: ${filesError.message}`);
        } else {
          addResult(`Found ${files?.length || 0} files in food-images bucket`);
          files?.forEach(file => {
            addResult(`  - ${file.name} (${file.metadata?.size || 'unknown size'})`);
          });
        }
      } else {
        addResult('✗ food-images bucket does not exist');
        addResult('You need to create the food-images bucket in Supabase Dashboard');
      }

    } catch (error) {
      addResult(`Error: ${error}`);
    }
  };

  const createBucket = async () => {
    try {
      addResult('Creating food-images bucket...');
      
      const { data, error } = await supabase.storage.createBucket('food-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (error) {
        addResult(`Error creating bucket: ${error.message}`);
      } else {
        addResult('✓ food-images bucket created successfully');
      }
    } catch (error) {
      addResult(`Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Check Supabase Storage</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={checkStorage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Check Storage
            </button>
            
            <button
              onClick={createBucket}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Create food-images Bucket
            </button>
          </div>
        </div>

        {buckets.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Storage Buckets</h2>
            <div className="space-y-2">
              {buckets.map((bucket) => (
                <div key={bucket.id} className="border p-3 rounded">
                  <div className="font-medium">{bucket.name}</div>
                  <div className="text-sm text-gray-600">
                    Public: {bucket.public ? 'Yes' : 'No'} | 
                    Created: {new Date(bucket.created_at).toLocaleString()}
                  </div>
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
