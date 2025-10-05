export interface ShareItem {
  id: string;
  type: 'text_share' | 'food_log';
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  updated_at?: string;
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
  
  // Text share specific
  day_number?: number;
  
  // Food log specific
  food_name?: string;
  food_image_url?: string;
}

export interface ShareComment {
  id: string;
  share_id: string;
  share_type: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface ShareReaction {
  id: string;
  share_id: string;
  share_type: string;
  user_id: string;
  reaction_type: 'like';
  created_at: string;
}

export interface BuddyShareApiResponse {
  shares: ShareItem[];
  comments: ShareComment[];
  reactions: ShareReaction[];
}
