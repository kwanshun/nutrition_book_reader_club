# Nutrition Book Reader Club - Frontend

21天營養書閱讀計劃 Web 應用

## 🚀 Quick Start

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout (繁體中文)
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   └── server.ts         # Server Supabase client
│   ├── hooks/
│   │   ├── useAuth.ts        # Authentication hook
│   │   └── useContent.ts     # Content fetching hook
│   ├── types/
│   │   └── database.ts       # TypeScript types
│   └── utils/
│       └── date.ts           # Date formatting (Chinese)
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx        # Reusable button
│   │   └── Card.tsx          # Reusable card
│   ├── layout/               # Navigation, sidebar, etc.
│   ├── content/              # Content display components
│   ├── quiz/                 # Quiz components
│   ├── chat/                 # Real-time chat
│   ├── food/                 # Food logging
│   └── share/                # Text sharing
│
└── .env.local                # Environment variables (not in git)
```

---

## 🔑 Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Real-time:** Supabase Realtime
- **AI:** Google Gemini API

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🎯 Next Steps

### Week 1: Foundation
- [x] Project setup
- [x] Supabase client configuration  
- [x] Database types
- [x] Basic layout (繁體中文)
- [ ] Authentication pages (login/register)
- [ ] Dashboard layout with navigation
- [ ] Content display page

### Week 2: Core Features
- [ ] Quiz interface
- [ ] Text sharing form
- [ ] Real-time group chat
- [ ] Food photo upload
- [ ] Gemini Vision integration

### Week 3: Polish
- [ ] Progress dashboard
- [ ] PWA configuration
- [ ] Mobile responsive design
- [ ] Testing and deployment

---

## 📚 Key Features

1. **Daily Content** - 21 days of nutrition book content
2. **AI Quizzes** - 3 questions per day, pre-generated
3. **Text Sharing** - Once daily reflection
4. **Food Logging** - Photo + AI recognition
5. **Group Chat** - Real-time messaging
6. **Progress Tracking** - Quiz scores, participation

---

## 🔗 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

---

**Current Status:** ✅ Foundation complete, ready for feature development
