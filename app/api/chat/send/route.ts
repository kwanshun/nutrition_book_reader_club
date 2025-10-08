import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    // Parse request body
    const { group_id, message } = await request.json();

    if (!group_id || !message || !message.trim()) {
      return NextResponse.json(
        { error: '訊息不能為空' },
        { status: 400 }
      );
    }

    // Verify user is a member of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('group_id', group_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      return NextResponse.json(
        { error: '您不是該群組的成員' },
        { status: 403 }
      );
    }

    // Insert message
    const { data: newMessage, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        group_id,
        user_id: user.id,
        message: message.trim(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json(
        { error: '發送訊息失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: newMessage }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

