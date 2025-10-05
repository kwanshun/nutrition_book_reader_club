import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, group_id, day_number } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    
    if (!day_number || day_number < 1 || day_number > 21) {
      return NextResponse.json(
        { error: 'Invalid day number' },
        { status: 400 }
      );
    }

    // Check if user has already shared for this day
    const { data: existingShare } = await supabase
      .from('text_shares')
      .select('id, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('day_number', day_number)
      .limit(1);

    let data, error;
    let isUpdate = false;

    if (existingShare && existingShare.length > 0) {
      // Update existing share
      const { data: updateData, error: updateError } = await supabase
        .from('text_shares')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingShare[0].id)
        .select('*')
        .single();
      
      data = updateData;
      error = updateError;
      isUpdate = true;
    } else {
      // Create new share
      const { data: createData, error: createError } = await supabase
        .from('text_shares')
        .insert({
          user_id: user.id,
          group_id: group_id || null, // Allow NULL for testing without groups
          content: content.trim(),
          day_number: day_number
        })
        .select('*')
        .single();
      
      data = createData;
      error = createError;
      isUpdate = false;
    }

    if (error) {
      console.error(`Error ${isUpdate ? 'updating' : 'creating'} share:`, error);
      return NextResponse.json(
        { error: `Failed to ${isUpdate ? 'update' : 'create'} share` },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: isUpdate ? 200 : 201 });
  } catch (error) {
    console.error('Error in POST /api/shares:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    const dayNumber = searchParams.get('day_number');
    const allUsers = searchParams.get('all_users') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('text_shares')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by user only if not fetching all users' shares
    if (!allUsers) {
      query = query.eq('user_id', user.id);
    }

    // Filter by group if provided
    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    // Filter by day number if provided
    if (dayNumber) {
      query = query.eq('day_number', parseInt(dayNumber));
    }

    const { data: shares, error } = await query;

    if (error) {
      console.error('Error fetching shares:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shares' },
        { status: 500 }
      );
    }

    // Fetch display names for all users in the shares
    const userIds = [...new Set(shares?.map(share => share.user_id) || [])];
    let displayNames: { [userId: string]: string } = {};

    if (userIds.length > 0) {
      // Get profiles from user_profiles table
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      if (profiles) {
        displayNames = profiles.reduce((acc, profile) => {
          acc[profile.user_id] = profile.display_name;
          return acc;
        }, {} as { [userId: string]: string });
      }
    }

    // Add display names to shares with fallback logic
    const sharesWithDisplayNames = shares?.map(share => {
      let displayName = displayNames[share.user_id];
      
      if (!displayName) {
        // Fallback to user ID suffix
        displayName = `用戶${share.user_id.slice(-4)}`;
      }

      return {
        ...share,
        display_name: displayName
      };
    }) || [];

    return NextResponse.json(sharesWithDisplayNames);
  } catch (error) {
    console.error('Error in GET /api/shares:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
