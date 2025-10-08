import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Parse request body
    const { invite_code, user_id } = await request.json();

    if (!invite_code || !invite_code.trim()) {
      return NextResponse.json(
        { error: '邀請碼不能為空' },
        { status: 400 }
      );
    }

    // Create an admin client that bypasses RLS for group lookup
    // This is safe because we're only reading public group data (invite codes)
    const adminClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key bypasses RLS
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Find the group by invite code using admin client
    const { data: group, error: groupError } = await adminClient
      .from('groups')
      .select('id, name')
      .eq('invite_code', invite_code.trim())
      .single();

    if (groupError || !group) {
      console.error('Group lookup error:', groupError);
      return NextResponse.json(
        { error: '邀請碼無效' },
        { status: 404 }
      );
    }

    // Use provided user_id (from registration) or get current user
    let userId = user_id;
    if (!userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          { error: '請先登入' },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    // Add user to the group (use admin client to bypass RLS)
    const { data: membership, error: insertError } = await adminClient
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // Check if user is already a member (duplicate key error)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { message: '您已經是此群組的成員', group_name: group.name },
          { status: 200 }
        );
      }

      console.error('Insert membership error:', insertError);
      return NextResponse.json(
        { error: insertError.message || '加入群組失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: '成功加入群組',
        group_id: group.id,
        group_name: group.name,
        membership 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '內部伺服器錯誤' },
      { status: 500 }
    );
  }
}

