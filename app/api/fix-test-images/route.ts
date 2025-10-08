import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting to fix test images...');

    // First, let's check what food logs exist and what images they reference
    const { data: foodLogs, error: fetchError } = await supabase
      .from('food_logs')
      .select('id, image_url, food_name')
      .not('image_url', 'is', null);

    if (fetchError) {
      console.error('Error fetching food logs:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch food logs' }, { status: 500 });
    }

    console.log(`Found ${foodLogs.length} food logs with image URLs`);

    // Check which images are missing
    const missingImages = [];
    const existingImages = [];

    for (const log of foodLogs) {
      if (log.image_url && log.image_url.includes('/demo-images/')) {
        const fileName = path.basename(log.image_url);
        const localPath = path.join(process.cwd(), 'public/demo-images', fileName);
        
        if (fs.existsSync(localPath)) {
          existingImages.push({ log, fileName, localPath });
        } else {
          missingImages.push({ log, fileName });
        }
      }
    }

    console.log(`Missing images: ${missingImages.length}`);
    missingImages.forEach(item => console.log(`  - ${item.fileName} (referenced by food log ${item.log.id})`));

    console.log(`Existing images to upload: ${existingImages.length}`);
    existingImages.forEach(item => console.log(`  - ${item.fileName}`));

    // Upload existing images to Supabase Storage
    console.log('Uploading images to Supabase Storage...');
    const uploadResults = [];

    for (const item of existingImages) {
      try {
        const fileBuffer = fs.readFileSync(item.localPath);
        
        const { data, error } = await supabase.storage
          .from('food-images')
          .upload(item.fileName, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true // Overwrite if exists
          });

        if (error) {
          console.error(`Error uploading ${item.fileName}:`, error);
          uploadResults.push({ fileName: item.fileName, success: false, error: error.message });
          continue;
        }

        console.log(`✓ Uploaded ${item.fileName}`);
        
        // Update the food log with the new Supabase Storage URL
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/food-images/${data.path}`;
        
        const { error: updateError } = await supabase
          .from('food_logs')
          .update({ image_url: publicUrl })
          .eq('id', item.log.id);

        if (updateError) {
          console.error(`Error updating food log ${item.log.id}:`, updateError);
          uploadResults.push({ fileName: item.fileName, success: false, error: updateError.message });
        } else {
          console.log(`✓ Updated food log ${item.log.id} with image URL: ${publicUrl}`);
          uploadResults.push({ fileName: item.fileName, success: true, url: publicUrl });
        }
      } catch (error) {
        console.error(`Error processing ${item.fileName}:`, error);
        uploadResults.push({ fileName: item.fileName, success: false, error: error.message });
      }
    }

    // For missing images, remove the image_url from the food log
    console.log('Handling missing images...');
    const missingResults = [];

    for (const item of missingImages) {
      console.log(`Removing image_url from food log ${item.log.id} (${item.log.food_name})`);
      
      const { error } = await supabase
        .from('food_logs')
        .update({ image_url: null })
        .eq('id', item.log.id);

      if (error) {
        console.error(`Error removing image_url from food log ${item.log.id}:`, error);
        missingResults.push({ logId: item.log.id, success: false, error: error.message });
      } else {
        missingResults.push({ logId: item.log.id, success: true });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test images fixed!',
      summary: {
        totalFoodLogs: foodLogs.length,
        existingImages: existingImages.length,
        missingImages: missingImages.length,
        uploadResults,
        missingResults
      }
    });

  } catch (error) {
    console.error('Error fixing test images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
