# App Flow Test Checklist

## ✅ Authentication Flow

### 1. Registration
- [ ] Navigate to `/register`
- [ ] Enter email and password
- [ ] Submit registration form
- [ ] Receive success message
- [ ] Check email for confirmation link
- [ ] Click confirmation link
- [ ] Verify redirect to app

### 2. Login
- [ ] Navigate to `/login`
- [ ] Enter credentials
- [ ] Submit login form
- [ ] Verify redirect to dashboard
- [ ] Check session persistence (refresh page)

### 3. Email Confirmation
- [ ] Try login with unconfirmed email
- [ ] See "Email not confirmed" error
- [ ] Click "Resend Confirmation Email"
- [ ] Receive new confirmation email
- [ ] Confirm email and login successfully

### 4. Logout
- [ ] Navigate to `/menu`
- [ ] Click logout button
- [ ] Verify redirect to login page
- [ ] Verify cannot access protected routes

---

## ✅ Dashboard & Navigation

### 5. Dashboard Home (`/`)
- [ ] See welcome message with user info
- [ ] See 4 navigation cards:
  - [ ] 📖 今日內容
  - [ ] ❓ 每日測驗
  - [ ] 💬 群組聊天
  - [ ] 📸 食物辨識
- [ ] Click each card to verify navigation

### 6. Bottom Navigation
- [ ] See bottom nav bar with 4 items:
  - [ ] 🏠 首頁
  - [ ] 📢 公告
  - [ ] ☰ 選單
  - [ ] 💬 聊天
- [ ] Click each item to verify navigation

---

## ✅ Daily Content

### 7. Today's Content (`/content/today`)
- [ ] See current day number (Day X / 21)
- [ ] See content title
- [ ] See formatted content (markdown)
- [ ] Content loads without errors
- [ ] Navigation to quiz works

---

## ✅ Quiz System

### 8. Quiz Page (`/quiz` or `/quiz?day=1`)
- [ ] See quiz header with day number
- [ ] See progress indicator (e.g., "1 / 3")
- [ ] See progress bar
- [ ] See question text
- [ ] See 4 answer options (A, B, C, D)

### 9. Quiz Interaction
- [ ] Click an answer option
- [ ] Option highlights in blue
- [ ] "下一題" button becomes enabled
- [ ] Click "下一題" to go to next question
- [ ] Progress updates correctly
- [ ] "上一題" button works to go back
- [ ] Previous answers are preserved

### 10. Quiz Completion
- [ ] Answer all questions
- [ ] Click "完成測驗" on last question
- [ ] See results screen with:
  - [ ] 🎉 celebration emoji
  - [ ] Score (e.g., "2/3")
  - [ ] Percentage (e.g., "67%")
  - [ ] "返回內容頁面" button
  - [ ] "重新測驗" button
- [ ] Click "重新測驗" to restart
- [ ] Click "返回內容頁面" to go back

---

## ✅ Text Sharing

### 11. Share Page (`/share`)
- [ ] See current day header (e.g., "第 21 天 - 分享心得")
- [ ] See share status indicator
- [ ] See share form with:
  - [ ] Textarea for content
  - [ ] Character counter (0/500)
  - [ ] Submit button "分享心得"

### 12. Create Share
- [ ] Type text in textarea
- [ ] Character counter updates
- [ ] Cannot exceed 500 characters
- [ ] Click "分享心得" button
- [ ] See success message "分享成功！"
- [ ] Form clears after success
- [ ] Status changes to "✅ 今天已分享"
- [ ] Submit button becomes disabled
- [ ] Share appears in "最近的分享" section

### 13. View Shares
- [ ] See "最近的分享" section
- [ ] Each share shows:
  - [ ] User avatar (colored circle with initial)
  - [ ] Display name (用戶XXXX)
  - [ ] Share content
  - [ ] Time ago (e.g., "8小時前")
- [ ] Shares are ordered by newest first

### 14. Once-per-day Validation
- [ ] Try to submit second share on same day
- [ ] Verify button stays disabled
- [ ] See "今天已分享" indicator
- [ ] Cannot submit duplicate shares

---

## ✅ Menu & User Info

### 15. Menu Page (`/menu`)
- [ ] See user email
- [ ] See user ID
- [ ] See logout button
- [ ] Click logout to sign out

---

## ✅ Protected Routes

### 16. Authentication Required
- [ ] While logged out, try to access:
  - [ ] `/` - should redirect to login
  - [ ] `/content/today` - should redirect to login
  - [ ] `/quiz` - should redirect to login
  - [ ] `/share` - should redirect to login
  - [ ] `/menu` - should redirect to login

---

## ⚠️ Not Yet Implemented

### 17. Group Chat (`/chat`)
- [ ] Page exists but shows placeholder or "Coming soon"

### 18. Announcements (`/announcements`)
- [ ] Page exists but shows placeholder or "Coming soon"

### 19. Food Photo Upload
- [ ] Feature not yet implemented

---

## 🐛 Known Issues to Check

### 20. Error Handling
- [ ] Invalid login credentials show proper error
- [ ] Network errors are handled gracefully
- [ ] Loading states show spinners
- [ ] Empty states show helpful messages

### 21. Mobile Responsiveness
- [ ] Test on mobile viewport (375px width)
- [ ] Bottom nav is visible and clickable
- [ ] Forms are usable on mobile
- [ ] Text is readable
- [ ] Buttons are tappable

### 22. Performance
- [ ] Pages load within 2-3 seconds
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Smooth navigation between pages

---

## 📊 Test Results Summary

**Date:** [Fill in]
**Tester:** [Fill in]
**Environment:** Local (http://localhost:3000)

| Feature | Status | Notes |
|---------|--------|-------|
| Registration | ⬜️ | |
| Login | ⬜️ | |
| Dashboard | ⬜️ | |
| Daily Content | ⬜️ | |
| Quiz System | ⬜️ | |
| Text Sharing | ⬜️ | |
| Menu/Logout | ⬜️ | |

**Overall Status:** [Pass/Fail/Partial]

**Critical Issues Found:** 
- [List any blocking issues]

**Minor Issues Found:**
- [List any non-blocking issues]

**Recommendations:**
- [List any improvements]

