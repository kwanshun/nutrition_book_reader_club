# Test Data for Nutrition Book Reader Club

## 🧪 Test Environment Setup

### **Quick Test URLs:**
1. **Mockup Demo**: Open `MOCKUP_DEMO.html` in browser
2. **Frontend App**: http://localhost:3000 (when running)
3. **Database**: Supabase Dashboard

---

## 📱 **Mockup Demo Features**

### **Interactive Mockup Includes:**
- ✅ **Home Screen** - Feature grid with 6 main functions
- ✅ **Food Recognition** - AI-powered food photo analysis
- ✅ **Daily Quiz** - Multiple choice questions with scoring
- ✅ **Group Chat** - Real-time messaging interface
- ✅ **Progress Tracking** - 21-day learning progress
- ✅ **Mobile-First Design** - Responsive for phones

### **Key UI Elements:**
- **Header**: Progress bar showing day 14/21 (65% complete)
- **Feature Cards**: 6 main functions with icons
- **News Feed**: Latest announcements and updates
- **Bottom Navigation**: 4 main sections
- **Interactive Elements**: Clickable buttons, quizzes, chat

---

## 🎯 **Test Scenarios**

### **Scenario 1: Food Recognition Test**
```
1. Open MOCKUP_DEMO.html
2. Click "🍴📷 食過什麼" feature card
3. See food upload interface
4. Click "🔍 開始AI辨識" button
5. View detected foods: 白米飯, 烤雞胸肉, 青菜
6. Click "📊 分析營養成分"
```

### **Scenario 2: Daily Quiz Test**
```
1. Click "🖥️ 測一測" feature card
2. Read question: "以下哪種行為最利於身體健康？"
3. Select answer option (A, B, C, or D)
4. Click "提交答案"
5. See correct answer feedback
```

### **Scenario 3: Group Chat Test**
```
1. Click "💬 聊天室" feature card
2. View existing messages from group members
3. Type message in input field
4. Click "發送" button
5. See message appear in chat
```

### **Scenario 4: Navigation Test**
```
1. Use bottom navigation to switch between screens
2. Use demo control buttons to navigate
3. Test responsive design on different screen sizes
4. Verify all 4 main sections work
```

---

## 📊 **Sample Data for Testing**

### **Sample Quiz Questions:**
```json
{
  "day": 14,
  "question": "根據今天的閱讀內容，以下哪種行為最利於身體健康？",
  "options": [
    "A. 每天攝取足夠的蛋白質",
    "B. 每天曬太陽15分鐘", 
    "C. 均衡攝取各種營養素",
    "D. 以上皆是"
  ],
  "correct_answer": "D",
  "explanation": "文章強調均衡營養的重要性，包括蛋白質、維生素D和各種營養素的攝取。"
}
```

### **Sample Food Recognition Results:**
```json
[
  {
    "name": "白米飯",
    "portion": "1碗 (約200g)",
    "description": "蒸煮的白米飯",
    "nutrition": {
      "calories": 260,
      "carbs": 56,
      "protein": 5,
      "fat": 0.5
    }
  },
  {
    "name": "烤雞胸肉", 
    "portion": "1片 (約150g)",
    "description": "烤製的雞胸肉",
    "nutrition": {
      "calories": 231,
      "carbs": 0,
      "protein": 43,
      "fat": 5
    }
  }
]
```

### **Sample Chat Messages:**
```json
[
  {
    "sender": "張小明",
    "message": "今天的內容很有用！我學到了很多關於維生素的知識。",
    "timestamp": "2024-12-19 14:30:00",
    "type": "text"
  },
  {
    "sender": "李小花", 
    "message": "我剛剛用食物識別功能拍了午餐，AI識別得很準確呢！",
    "timestamp": "2024-12-19 14:35:00",
    "type": "text"
  }
]
```

---

## 🔧 **Frontend Test Environment**

### **Current Frontend Status:**
- ✅ Next.js 14 with TypeScript
- ✅ Tailwind CSS styling
- ✅ Supabase integration ready
- ✅ Mobile-responsive design
- ✅ PWA configuration

### **Available Pages:**
- `/` - Home dashboard
- `/login` - User authentication
- `/register` - User registration  
- `/content/today` - Daily content
- `/share` - Text sharing
- `/quiz` - Daily quiz
- `/food` - Food recognition
- `/records` - Progress tracking
- `/chat` - Group chat
- `/menu` - Settings menu

### **Test the Real App:**
```bash
# Start development server
cd frontend
npm run dev

# Open in browser
http://localhost:3000
```

---

## 📱 **Mobile Testing**

### **Test on Different Devices:**
1. **Desktop Browser**: Chrome, Firefox, Safari
2. **Mobile Browser**: iOS Safari, Android Chrome
3. **PWA**: Install as web app on mobile
4. **Responsive**: Test different screen sizes

### **Key Mobile Features:**
- Touch-friendly buttons (44px minimum)
- Swipe gestures for navigation
- Camera access for food photos
- Offline capability (PWA)
- Push notifications (future)

---

## 🎨 **Design System**

### **Color Palette:**
- **Primary Blue**: #4facfe (gradient start)
- **Secondary Blue**: #00f2fe (gradient end)
- **Success Green**: #4caf50
- **Warning Red**: #f44336
- **Background**: #f8f9fa
- **Text**: #333333

### **Typography:**
- **Headers**: 24px, 700 weight
- **Body**: 14px, 400 weight
- **Labels**: 12px, 600 weight
- **Font**: -apple-system, BlinkMacSystemFont

### **Spacing:**
- **Padding**: 20px (mobile), 40px (desktop)
- **Margin**: 15px between elements
- **Border Radius**: 12px (cards), 24px (buttons)

---

## 🚀 **Next Steps for Testing**

### **Immediate Tests:**
1. **Open Mockup**: `MOCKUP_DEMO.html` in browser
2. **Test Navigation**: Click through all screens
3. **Test Interactions**: Quiz, chat, food recognition
4. **Test Responsive**: Resize browser window

### **Advanced Tests:**
1. **Start Frontend**: `npm run dev` in frontend folder
2. **Test Authentication**: Login/register flow
3. **Test Database**: Connect to Supabase
4. **Test AI Features**: Food recognition API

### **Production Tests:**
1. **Deploy to Vercel**: Test live deployment
2. **Test PWA**: Install on mobile device
3. **Test Performance**: Page load speeds
4. **Test Accessibility**: Screen reader compatibility

---

## 📋 **Test Checklist**

### **UI/UX Tests:**
- [ ] All screens load correctly
- [ ] Navigation works smoothly
- [ ] Buttons are clickable
- [ ] Text is readable
- [ ] Images display properly
- [ ] Responsive design works

### **Functionality Tests:**
- [ ] Food recognition interface
- [ ] Quiz selection and submission
- [ ] Chat message sending
- [ ] Progress tracking display
- [ ] Form inputs work
- [ ] Error handling works

### **Performance Tests:**
- [ ] Page load time < 3 seconds
- [ ] Smooth animations
- [ ] No layout shifts
- [ ] Efficient image loading
- [ ] Fast navigation

### **Accessibility Tests:**
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] High contrast mode
- [ ] Text scaling
- [ ] Touch target sizes

---

## 🎯 **Success Criteria**

### **Mockup Demo:**
- ✅ Interactive and engaging
- ✅ Shows all key features
- ✅ Mobile-optimized design
- ✅ Professional appearance
- ✅ Easy to navigate

### **Real App:**
- ✅ Connects to database
- ✅ AI features work
- ✅ Real-time chat functions
- ✅ User authentication works
- ✅ Data persistence works

---

**Ready to test! Start with the mockup demo to see the full user experience.** 🚀

