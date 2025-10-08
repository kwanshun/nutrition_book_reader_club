import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ShareComment } from '@/lib/types/buddyshare';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('share_id');
    const shareType = searchParams.get('share_type');

    if (!shareId || !shareType) {
      return NextResponse.json({ error: 'Missing share_id or share_type' }, { status: 400 });
    }

    // Fetch comments for the share
    const { data: comments, error } = await supabase
      .from('share_comments')
      .select(`
        id,
        share_id,
        share_type,
        user_id,
        content,
        created_at,
        updated_at,
        profiles (
          display_name
        )
      `)
      .eq('share_id', shareId)
      .eq('share_type', shareType)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Transform comments
    const transformedComments: ShareComment[] = (comments || []).map(comment => ({
      id: comment.id,
      share_id: comment.share_id,
      share_type: comment.share_type,
      user_id: comment.user_id,
      user_name: comment.profiles?.display_name || `用戶${comment.user_id.slice(-4)}`,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
    }));

    return NextResponse.json(transformedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { share_id, share_type, content } = body;

    if (!share_id || !share_type || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['text_share', 'food_log'].includes(share_type)) {
      return NextResponse.json({ error: 'Invalid share_type' }, { status: 400 });
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('share_comments')
      .insert({
        share_id,
        share_type,
        user_id: user.id,
        content: content.trim(),
      })
      .select(`
        id,
        share_id,
        share_type,
        user_id,
        content,
        created_at,
        updated_at,
        profiles (
          display_name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    // Transform comment
    const transformedComment: ShareComment = {
      id: comment.id,
      share_id: comment.share_id,
      share_type: comment.share_type,
      user_id: comment.user_id,
      user_name: comment.profiles?.display_name || `用戶${comment.user_id.slice(-4)}`,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
    };

    return NextResponse.json(transformedComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
