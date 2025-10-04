# Group Chat Feature Guide

## Overview
The Group Chat feature enables real-time messaging between members of the same group using Supabase Realtime.

## Features
- ✅ Real-time message delivery using Supabase Realtime
- ✅ Group-based chat (users can only see messages from their groups)
- ✅ Message history (last 100 messages loaded on page load)
- ✅ User identification with names
- ✅ Timestamp for each message
- ✅ Auto-scroll to latest messages
- ✅ Different styling for own vs. others' messages

## Setup Instructions

### 1. Database Setup
The chat tables are already created by `scripts/setup_database.sql`. The schema includes:
- `chat_messages` - Stores all chat messages
- RLS policies to ensure users can only read/write messages in their groups

### 2. Create Test Group
Before testing the chat, you need to create a group and add users to it:

```sql
-- Run this in Supabase SQL Editor
-- (See scripts/setup_test_group.sql for the full script)

-- 1. Create a test group
INSERT INTO groups (name, description, invite_code)
VALUES ('測試群組', '測試用群組', 'TEST001');

-- 2. Add all existing users to the group
INSERT INTO group_members (group_id, user_id, role)
SELECT 
  (SELECT id FROM groups WHERE name = '測試群組' LIMIT 1),
  id,
  'member'
FROM auth.users
ON CONFLICT DO NOTHING;
```

### 3. Enable Realtime in Supabase
1. Go to Supabase Dashboard → Database → Replication
2. Enable realtime for `chat_messages` table
3. Click "Save" to apply changes

## Usage

### Access Chat Page
Navigate to: `http://localhost:3000/chat`

### Send a Message
1. Type your message in the input field
2. Click "發送" or press Enter
3. Message will appear instantly for all group members

### View Messages
- Messages are displayed in chronological order
- Your messages appear on the right (blue)
- Others' messages appear on the left (gray)
- Timestamps show when each message was sent

## Architecture

### Components
- **`useChat` hook** (`lib/hooks/useChat.ts`)
  - Manages chat state and real-time subscriptions
  - Fetches initial messages
  - Subscribes to new messages via Supabase Realtime
  - Sends messages via API route

- **`ChatMessage` component** (`components/chat/ChatMessage.tsx`)
  - Displays individual messages
  - Shows user name and timestamp
  - Different styling for own vs. others' messages

- **`ChatInput` component** (`components/chat/ChatInput.tsx`)
  - Input field and send button
  - Handles form submission
  - Loading states during send

- **Chat API Route** (`app/api/chat/send/route.ts`)
  - Validates user authentication
  - Verifies group membership
  - Inserts message into database

### Data Flow
1. User types message → `ChatInput`
2. `ChatInput` calls `sendMessage()` from `useChat`
3. `useChat` sends POST to `/api/chat/send`
4. API validates user and inserts message into `chat_messages` table
5. Supabase Realtime broadcasts new message to all subscribers
6. `useChat` receives the broadcast and updates local state
7. New message appears in all connected clients instantly

## Security
- **Authentication**: Users must be logged in to send messages
- **Authorization**: Users can only send/read messages in groups they belong to
- **RLS Policies**: Database-level security ensures data isolation between groups

## Troubleshooting

### "尚未加入群組" Message
**Solution**: Run the SQL script in `scripts/setup_test_group.sql` to create a group and add users.

### Messages Not Appearing in Real-time
**Solution**: 
1. Check that Realtime is enabled for `chat_messages` table in Supabase Dashboard
2. Check browser console for WebSocket connection errors
3. Verify RLS policies allow reading messages

### "您不是該群組的成員" Error
**Solution**: Verify the user is in the `group_members` table for the target group.

### Messages Not Sending
**Solution**:
1. Check browser console for error messages
2. Verify user authentication (check `/menu` page)
3. Check Supabase logs for API errors

## Future Enhancements
- [ ] Message editing/deletion
- [ ] File/image sharing
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Message reactions
- [ ] User presence (online/offline status)
- [ ] Multiple groups per user with group switcher
- [ ] Message search
- [ ] Push notifications for new messages

## Testing Checklist
- [ ] Create test group via SQL
- [ ] Add user to group
- [ ] Navigate to `/chat`
- [ ] Send a message
- [ ] Open chat in another browser/tab (same user or different user in same group)
- [ ] Verify message appears in real-time in both windows
- [ ] Verify own messages appear on right (blue)
- [ ] Verify others' messages appear on left (gray)
- [ ] Verify timestamps are correct
- [ ] Refresh page and verify message history loads

