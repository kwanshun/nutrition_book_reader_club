import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { detected_foods, image_url, user_input } = await request.json();

    if (!detected_foods || !Array.isArray(detected_foods)) {
      return NextResponse.json({ error: 'Invalid food data' }, { status: 400 });
    }

    // Insert food log
    const { data: logData, error: logError } = await supabase
      .from('food_logs')
      .insert({
        user_id: user.id,
        group_id: null, // Allow null for now (same as text_shares)
        image_url: image_url || null,
        detected_foods: detected_foods,
        user_input: user_input || null,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error saving food log:', logError);
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    // Insert detected food items
    const foodItemsToInsert = detected_foods.map((food) => ({
      food_log_id: logData.id,
      user_id: user.id,
      name: food.name,
      description: food.description,
      portion: food.portion,
    }));

    const { error: itemsError } = await supabase
      .from('food_log_items')
      .insert(foodItemsToInsert);

    if (itemsError) {
      console.error('Error saving food log items:', itemsError);
      // Optional: Add logic here to delete the parent food_log entry for consistency
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: logData }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

