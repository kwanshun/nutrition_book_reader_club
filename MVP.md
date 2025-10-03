# Nutrition Book Reader Club - MVP Plan

## Overview
A simplified mobile webapp for testing core features with a small group (10-20 users) before scaling to 100+ members.

## MVP Goals
- Validate user engagement with food photo sharing
- Test group dynamics and text sharing
- Verify AI food recognition accuracy
- Gather feedback for full version development

---

## **MVP Tech Stack (Simplified)**

### **Frontend:**
- **Next.js** + **Tailwind CSS** + **PWA**
- **Vercel** (free hosting)

### **Backend:**
- **FastAPI** (simple API endpoints)
- **Supabase** (database + auth + real-time + storage)

### **AI/ML:**
- **Google Gemini Vision API** (basic food recognition)

### **Infrastructure:**
- **Vercel** (frontend)
- **Supabase** (backend + database + storage)
- **Cost: $0/month** (free tiers)

---

## **MVP Features (Core Only)**

### **1. User Authentication**
- Simple registration/login
- Profile creation (name, email)
- Group assignment

**Technical:**
- Supabase Auth
- Basic user profile
- Group membership table

### **2. Group Management**
- Create groups (admin only)
- Join groups via invite code
- View group members
- Basic group settings

**Technical:**
- Groups table
- GroupMembers table
- Invite code generation

### **3. Text Sharing**
- Simple text input form
- Post to group feed
- View group feed (chronological)
- Basic text formatting

**Technical:**
- TextShares table
- POST /api/shares endpoint
- GET /api/groups/{id}/shares

### **4. Food Photo Upload (Simplified)**
- Upload food photo
- AI identifies food items
- Display food names
- Simple portion input
- Share to group feed

**Technical:**
- Image upload to Supabase Storage
- Gemini Vision API integration
- FoodLogs table
- Basic food recognition

### **5. Group Feed**
- View all group activity
- Text shares + food photos
- Chronological display
- Simple interactions (like/view)

**Technical:**
- Combined feed query
- Real-time updates (Supabase Realtime)
- Simple activity tracking

---

## **MVP Scope (What's NOT Included)**

### **Skipped Features:**
- ❌ Automated content distribution
- ❌ AI quiz generation
- ❌ Advanced nutrition analysis
- ❌ Progress dashboard
- ❌ Leader announcement system
- ❌ Real-time chat (use simple feed instead)
- ❌ Complex group management
- ❌ Push notifications

### **Simplified Features:**
- Basic food recognition (no nutrition analysis)
- Simple group feed (no real-time chat)
- Manual group setup (no automated invites)
- Basic user profiles (no detailed settings)

---

## **MVP Development Timeline (2-3 weeks)**

### **Week 1: Foundation**
- [ ] Set up project structure
- [ ] Create Next.js + FastAPI setup
- [ ] Implement Supabase authentication
- [ ] Build basic user registration/login
- [ ] Create group management (admin only)

### **Week 2: Core Features**
- [ ] Implement text sharing system
- [ ] Build food photo upload
- [ ] Integrate Gemini Vision API
- [ ] Create group feed display
- [ ] Add basic food recognition

### **Week 3: Polish & Testing**
- [ ] UI/UX improvements
- [ ] PWA configuration
- [ ] Testing with small group
- [ ] Bug fixes and refinements
- [ ] Prepare for user feedback

---

## **MVP Database Schema (Simplified)**

```sql
-- Users (Supabase Auth handles this)
-- Groups
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  invite_code VARCHAR(10) UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Group Members
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id),
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(20) DEFAULT 'member', -- 'member' or 'admin'
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Text Shares
CREATE TABLE text_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  group_id UUID REFERENCES groups(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Food Logs
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  group_id UUID REFERENCES groups(id),
  image_url TEXT,
  detected_foods JSONB, -- AI recognition results
  user_input TEXT, -- user's portion/notes
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## **MVP API Endpoints**

### **Authentication (Supabase)**
- POST /auth/signup
- POST /auth/login
- POST /auth/logout

### **Groups**
- GET /api/groups (user's groups)
- POST /api/groups (create group - admin only)
- GET /api/groups/{id} (group details)
- POST /api/groups/join/{invite_code} (join group)

### **Shares**
- POST /api/shares (create text share)
- GET /api/groups/{id}/shares (group feed)

### **Food Logs**
- POST /api/food-logs (upload photo)
- GET /api/food-logs/{id}/recognize (AI recognition)
- GET /api/groups/{id}/food-logs (group food feed)

---

## **MVP Success Metrics**

### **User Engagement:**
- 10+ active users
- 5+ daily food photo uploads
- 10+ text shares per week
- 80%+ weekly active users

### **Technical Performance:**
- Food recognition accuracy > 70%
- Page load time < 3 seconds
- 99% uptime
- No critical bugs

### **User Feedback:**
- Overall satisfaction > 4/5
- Feature requests collected
- Pain points identified
- Willingness to pay (if applicable)

---

## **MVP Testing Plan**

### **Phase 1: Internal Testing (Week 3)**
- Test with 2-3 team members
- Verify all features work
- Fix critical bugs
- Optimize performance

### **Phase 2: Beta Testing (Week 4)**
- Invite 10-15 friends/family
- Collect daily feedback
- Monitor usage patterns
- Document improvement areas

### **Phase 3: User Feedback (Week 5)**
- Conduct user interviews
- Analyze usage data
- Prioritize feature requests
- Plan full version development

---

## **MVP to Full Version Roadmap**

### **Phase 2: AI Features (2-3 weeks)**
- Advanced food nutrition analysis
- AI quiz generation
- Progress tracking
- Enhanced food recognition

### **Phase 3: Social Features (2 weeks)**
- Real-time group chat
- Leader announcement system
- Advanced group management
- Push notifications

### **Phase 4: Automation (1-2 weeks)**
- Automated content distribution
- Scheduled tasks
- Advanced analytics
- Performance optimization

---

## **MVP Cost Analysis**

### **Development Costs:**
- Development time: 2-3 weeks
- Testing time: 1 week
- Total: 3-4 weeks

### **Infrastructure Costs:**
- Vercel: Free (frontend)
- Supabase: Free (up to 500MB, 50,000 rows)
- Gemini API: ~$5-20/month (depending on usage)
- **Total: $5-20/month**

### **Risk Mitigation:**
- Low financial risk
- Fast iteration cycle
- Early user validation
- Clear success metrics

---

## **Next Steps**

1. **Set up development environment**
2. **Create project repositories**
3. **Set up Supabase project**
4. **Begin Week 1 development**
5. **Start with user authentication**

**Ready to build the MVP and validate your concept! 🚀**
