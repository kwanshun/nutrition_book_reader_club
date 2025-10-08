import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { share_id, share_type, reaction_type = 'like' } = body;

    if (!share_id || !share_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['text_share', 'food_log'].includes(share_type)) {
      return NextResponse.json({ error: 'Invalid share_type' }, { status: 400 });
    }

    if (reaction_type !== 'like') {
      return NextResponse.json({ error: 'Invalid reaction_type' }, { status: 400 });
    }

    // Check if user already reacted
    const { data: existingReaction } = await supabase
      .from('share_reactions')
      .select('id')
      .eq('share_id', share_id)
      .eq('share_type', share_type)
      .eq('user_id', user.id)
      .eq('reaction_type', reaction_type)
      .single();

    let result;
    if (existingReaction) {
      // Remove reaction (unlike)
      const { error: deleteError } = await supabase
        .from('share_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error('Error removing reaction:', deleteError);
        return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
      }

      result = { action: 'removed', count: -1 };
    } else {
      // Add reaction (like)
      const { error: insertError } = await supabase
        .from('share_reactions')
        .insert({
          share_id,
          share_type,
          user_id: user.id,
          reaction_type,
        });

      if (insertError) {
        console.error('Error adding reaction:', insertError);
        return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
      }

      result = { action: 'added', count: 1 };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
