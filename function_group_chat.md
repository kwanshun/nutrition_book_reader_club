# Function Specification: Group Chat

## 📋 Overview

The Group Chat function enables real-time messaging between members of the same nutrition learning group. Users can communicate, share insights, and discuss their daily nutrition learning progress in a collaborative environment.

## 🎯 Core Requirements

### 1. **User Display Names** ⭐ **CRITICAL**
- **Requirement**: display_name must be displayed, NOT user_id
- **Current Implementation**: ✅ Fixed and implemented
- **Details**: 
  - Fetches `display_name` from `profiles` table
  - Fallback to `用戶{last4digits}` if display_name not found


### 2. **Real-time Messaging**
- **Requirement**: Messages appear instantly without page refresh
- **Implementation**: Supabase Realtime subscriptions
- **Technical**: Uses `postgres_changes` event listener on `chat_messages` table

### 3. **Group-based Access Control**
- **Requirement**: Users can only see messages from their group
- **Implementation**: All messages filtered by `group_id`
- **Security**: API validates group membership before allowing message sending

### 4. **Message History**
- **Requirement**: Load previous messages when entering chat
- **Implementation**: Fetches last 100 messages ordered by `created_at`
- **Performance**: Limited to 100 messages for optimal loading

## 🏗️ Technical Architecture

### Database Schema
```sql
-- chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints
- **POST** `/api/chat/send` - Send new message
- **GET** `/api/chat/messages` - Fetch message history (via useChat hook)

### Frontend Components
- `ChatPage` - Main chat interface
- `ChatMessage` - Individual message display
- `ChatInput` - Message input form
- `useChat` - Custom hook for chat functionality

## 📱 User Interface Requirements

### 1. **Chat Header**
- Group name display
- "即時聊天室" subtitle
- Blue header with white text

### 2. **Message Display**
- **Own Messages**: Right-aligned, blue background, white text
- **Other Messages**: Left-aligned, gray background, black text
- **Username**: Only shown for other users' messages
- **Timestamp**: 24-hour format (HH:MM)
- **Message Content**: Supports line breaks and long text

### 3. **Input Area**
- Text input field with placeholder "輸入訊息..."
- Send button (disabled when empty or sending)
- Loading state: "發送中..." when sending
- Form submission on Enter key

### 4. **Empty State**
- Large chat emoji (💬)
- "尚無訊息，開始聊天吧！" message
- Centered in chat area

### 5. **Loading States**
- "載入訊息中..." when fetching messages
- Error display with red background for API errors

## 🔒 Security Requirements

### 1. **Authentication**
- User must be logged in to access chat
- API returns 401 if not authenticated

### 2. **Group Membership Validation**
- User must be member of the group to send messages
- API validates membership before message insertion
- Returns 403 if user not in group

### 3. **Message Validation**
- Message content cannot be empty
- Message is trimmed of whitespace
- Returns 400 for invalid input

### 4. **Data Access Control**
- Users can only see messages from their group
- Real-time subscriptions filtered by group_id
- No cross-group message visibility

## 📊 Performance Requirements

### 1. **Message Loading**
- Initial load: Maximum 100 messages
- Ordered by creation time (oldest first)
- Efficient database queries with proper indexing

### 2. **Real-time Updates**
- New messages appear within 1 second
- No page refresh required
- Automatic scroll to bottom on new messages

### 3. **Input Responsiveness**
- Send button disabled during transmission
- Clear visual feedback for sending state
- Input cleared after successful send

## 🌐 Internationalization

### 1. **Language Support**
- All UI text in Traditional Chinese (繁體中文)
- Time format: 24-hour (HH:MM)
- Date format: Localized for Taiwan

### 2. **Text Content**
- User messages: Any language supported
- System messages: Traditional Chinese only
- Error messages: Traditional Chinese

## 📱 Mobile Responsiveness

### 1. **Layout**
- Full-screen chat interface
- Maximum width: 448px (max-w-md)
- Responsive message bubbles (max-width: 75%)

### 2. **Touch Interface**
- Large touch targets for send button
- Keyboard-friendly input field
- Smooth scrolling for message history

## 🧪 Testing Requirements

### 1. **Functional Testing**
- ✅ Send messages successfully
- ✅ Receive real-time messages
- ✅ Display user names correctly
- ✅ Handle empty states
- ✅ Show loading states
- ✅ Display error messages

### 2. **Performance Testing**
- ✅ Load 20+ messages efficiently
- ✅ Real-time updates work smoothly
- ✅ Multiple users can chat simultaneously
- ✅ No memory leaks in long sessions

### 3. **Security Testing**
- ✅ Group isolation (no cross-group messages)
- ✅ Authentication required
- ✅ Input validation works
- ✅ SQL injection prevention

## 🚀 Future Enhancements

### 1. **Message Features**
- Message editing/deletion
- Message reactions (👍, ❤️, etc.)
- File/image sharing
- Message search

### 2. **User Experience**
- Typing indicators
- Message read receipts
- User online status
- Message threading

### 3. **Moderation**
- Message reporting
- Admin controls
- Message filtering
- User blocking

## 📋 Implementation Checklist

### ✅ Completed Features
- [x] Real-time messaging with Supabase
- [x] User display names (not user_id)
- [x] Group-based access control
- [x] Message history loading
- [x] Responsive UI design
- [x] Error handling
- [x] Loading states
- [x] Traditional Chinese localization
- [x] Mobile-responsive design
- [x] Security validation

### 🔄 Current Status
- **Status**: ✅ Fully Functional
- **Last Updated**: January 2025
- **Test Data**: 20 messages created for performance testing
- **Users**: test55@andywong.me, test77@andywong.me, test44@andywong.me, test99@andywong.me

## 🎯 Success Criteria

The Group Chat function is considered successful when:

1. ✅ Users can send and receive messages in real-time
2. ✅ User display names are shown (not user IDs)
3. ✅ Messages are properly isolated by group
4. ✅ Interface is responsive and user-friendly
5. ✅ Performance is smooth with multiple users
6. ✅ Security requirements are met
7. ✅ Error handling works correctly
8. ✅ Mobile experience is optimized

---

**Document Version**: 1.0  
**Last Updated**: Oct 2025  
**Status**: ✅ Production Ready
