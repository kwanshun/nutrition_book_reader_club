const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadImageToStorage(filePath, fileName) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from('food-images')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true // Overwrite if exists
      });

    if (error) {
      console.error(`Error uploading ${fileName}:`, error);
      return null;
    }

    console.log(`✓ Uploaded ${fileName}`);
    return data.path;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

async function updateFoodLogImageUrl(foodLogId, imageUrl) {
  try {
    const { error } = await supabase
      .from('food_logs')
      .update({ image_url: imageUrl })
      .eq('id', foodLogId);

    if (error) {
      console.error(`Error updating food log ${foodLogId}:`, error);
      return false;
    }

    console.log(`✓ Updated food log ${foodLogId} with image URL: ${imageUrl}`);
    return true;
  } catch (error) {
    console.error(`Error updating food log ${foodLogId}:`, error);
    return false;
  }
}

async function fixTestImages() {
  console.log('Starting to fix test images...');

  // First, let's check what food logs exist and what images they reference
  const { data: foodLogs, error: fetchError } = await supabase
    .from('food_logs')
    .select('id, image_url, food_name')
    .not('image_url', 'is', null);

  if (fetchError) {
    console.error('Error fetching food logs:', fetchError);
    return;
  }

  console.log(`Found ${foodLogs.length} food logs with image URLs`);

  // Check which images are missing
  const missingImages = [];
  const existingImages = [];

  for (const log of foodLogs) {
    if (log.image_url && log.image_url.includes('/demo-images/')) {
      const fileName = path.basename(log.image_url);
      const localPath = path.join(__dirname, 'frontend/public/demo-images', fileName);
      
      if (fs.existsSync(localPath)) {
        existingImages.push({ log, fileName, localPath });
      } else {
        missingImages.push({ log, fileName });
      }
    }
  }

  console.log(`\nMissing images: ${missingImages.length}`);
  missingImages.forEach(item => console.log(`  - ${item.fileName} (referenced by food log ${item.log.id})`));

  console.log(`\nExisting images to upload: ${existingImages.length}`);
  existingImages.forEach(item => console.log(`  - ${item.fileName}`));

  // Upload existing images to Supabase Storage
  console.log('\nUploading images to Supabase Storage...');
  for (const item of existingImages) {
    const storagePath = await uploadImageToStorage(item.localPath, item.fileName);
    if (storagePath) {
      // Update the food log with the new Supabase Storage URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/food-images/${storagePath}`;
      await updateFoodLogImageUrl(item.log.id, publicUrl);
    }
  }

  // For missing images, we can either:
  // 1. Create placeholder images
  // 2. Remove the image_url from the food log
  // 3. Use a default image

  console.log('\nHandling missing images...');
  for (const item of missingImages) {
    console.log(`Removing image_url from food log ${item.log.id} (${item.log.food_name})`);
    await supabase
      .from('food_logs')
      .update({ image_url: null })
      .eq('id', item.log.id);
  }

  console.log('\n✅ Test images fixed!');
}

// Run the fix
fixTestImages().catch(console.error);
