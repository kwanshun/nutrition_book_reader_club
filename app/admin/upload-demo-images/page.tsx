"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UploadDemoImagesPage() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const supabase = createClient();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const uploadDemoImages = async () => {
    setUploading(true);
    setResults([]);
    
    try {
      addResult('Starting to upload demo images to Supabase Storage...');
      
      // List of demo images to upload
      const demoImages = [
        'snack-1.jpg',
        'snack-2.jpg', 
        'snack-3.jpg',
        'breakfast-1.jpg',
        'breakfast-2.jpg',
        'breakfast-3.jpg',
        'breakfast-4.jpg',
        'lunch-1.jpg',
        'lunch-2.jpg',
        'lunch-3.jpg',
        'lunch-4.jpg',
        'dinner-1.jpg',
        'dinner-2.jpg',
        'dinner-3.jpg',
        'dinner-4.jpg',
        'dessert-1.jpg',
        'dessert-2.jpg'
      ];

      const uploadedUrls: { [key: string]: string } = {};

      for (const fileName of demoImages) {
        try {
          addResult(`Uploading ${fileName}...`);
          
          // Fetch the image from the public directory
          const response = await fetch(`/demo-images/${fileName}`);
          if (!response.ok) {
            addResult(`✗ Failed to fetch ${fileName}: ${response.status} ${response.statusText}`);
            continue;
          }

          const blob = await response.blob();
          
          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('food-images')
            .upload(fileName, blob, {
              contentType: 'image/jpeg',
              upsert: true // Overwrite if exists
            });

          if (error) {
            addResult(`✗ Failed to upload ${fileName}: ${error.message}`);
            continue;
          }

          // Get the public URL
          const { data: publicUrlData } = supabase.storage
            .from('food-images')
            .getPublicUrl(fileName);

          const publicUrl = publicUrlData.publicUrl;
          uploadedUrls[fileName] = publicUrl;
          
          addResult(`✓ Uploaded ${fileName} -> ${publicUrl}`);
          
        } catch (error) {
          addResult(`✗ Error uploading ${fileName}: ${error}`);
        }
      }

      addResult(`\nUploaded ${Object.keys(uploadedUrls).length} images successfully`);
      addResult('Now updating database references...');

      // Update food logs that reference demo images
      const { data: foodLogs, error: fetchError } = await supabase
        .from('food_logs')
        .select('id, image_url, food_name')
        .not('image_url', 'is', null);

      if (fetchError) {
        addResult(`Error fetching food logs: ${fetchError.message}`);
        return;
      }

      let updatedCount = 0;
      for (const log of foodLogs) {
        if (log.image_url && log.image_url.includes('/demo-images/')) {
          const fileName = log.image_url.split('/').pop();
          if (fileName && uploadedUrls[fileName]) {
            try {
              const { error: updateError } = await supabase
                .from('food_logs')
                .update({ image_url: uploadedUrls[fileName] })
                .eq('id', log.id);

              if (updateError) {
                addResult(`✗ Failed to update food log ${log.id}: ${updateError.message}`);
              } else {
                addResult(`✓ Updated food log ${log.id} (${log.food_name}) with new URL`);
                updatedCount++;
              }
            } catch (error) {
              addResult(`✗ Error updating food log ${log.id}: ${error}`);
            }
          }
        }
      }

      addResult(`\n✅ Successfully updated ${updatedCount} food log records`);
      addResult('Demo images are now properly stored in Supabase Storage!');

    } catch (error) {
      addResult(`Error: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Demo Images to Supabase Storage</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Demo Images</h2>
          <p className="text-gray-600 mb-4">
            This will upload all demo images from /public/demo-images/ to Supabase Storage 
            and update the database references to use the new URLs.
          </p>
          <button
            onClick={uploadDemoImages}
            disabled={uploading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Demo Images'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Results</h2>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className={`text-sm font-mono p-2 rounded ${
                  result.includes('✓') ? 'bg-green-100 text-green-800' :
                  result.includes('✗') ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
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
