# Frontend Architecture Plan

**Project:** Nutrition Book Reader Club  
**Framework:** Next.js 14+ (App Router)  
**Language:** TypeScript  
**UI:** Tailwind CSS  
**Target:** 100 users, Traditional Chinese (繁體中文)

---

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (no layout)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/              # Main app (with navigation)
│   │   ├── layout.tsx            # Dashboard layout with nav
│   │   ├── page.tsx              # Home/Today's content
│   │   │
│   │   ├── content/
│   │   │   └── [day]/            # Dynamic route for day 1-21
│   │   │       └── page.tsx
│   │   │
│   │   ├── quiz/
│   │   │   └── [day]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   │
│   │   ├── food/
│   │   │   ├── page.tsx          # Food log feed
│   │   │   └── upload/
│   │   │       └── page.tsx
│   │   │
│   │   ├── share/
│   │   │   └── page.tsx          # Text sharing form
│   │   │
│   │   ├── progress/
│   │   │   └── page.tsx
│   │   │
│   │   └── group/
│   │       └── page.tsx
│   │
│   ├── api/                      # API routes (if needed)
│   │   ├── auth/
│   │   │   └── route.ts
│   │   └── gemini/
│   │       └── route.ts          # Proxy for Gemini API
│   │
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── providers.tsx             # Context providers
│
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── Loading.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── content/                  # Content-specific
│   │   ├── ContentCard.tsx
│   │   ├── ContentList.tsx
│   │   └── DayProgress.tsx
│   │
│   ├── quiz/                     # Quiz components
│   │   ├── QuizCard.tsx
│   │   ├── QuestionItem.tsx
│   │   ├── AnswerOption.tsx
│   │   └── QuizResults.tsx
│   │
│   ├── chat/                     # Chat components
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   └── MessageList.tsx
│   │
│   ├── food/                     # Food logging
│   │   ├── FoodCard.tsx
│   │   ├── FoodUpload.tsx
│   │   ├── FoodItemList.tsx
│   │   └── NutritionSummary.tsx
│   │
│   └── share/                    # Text sharing
│       ├── ShareForm.tsx
│       ├── ShareCard.tsx
│       └── ShareFeed.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   │
│   ├── gemini/
│   │   └── client.ts             # Gemini API wrapper
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useGroup.ts
│   │   ├── useContent.ts
│   │   ├── useQuiz.ts
│   │   ├── useChat.ts
│   │   └── useFoodLog.ts
│   │
│   ├── utils/
│   │   ├── date.ts               # Date formatting (Chinese)
│   │   ├── validation.ts
│   │   └── helpers.ts
│   │
│   └── types/
│       ├── database.ts           # Database types
│       ├── api.ts                # API types
│       └── index.ts
│
├── public/
│   ├── icons/
│   ├── images/
│   └── manifest.json             # PWA manifest
│
├── .env.local                    # Environment variables
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json
```

---

## 🗄️ Database Types (TypeScript)

```typescript
// lib/types/database.ts

export interface DailyContent {
  id: string;
  day_number: number;
  title: string;
  content: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  day_number: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  quiz_id: string;
  question_index: number;
  answer: string;
  is_correct: boolean;
  answered_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string | null;
  leader_id: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'member' | 'leader';
  joined_at: string;
}

export interface TextShare {
  id: string;
  user_id: string;
  group_id: string;
  content: string;
  created_at: string;
  user?: {
    name: string;
  };
}

export interface FoodLog {
  id: string;
  user_id: string;
  group_id: string;
  image_url: string;
  detected_foods: any;
  user_input: string | null;
  created_at: string;
  user?: {
    name: string;
  };
}

export interface ChatMessage {
  id: string;
  group_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user?: {
    name: string;
  };
}
```

---

## 🔌 Supabase Client Setup

### Browser Client
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types/database';

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
```

### Server Client (for Server Components)
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};
```

---

## 🎣 Custom Hooks

### Authentication Hook
```typescript
// lib/hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};
```

### Content Hook
```typescript
// lib/hooks/useContent.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailyContent } from '@/lib/types/database';

export const useContent = (dayNumber?: number) => {
  const [content, setContent] = useState<DailyContent | DailyContent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        if (dayNumber) {
          // Fetch specific day
          const { data, error } = await supabase
            .from('daily_content')
            .select('*')
            .eq('day_number', dayNumber)
            .single();
          
          if (error) throw error;
          setContent(data);
        } else {
          // Fetch all days
          const { data, error } = await supabase
            .from('daily_content')
            .select('*')
            .order('day_number');
          
          if (error) throw error;
          setContent(data);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [dayNumber]);

  return { content, loading, error };
};
```

### Real-time Chat Hook
```typescript
// lib/hooks/useChat.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ChatMessage } from '@/lib/types/database';

export const useChat = (groupId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, user:auth.users(name)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`chat:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const sendMessage = async (message: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .insert({ group_id: groupId, message });

    return { error };
  };

  return { messages, loading, sendMessage };
};
```

---

## 📱 Key Pages

### Home Page (Today's Content)
```typescript
// app/(dashboard)/page.tsx
import { createClient } from '@/lib/supabase/server';
import ContentCard from '@/components/content/ContentCard';
import QuizCard from '@/components/quiz/QuizCard';

export default async function HomePage() {
  const supabase = createClient();
  
  // Get today's day number (calculate based on program start date)
  const today = 1; // TODO: Calculate current day
  
  // Fetch today's content
  const { data: content } = await supabase
    .from('daily_content')
    .select('*')
    .eq('day_number', today)
    .single();
  
  // Fetch today's quiz
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('day_number', today)
    .single();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">第 {today} 天</h1>
      
      {content && <ContentCard content={content} />}
      {quiz && <QuizCard quiz={quiz} dayNumber={today} />}
      
      <div className="grid grid-cols-2 gap-4">
        <Link href="/chat" className="btn-primary">
          群組聊天
        </Link>
        <Link href="/food/upload" className="btn-secondary">
          記錄飲食
        </Link>
      </div>
    </div>
  );
}
```

### Quiz Page
```typescript
// app/(dashboard)/quiz/[day]/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useContent } from '@/lib/hooks/useContent';
import QuestionItem from '@/components/quiz/QuestionItem';
import QuizResults from '@/components/quiz/QuizResults';

export default function QuizPage() {
  const params = useParams();
  const dayNumber = parseInt(params.day as string);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  
  // Fetch quiz data
  // Submit answers
  // Show results

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Quiz interface */}
    </div>
  );
}
```

### Food Upload Page
```typescript
// app/(dashboard)/food/upload/page.tsx
'use client';

import { useState } from 'react';
import FoodUpload from '@/components/food/FoodUpload';

export default function FoodUploadPage() {
  const [image, setImage] = useState<File | null>(null);
  const [detectedFoods, setDetectedFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    // 1. Upload image to Supabase Storage
    // 2. Call Gemini Vision API (via API route)
    // 3. Display detected foods
    // 4. Let user confirm/edit
    // 5. Save to food_logs table
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">記錄飲食</h1>
      <FoodUpload
        image={image}
        onImageSelect={setImage}
        onUpload={handleUpload}
        loading={loading}
      />
      {detectedFoods.length > 0 && (
        <FoodItemList items={detectedFoods} />
      )}
    </div>
  );
}
```

---

## 🎨 Styling with Tailwind

### Tailwind Config (Chinese Font)
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'PingFang TC',
          'Microsoft JhengHei',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### Global Styles
```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg 
           hover:bg-primary-700 transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-lg 
           hover:bg-gray-300 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm p-4 border border-gray-200;
  }
}
```

---

## 🔐 Authentication Flow

### Login Page
```typescript
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      router.push('/');
    } else {
      alert('登入失敗：' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          營養書讀書會
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="電子郵件"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 🚀 Getting Started Commands

### 1. Create Next.js Project
```bash
cd /Users/andywong/Library/CloudStorage/SynologyDrive-home/1_Project/nutrition_book_reader_club

npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

### 2. Install Dependencies
```bash
cd frontend

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Google Gemini (optional, for food recognition)
npm install @google/generative-ai

# UI utilities
npm install clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Dev dependencies
npm install -D @types/node
```

### 3. Setup Environment Variables
```bash
# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://bnkgdcbwkcervkmpuhqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_key_here
EOF
```

### 4. Start Development
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📅 3-Week Implementation Timeline

### Week 1: Foundation (Days 1-7)
- ✅ Day 1: Project setup, dependencies, folder structure
- ✅ Day 2: Supabase client setup, types generation
- ✅ Day 3: Authentication pages (login/register)
- ✅ Day 4: Dashboard layout with navigation
- ✅ Day 5: Content display page (daily reading)
- ✅ Day 6: Content list view (all 21 days)
- ✅ Day 7: Basic responsive design

### Week 2: Core Features (Days 8-14)
- ✅ Day 8: Quiz interface and answer submission
- ✅ Day 9: Quiz results and progress tracking
- ✅ Day 10: Text sharing form with daily validation
- ✅ Day 11: Group feed display
- ✅ Day 12: Real-time chat (Supabase Realtime)
- ✅ Day 13: Food photo upload UI
- ✅ Day 14: Gemini Vision integration (food recognition)

### Week 3: Polish & Launch (Days 15-21)
- ✅ Day 15: Food log display and editing
- ✅ Day 16: Progress dashboard
- ✅ Day 17: Group management pages
- ✅ Day 18: PWA configuration (manifest, service worker)
- ✅ Day 19: Mobile responsive polish
- ✅ Day 20: Testing with real data
- ✅ Day 21: Deploy to Vercel, beta testing

---

## 🎯 Priority Features for MVP

### Must Have (Week 1-2):
1. ✅ Authentication (login/register)
2. ✅ Daily content display
3. ✅ Quiz with answer tracking
4. ✅ Text sharing (once daily)
5. ✅ Group chat

### Should Have (Week 2-3):
6. ✅ Food photo upload + AI recognition
7. ✅ Group feed (all activities)
8. ✅ Basic progress tracking

### Nice to Have (Week 3 or Phase 2):
9. ⏳ Push notifications
10. ⏳ 7am automated content unlock
11. ⏳ Leader announcement system
12. ⏳ Advanced analytics

---

## 🔧 Configuration Files

### Next.js Config
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'bnkgdcbwkcervkmpuhqm.supabase.co', // Supabase Storage
    ],
  },
  // PWA support (add next-pwa later)
};

module.exports = nextConfig;
```

### TypeScript Config
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 📊 State Management Strategy

**Recommendation:** Use React Context + Hooks (no Redux needed for this scale)

### Auth Context
```typescript
// app/providers.tsx
'use client';

import { createContext, useContext } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within Providers');
  return context;
};
```

---

## 🎨 Component Examples

### Content Card
```typescript
// components/content/ContentCard.tsx
import type { DailyContent } from '@/lib/types/database';

interface Props {
  content: DailyContent;
}

export default function ContentCard({ content }: Props) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-2">
        第 {content.day_number} 天：{content.title}
      </h2>
      <div className="prose prose-sm max-w-none">
        {/* Render markdown content */}
        {content.content}
      </div>
    </div>
  );
}
```

### Quiz Question
```typescript
// components/quiz/QuestionItem.tsx
interface Props {
  question: QuizQuestion;
  index: number;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  showResults?: boolean;
}

export default function QuestionItem({
  question,
  index,
  selectedAnswer,
  onAnswerSelect,
  showResults,
}: Props) {
  return (
    <div className="card space-y-4">
      <h3 className="font-semibold">
        {index + 1}. {question.question}
      </h3>
      <div className="space-y-2">
        {Object.entries(question.options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => onAnswerSelect(key)}
            className={`w-full text-left p-3 rounded-lg border ${
              selectedAnswer === key
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${
              showResults && key === question.correct_answer
                ? 'bg-green-100 border-green-500'
                : ''
            }`}
          >
            {key}. {value}
          </button>
        ))}
      </div>
      {showResults && (
        <p className="text-sm text-gray-600">{question.explanation}</p>
      )}
    </div>
  );
}
```

---

## 🚢 Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Production deployment
vercel --prod
```

### Environment Variables in Vercel
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`

---

## ✅ Ready to Start!

**Next command:**
```bash
cd /Users/andywong/Library/CloudStorage/SynologyDrive-home/1_Project/nutrition_book_reader_club

npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Then tell me: "Let's start building!" and we'll create the folder structure and core files step by step. 🚀


