import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // If no profile exists, return email as fallback
    const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';

    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      display_name: displayName,
      profile_exists: !!profile
    });
  } catch (error) {
    console.error('Error in GET /api/user/profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { display_name } = await request.json();

    if (!display_name || !display_name.trim()) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    const trimmedName = display_name.trim();
    
    // Validate name length
    if (trimmedName.length > 50) {
      return NextResponse.json({ error: 'Display name must be 50 characters or less' }, { status: 400 });
    }

    // Upsert profile (insert or update)
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        display_name: trimmedName
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      display_name: data.display_name,
      updated_at: data.updated_at
    });
  } catch (error) {
    console.error('Error in PUT /api/user/profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
