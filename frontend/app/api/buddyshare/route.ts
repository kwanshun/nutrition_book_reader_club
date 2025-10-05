import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ShareItem } from '@/lib/types/buddyshare';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's group
    const { data: groupMember, error: groupError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)
      .single();

    if (!groupMember) {
      return NextResponse.json({ error: 'User not in any group' }, { status: 403 });
    }

    // Fetch text shares from the same group
    const { data: textShares, error: textSharesError } = await supabase
      .from('text_shares')
      .select(`
        id,
        user_id,
        content,
        day_number,
        created_at,
        updated_at,
        profiles (
          display_name
        )
      `)
      .eq('group_id', groupMember.group_id)
      .order('created_at', { ascending: false })
      .limit(20);


    // Fetch food logs from the same group
    const { data: foodLogs, error: foodLogsError } = await supabase
      .from('food_logs')
      .select(`
        id,
        user_id,
        food_name,
        content,
        image_url,
        created_at,
        updated_at,
        profiles (
          display_name
        )
      `)
      .eq('group_id', groupMember.group_id)
      .order('created_at', { ascending: false })
      .limit(20);


    // Get comment counts for all shares
    const shareIds: string[] = [];
    if (textShares) {
      shareIds.push(...textShares.map(share => share.id));
    }
    if (foodLogs) {
      shareIds.push(...foodLogs.map(log => log.id));
    }

    const { data: commentCounts } = await supabase
      .from('share_comments')
      .select('share_id, share_type')
      .in('share_id', shareIds);

    // Get reaction counts for all shares
    const { data: reactionCounts } = await supabase
      .from('share_reactions')
      .select('share_id, share_type')
      .in('share_id', shareIds);

    // Get user's reactions
    const { data: userReactions } = await supabase
      .from('share_reactions')
      .select('share_id, share_type')
      .eq('user_id', user.id)
      .in('share_id', shareIds);

    // Transform text shares
    const transformedTextShares: ShareItem[] = (textShares || []).map(share => {
      const commentCount = commentCounts?.filter(c => c.share_id === share.id && c.share_type === 'text_share').length || 0;
      const likeCount = reactionCounts?.filter(r => r.share_id === share.id && r.share_type === 'text_share').length || 0;
      const isLiked = userReactions?.some(r => r.share_id === share.id && r.share_type === 'text_share') || false;

      return {
        id: share.id,
        type: 'text_share' as const,
        user_id: share.user_id,
        user_name: share.profiles?.display_name || `用戶${share.user_id.slice(-4)}`,
        content: share.content,
        created_at: share.created_at,
        updated_at: share.updated_at,
        day_number: share.day_number,
        like_count: likeCount,
        comment_count: commentCount,
        is_liked: isLiked,
      };
    });

    // Transform food logs
    const transformedFoodLogs: ShareItem[] = (foodLogs || []).map(log => {
      const commentCount = commentCounts?.filter(c => c.share_id === log.id && c.share_type === 'food_log').length || 0;
      const likeCount = reactionCounts?.filter(r => r.share_id === log.id && r.share_type === 'food_log').length || 0;
      const isLiked = userReactions?.some(r => r.share_id === log.id && r.share_type === 'food_log') || false;

      return {
        id: log.id,
        type: 'food_log' as const,
        user_id: log.user_id,
        user_name: log.profiles?.display_name || `用戶${log.user_id.slice(-4)}`,
        content: log.content || '',
        created_at: log.created_at,
        updated_at: log.updated_at,
        food_name: log.food_name,
        food_image_url: log.image_url,
        like_count: likeCount,
        comment_count: commentCount,
        is_liked: isLiked,
      };
    });

    // Combine and sort by creation date
    const allShares = [...transformedTextShares, ...transformedFoodLogs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(allShares);
  } catch (error) {
    console.error('Error fetching buddy shares:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
