# Nutrition Book Reader Club - Development Plan

## Overview
A mobile webapp for managing a monthly nutrition book reading club with ~100 members organized into groups (~10 people per group). Each group has a leader who coordinates activities and distributes content.

---

## **1. Technology Stack Recommendation**

### **Frontend:**
- **React** or **Next.js** (for PWA support - works well on mobile browsers and can be converted to iOS app later)
- **Tailwind CSS** for responsive mobile-first UI
- **PWA (Progressive Web App)** configuration for app-like experience on phones

### **Backend:**
- **Python FastAPI** or **Django** (since you have `main.py`, suggesting Python)
- **PostgreSQL** for relational data (users, groups, responses, food logs)
- **Redis** for caching and real-time features

### **AI/ML Components:**
- **Google Gemini Vision API** or **OpenAI GPT-4 Vision** for food image recognition
- **Google Gemini API** for generating multiple-choice questions from book content
- **Nutrition database API** (e.g., USDA FoodData Central) for nutritional analysis

### **Infrastructure:**
- **Cloud hosting**: Vercel (frontend) + Railway/Render (backend), or all-in-one like Google Cloud
- **File storage**: AWS S3 or Google Cloud Storage for images
- **Scheduled tasks**: Celery + Redis for daily automated messages

---

## **2. Core Features Breakdown**

### **Function 1: Daily Automated Content Distribution**
- **Cron job/scheduled task** to send daily reading materials
- Store book content in chunks (daily portions) in database
- Push notifications or in-app notifications when new content is available
- Group leaders can customize schedule and content

**Technical Implementation:**
- Use Celery Beat or APScheduler for scheduled tasks
- Store daily content in `BookContent` table
- Trigger notifications to group members

---

### **Function 2: Member Sharing Text Recording**
- Simple text input form
- Store with timestamps, user ID, group ID
- Display in chronological feed

**Technical Implementation:**
- REST API endpoint: `POST /api/shares`
- Store in `TextShares` table
- Auto-post to group chat (Function 6)

---

### **Function 3: Multiple Choice Quiz System**
**AI-powered question generation:**
- Feed book chapter text to Gemini/GPT
- Prompt: "Generate 3-5 multiple choice questions about this nutrition content"
- Store questions, answer options, correct answers
- Track user responses and scores
- Display statistics (correct answer count, accuracy rate)

**Technical Implementation:**
- Admin/Leader uploads book content
- Background job generates questions using AI
- Store in `QuizQuestions` table
- Daily quiz delivery
- Track answers in `QuizResponses` table

---

### **Function 4: Food Image Recognition & Analysis** ⭐

This is the most complex feature. Here's the detailed approach:

#### **Step A: Image Upload & Recognition**
```
User uploads photo → Backend receives image → 
Send to Vision API (Gemini Vision/GPT-4V) →
API returns food items detected
```

**Prompt example for Vision API:**
```
"Identify all food items in this image. List each food item separately 
with estimated portion visibility. Return as JSON format."
```

**Sample Code:**
```python
import google.generativeai as genai

def analyze_food_image(image_path):
    model = genai.GenerativeModel('gemini-pro-vision')
    image = Image.open(image_path)
    
    prompt = """Analyze this food image and return a JSON with:
    - List of food items visible
    - Estimated portion size for each
    Format: {"foods": [{"name": "...", "portion": "..."}]}"""
    
    response = model.generate_content([prompt, image])
    return response.text
```

#### **Step B: Portion Input**
- Display detected food names to user
- User inputs quantity (e.g., "1 bowl", "200g", "2 pieces")
- Convert to standardized portions

#### **Step C: Nutritional Classification**
- Query nutrition database API with food name + quantity
- Use AI to classify into 7 major nutrition categories:
  - Carbohydrates, Proteins, Fats, Vitamins, Minerals, Water, Fiber
- Calculate nutritional values
- Generate personalized suggestions using AI:
  ```
  "Based on this meal containing [X]g protein, [Y]g carbs, 
  provide a brief nutrition suggestion for balance"
  ```

**Technical Implementation:**
- `POST /api/food-logs/upload` - image upload
- `POST /api/food-logs/{id}/items` - add food items with portions
- `GET /api/food-logs/{id}/analysis` - get nutritional analysis
- Store in `FoodLogs` and `FoodItems` tables

---

### **Function 5: Progress Dashboard**
- Aggregate data from Functions 2, 3, 4
- Visualizations: charts for quiz scores, nutrition balance over time
- Future: integrate iOS HealthKit data (sleep, steps)

**Technical Implementation:**
- Dashboard API: `GET /api/users/{id}/progress`
- Return aggregated data:
  - Quiz scores over time
  - Nutrition category balance
  - Sharing frequency
  - Group participation rate
- Use Chart.js or Recharts for visualizations

---

### **Function 6: Group Chat Room**
- WebSocket connection for real-time chat (~10 people per group)
- Auto-post entries from Functions 2, 3, 4 into chat feed
- Push notifications for new messages
- Use **Socket.IO** or native WebSockets

**Technical Implementation:**
- WebSocket endpoint: `/ws/groups/{group_id}`
- Store messages in `ChatMessages` table
- Real-time broadcasting to group members
- Link to shares/quizzes/food logs via `reference_id`

---

### **Function 7: Leader Announcement System**
- Content management for posting important updates
- Announcements displayed prominently in app
- Members receive notifications

**Technical Implementation:**
- `POST /api/groups/{id}/announcements` (leader only)
- Store in `Announcements` table
- Display on home screen
- Push notifications to all group members

---

### **Function 8: Group Setup & Management**
- Create/manage groups
- Assign members to groups
- Invite system (QR code or invite link)
- Role-based access control

**Technical Implementation:**
- `POST /api/groups` - create group
- `POST /api/groups/{id}/members` - add member
- `GET /api/groups/{id}/invite` - generate invite code
- `POST /api/groups/join/{invite_code}` - join via invite

---

## **3. Database Schema**

```sql
-- Users and Authentication
Users
  - id (PK)
  - name
  - email
  - password_hash
  - role (member/leader)
  - created_at

-- Group Management
Groups
  - id (PK)
  - name
  - leader_id (FK -> Users)
  - created_at

GroupMembers
  - group_id (FK -> Groups)
  - user_id (FK -> Users)
  - joined_at
  - PK (group_id, user_id)

-- Content & Quiz
BookContent
  - id (PK)
  - day
  - chapter
  - content (TEXT)
  - published_date

QuizQuestions
  - id (PK)
  - book_content_id (FK)
  - question (TEXT)
  - options_json (JSON)
  - correct_answer
  - created_at

QuizResponses
  - id (PK)
  - user_id (FK -> Users)
  - question_id (FK -> QuizQuestions)
  - answer
  - is_correct (BOOLEAN)
  - timestamp

-- Food Logging
FoodLogs
  - id (PK)
  - user_id (FK -> Users)
  - image_url
  - detected_foods_json (JSON)
  - timestamp

FoodItems
  - id (PK)
  - food_log_id (FK -> FoodLogs)
  - name
  - quantity
  - nutrition_data_json (JSON)
  - category (carbs/protein/fat/etc)

-- Sharing & Chat
TextShares
  - id (PK)
  - user_id (FK -> Users)
  - group_id (FK -> Groups)
  - content (TEXT)
  - timestamp

ChatMessages
  - id (PK)
  - group_id (FK -> Groups)
  - user_id (FK -> Users)
  - message (TEXT)
  - reference_type (share/quiz/food/announcement)
  - reference_id
  - timestamp

-- Announcements
Announcements
  - id (PK)
  - group_id (FK -> Groups)
  - leader_id (FK -> Users)
  - title
  - content (TEXT)
  - created_at
```

---

## **4. Development Phases**

### **Phase 1: MVP Foundation (2-3 weeks)**
- [ ] User authentication (login/register)
- [ ] Group creation and member assignment (Function 8)
- [ ] Basic daily content display (simplified Function 1)
- [ ] Text sharing (Function 2)
- [ ] Basic UI/UX for mobile

**Deliverable:** Users can register, join groups, view content, and share text

---

### **Phase 2: AI Features (2-3 weeks)**
- [ ] Integrate Gemini/OpenAI for quiz generation (Function 3)
- [ ] Food image recognition (Function 4 - Step A & B)
- [ ] Basic nutrition analysis (Function 4 - Step C)
- [ ] Quiz response tracking and scoring

**Deliverable:** AI-powered quizzes and food logging with nutritional feedback

---

### **Phase 3: Social & Analytics (2 weeks)**
- [ ] Group chat with real-time updates (Function 6)
- [ ] Progress dashboard (Function 5)
- [ ] Automated daily content push (Function 1 complete)
- [ ] Push notifications

**Deliverable:** Real-time chat, analytics dashboard, automated workflows

---

### **Phase 4: Leader Tools & Polish (1-2 weeks)**
- [ ] Leader announcement system (Function 7)
- [ ] Advanced group management features
- [ ] Notifications system refinement
- [ ] UI/UX refinements and mobile optimization
- [ ] Testing and bug fixes

**Deliverable:** Complete feature set with polished UX

---

### **Phase 5: iOS Preparation**
- [ ] PWA optimizations (offline mode, install prompt)
- [ ] Performance optimization
- [ ] Plan migration strategy:
  - **Option A**: Wrap webapp as WebView (easiest)
  - **Option B**: React Native (reuse React components)
  - **Option C**: Native Swift (rebuild, best performance)

---

## **5. Key Technical Considerations**

### **Mobile Optimization:**
- Responsive design (mobile-first)
- Image compression before upload (reduce bandwidth)
- Offline capability with service workers (PWA)
- Touch-friendly UI elements (min 44px touch targets)
- Fast loading times (lazy loading, code splitting)

### **Security:**
- JWT authentication
- Role-based access control (RBAC)
- Image upload validation and sanitization
- Rate limiting on API endpoints
- HTTPS only

### **Scalability:**
- Database indexing on frequently queried fields
- Redis caching for frequently accessed data
- CDN for static assets and images
- Horizontal scaling capability

### **AI API Management:**
- Rate limiting to control costs
- Caching AI responses where appropriate
- Fallback mechanisms if API fails
- Cost monitoring and alerts

---

## **6. Estimated Costs (Monthly)**

| Service | Cost (USD) | Notes |
|---------|-----------|-------|
| Hosting (Frontend + Backend) | $10-30 | Vercel + Railway/Render |
| Database (PostgreSQL) | $10-25 | Managed PostgreSQL service |
| AI API calls | $20-100 | Gemini: ~$0.001-0.01/image, Text: ~$0.001/1K tokens |
| Storage (Images) | $5-15 | AWS S3 or Google Cloud Storage |
| **Total** | **$50-200/month** | For 100 active users |

**Cost Optimization Tips:**
- Use image compression before storing
- Cache AI responses when possible
- Consider batch processing for non-urgent tasks
- Monitor API usage and set budgets

---

## **7. Next Steps to Start Development**

### **Step 1: Repository Structure**
```
nutrition-book-reader-club/
├── frontend/               # React/Next.js
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   ├── public/
│   └── package.json
├── backend/               # FastAPI/Django
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
├── shared/               # Shared types/constants
└── README.md
```

### **Step 2: Get API Keys**
- [ ] Google AI Studio (Gemini Vision API)
  - Visit: https://ai.google.dev/
- [ ] OpenAI API (alternative)
  - Visit: https://platform.openai.com/
- [ ] Nutrition Database API
  - USDA FoodData Central: https://fdc.nal.usda.gov/api-guide.html
  - Nutritionix API (alternative)

### **Step 3: Development Environment Setup**
- [ ] Install Node.js (v18+) and Python (3.10+)
- [ ] Set up PostgreSQL database (local or cloud)
- [ ] Set up Redis (local or cloud)
- [ ] Configure environment variables (.env files)

### **Step 4: Start Phase 1 Development**
- [ ] Create database schema and migrations
- [ ] Build authentication system
- [ ] Implement basic group management
- [ ] Create initial UI components

---

## **8. Reference Resources**

### **Food Image Recognition (Similar Apps):**
- Google AI Studio Spatial Understanding: https://ai.studio/apps/bundled/spatial-understanding
- Uses Gemini's vision capabilities for object detection

### **UI Design Reference:**
- Miro Board: https://miro.com/app/board/uXjVJBE5pYc=/?share_link_id=681702738012

### **Documentation to Review:**
- Google Gemini API Docs: https://ai.google.dev/docs
- FastAPI: https://fastapi.tiangolo.com/
- Next.js: https://nextjs.org/docs
- Socket.IO: https://socket.io/docs/

---

## **9. Risk Mitigation**

| Risk | Mitigation Strategy |
|------|-------------------|
| AI API costs exceed budget | Implement caching, rate limiting, and usage monitoring |
| Food recognition accuracy issues | Provide manual editing capability, collect feedback for improvement |
| WebSocket scalability | Use Redis pub/sub, consider managed solutions like Pusher |
| User adoption | Focus on UX, provide onboarding, gather early feedback |
| Data privacy concerns | Implement proper security, clear privacy policy, GDPR compliance |

---

## **10. Success Metrics**

- **User Engagement:** Daily active users, shares per user, quiz completion rate
- **Feature Adoption:** Food logging frequency, chat message volume
- **Quality:** Food recognition accuracy, user satisfaction scores
- **Performance:** Page load times < 2s, API response times < 500ms
- **Cost Efficiency:** Cost per active user < $2/month

---

## Contact & Next Steps

Ready to start building! Choose one of the following to proceed:
1. Set up the initial project structure
2. Create a prototype for food image recognition
3. Build the database schema and migrations
4. Create basic FastAPI backend setup

Let's build something great! 🚀

