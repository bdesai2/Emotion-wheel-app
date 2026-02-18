# Emotion Wheel - Setup & Getting Started Guide

## ✅ What's Been Created

Your complete Emotion Wheel project starter has been scaffolded with:

### Project Structure
```
emotion-wheel-app/
├── 📋 Configuration Files
│   ├── package.json           # Dependencies & scripts
│   ├── vite.config.ts         # Build configuration
│   ├── tsconfig.json          # TypeScript config
│   ├── tailwind.config.ts     # Tailwind CSS setup
│   ├── postcss.config.js      # PostCSS configuration
│   └── eslint.config.js       # Linting rules
│
├── 📁 Source Code (src/)
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # React entry point
│   ├── App.css                # Global styles
│   ├── index.css              # Tailwind directives
│   │
│   ├── components/
│   │   ├── Auth/
│   │   │   └── Auth.tsx                    # Login/signup screen
│   │   ├── EmotionWheel/
│   │   │   └── EmotionWheel.tsx           # Interactive 3-tier wheel
│   │   ├── EmotionModal/
│   │   │   └── EmotionModal.tsx           # Detail view + AI strategies
│   │   └── ui/
│   │       ├── Button.tsx                  # Reusable button component
│   │       └── LoadingSpinner.tsx          # Loading UI
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                      # Authentication logic
│   │   └── useEmotionLog.ts                # Emotion database operations
│   │
│   ├── services/
│   │   ├── supabase.ts                     # Supabase client setup
│   │   └── anthropic.ts                    # Claude AI integration
│   │
│   ├── store/
│   │   └── useEmotionStore.ts              # Zustand state management
│   │
│   ├── types/
│   │   └── emotion.types.ts                # TypeScript interfaces
│   │
│   └── utils/
│       ├── constants.ts                    # Emotion wheel data (6 tiers)
│       └── helpers.ts                      # Utility functions
│
├── 📝 Documentation
│   ├── README.md                 # Full project documentation
│   ├── .env.local.example        # Environment variables template
│   ├── SETUP_GUIDE.md           # This file
│   └── .gitignore               # Git configuration

└── 📦 HTML Entry
    └── index.html               # React DOM mount point
```

### Technology Stack
✅ **Frontend Framework**: React 18 + TypeScript
✅ **Build Tool**: Vite (ultra-fast bundler)
✅ **Styling**: Tailwind CSS + PostCSS
✅ **Animations**: Framer Motion
✅ **State Management**: Zustand
✅ **Backend**: Supabase (PostgreSQL + Auth)
✅ **AI Integration**: Anthropic Claude API
✅ **Mobile**: Capacitor (iOS/Android wrapper)

### Key Features Implemented
✅ 3-tier emotion wheel with 6 primary emotions × 3 levels = 54+ emotions
✅ Interactive SVG-based wheel with smooth animations
✅ AI-powered coping strategies (Claude Sonnet 4.5)
✅ Secure authentication (Supabase Email/Password)
✅ Emotion logging with timestamps
✅ State management with Zustand
✅ Fully typed with TypeScript
✅ Responsive design (mobile-first)
✅ Dark mode ready
✅ Error handling & loading states

## 🔧 Prerequisites

Before you start, ensure you have:

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js (v9+)
- **Git**: For version control ([Download](https://git-scm.com/))
- **A code editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

Check your versions:
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
```

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

Navigate to your project directory and install packages:

```bash
cd "d:\My Projects\AI Projects\Emotion-wheel-app"
npm install --legacy-peer-deps
```

**Note**: The `--legacy-peer-deps` flag may be needed due to dependency compatibility. This is safe for development.

### Step 2: Create Environment Variables

Copy the example file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` (you'll fill these in Steps 3-4):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ANTHROPIC_API_KEY=your-api-key
```

### Step 3: Setup Supabase Backend (10 minutes)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "Start Your Project"
   - Sign in with GitHub or email
   - Create new organization and project (free tier)

2. **Get API Credentials**:
   - Go to **Settings → API** (left sidebar)
   - Copy `Project URL` → `VITE_SUPABASE_URL`
   - Copy `anon public` key → `VITE_SUPABASE_ANON_KEY`

3. **Enable Authentication**:
   - Go to **Authentication → Providers**
   - Enable "Email" provider
   - (Optional) Enable Google/Apple for social login

4. **Create Database Tables**:
   - Go to **SQL Editor**
   - Click "New Query"
   - Paste this SQL:

```sql
-- Create users table (Supabase handles this automatically)
-- This is just for reference

-- Create emotions reference table
CREATE TABLE emotions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
  parent_id INTEGER REFERENCES emotions(id),
  description TEXT NOT NULL,
  color VARCHAR(7) NOT NULL,
  characteristics TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create emotion logs table
CREATE TABLE emotion_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion_id INTEGER REFERENCES emotions(id),
  tier_1_emotion_id INTEGER REFERENCES emotions(id),
  tier_2_emotion_id INTEGER REFERENCES emotions(id),
  tier_3_emotion_id INTEGER REFERENCES emotions(id),
  notes TEXT,
  logged_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create coping strategies cache table
CREATE TABLE coping_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emotion_id INTEGER REFERENCES emotions(id),
  strategy_text TEXT NOT NULL,
  generated_by VARCHAR(50) DEFAULT 'ai',
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emotion_logs
CREATE POLICY "Users can view own logs"
ON emotion_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own logs"
ON emotion_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
ON emotion_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
ON emotion_logs FOR DELETE
USING (auth.uid() = user_id);

-- Insert the 6 primary emotions (tier 1)
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Happy', 1, NULL, 'A feeling of pleasure and contentment', '#FFD700', ARRAY['Smiling', 'Laughter', 'Positive energy']),
('Sad', 1, NULL, 'A feeling of sorrow or unhappiness', '#4A90E2', ARRAY['Low energy', 'Withdrawal', 'Heaviness']),
('Angry', 1, NULL, 'A strong feeling of displeasure', '#FF6B6B', ARRAY['Tension', 'Irritability', 'Hot energy']),
('Fearful', 1, NULL, 'A feeling of anxiety or dread', '#9B59B6', ARRAY['Tension', 'Worry', 'Hypervigilance']),
('Surprised', 1, NULL, 'Feeling suddenly caught off guard', '#F39C12', ARRAY['Sudden', 'Alert', 'Uncertain']),
('Disgusted', 1, NULL, 'A strong dislike or aversion', '#27AE60', ARRAY['Repulsion', 'Rejection', 'Aversion']);
```

   - Click "Run"

5. **Verify Tables Created**:
   - Go to **Table Editor**
   - You should see: `emotions`, `emotion_logs`, `coping_strategies`

### Step 4: Get Anthropic API Key (2 minutes)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click "Create Key" (or "Generate Key")
3. Copy the API key
4. Add to `.env.local`: 
   ```env
   VITE_ANTHROPIC_API_KEY=sk_ant_xxxxxxxxxxxx
   ```

5. **Save your `.env.local` file** (important!)

### Step 5: Start Development Server

```bash
npm run dev
```

The app will automatically open at `http://localhost:5173`

## 🎯 First Test

1. **Sign Up**:
   - Enter any email: `test@example.com`
   - Enter password: `password123`
   - Click "Create Account"

2. **Test Emotion Wheel**:
   - Click on any emotion in the wheel
   - Click on a sub-emotion
   - Click on a specific feeling

3. **View AI Strategies**:
   - A modal appears with coping strategies
   - These are generated by Claude AI in real-time!

4. **Log Emotion**:
   - Click "Log this emotion"
   - You should see success message

## 📦 Available npm Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🔍 Key Files to Understand

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main component - orchestrates auth, wheel, modal |
| `src/components/EmotionWheel/EmotionWheel.tsx` | Interactive wheel SVG component |
| `src/components/EmotionModal/EmotionModal.tsx` | Shows emotion details + AI strategies |
| `src/services/anthropic.ts` | Claude AI integration |
| `src/services/supabase.ts` | Database & auth setup |
| `src/store/useEmotionStore.ts` | Global state management |
| `src/utils/constants.ts` | 54 emotions in 3-tier hierarchy |

## 🐛 Troubleshooting

### npm install fails
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps

# Or clear cache
npm cache clean --force
npm install --legacy-peer-deps
```

### "Cannot find module" errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install --legacy-peer-deps
npm run build
```

### Supabase connection fails
- Check `.env.local` has correct URL and keys
- Verify project is active in Supabase dashboard
- Check network connectivity

### Claude API returns 401 error
- Verify API key in Anthropic console
- Check `.env.local` has correct key format (`sk_ant_...`)
- Ensure key hasn't been revoked

### "localhost:5173 refused to connect"
```bash
# Kill any process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Then restart:
npm run dev
```

## 📚 Next Steps

1. **Customize Emotions** (optional):
   - Edit `src/utils/constants.ts` to add/modify emotions
   - Emotions automatically populate the wheel

2. **Add Personal Coping Strategies**:
   - Insert into `coping_strategies` table in Supabase
   - App will use these as fallback/cache

3. **Setup Mobile (Capacitor)**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   npm run build
   npx cap add ios
   npx cap add android
   ```

4. **Deploy to Web (Vercel)**:
   ```bash
   npm install -g vercel
   vercel login
   npm run build
   vercel --prod
   ```

5. **Submit to App Stores**:
   - iOS: Use Xcode + App Store Connect
   - Android: Use Android Studio + Google Play Console

## 📖 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Supabase Docs](https://supabase.com/docs)
- [Anthropic API](https://docs.anthropic.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💡 Tips

- **Hot Reload**: Changes to code automatically reload in browser
- **Type Safety**: Use TypeScript for better IDE suggestions
- **DevTools**: Install React DevTools browser extension
- **Styling**: Use Tailwind classes - no CSS files needed usually
- **Components**: Break UI into reusable components

## 🎉 You're All Set!

Your Emotion Wheel project is ready to run. The complete starter includes:
- ✅ All components scaffolded
- ✅ Type definitions done
- ✅ State management configured
- ✅ AI integration ready
- ✅ Database schema provided
- ✅ Error handling included

**Next: Run `npm install --legacy-peer-deps` then `npm run dev`**

Happy coding! 🚀
