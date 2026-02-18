# Emotion Wheel - Emotional Wellness Tracker

A cross-platform mobile and web application that helps users identify, understand, and manage their emotions through an interactive emotion wheel interface, powered by AI-driven coping strategies.

## 🚀 Features

- **Interactive 3-Tier Emotion Wheel**: Navigate from broad emotions (Happy, Sad, Angry) to specific feelings (Ecstatic, Abandoned, Furious)
- **AI-Powered Coping Strategies**: Claude AI generates personalized coping strategies for each emotion
- **Secure Authentication**: Email/password login with Supabase
- **Emotion Logging**: Track emotions with timestamps for historical analysis
- **Responsive Design**: Works on web, iOS (via Capacitor), and Android
- **Offline Support**: Queue emotion logs when offline, sync when back online
- **Beautiful UI**: Smooth animations and intuitive interface with Framer Motion

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)
- Anthropic API key (for Claude AI)

## 🔧 Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 3. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Create the following tables with the schema from the PRD:
   - `users` - User profiles
   - `emotions` - Emotion hierarchy data
   - `emotion_logs` - User emotion entries
   - `coping_strategies` - Pre-generated strategies cache
   - `user_preferences` - User settings (future)

3. Run the migrations:
   ```sql
   -- Run the SQL from the PRD section 4.3 in Supabase SQL Editor
   ```

4. Enable Authentication:
   - Go to Authentication > Providers
   - Enable Email/Password provider
   - Configure any social providers you want

### 4. Setup Row Level Security (RLS)

In Supabase SQL Editor:

```sql
-- Enable RLS on emotion_logs
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;

-- Users can only read their own emotion logs
CREATE POLICY "Users can view own logs"
ON emotion_logs FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can create own logs"
ON emotion_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own logs
CREATE POLICY "Users can update own logs"
ON emotion_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own logs
CREATE POLICY "Users can delete own logs"
ON emotion_logs FOR DELETE
USING (auth.uid() = user_id);
```

### 5. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add it to `.env.local`

## 🏃 Running the App

### Development

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📱 Mobile Development

### Setup Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npx cap init

# Add platforms
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

### Build and Deploy to Mobile

```bash
# Build web app
npm run build

# Sync with native projects
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio
npx cap open android
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Auth/              # Authentication screens
│   ├── EmotionWheel/      # Main emotion wheel component
│   ├── EmotionModal/      # Emotion detail & coping strategies
│   └── ui/                # Reusable UI components
├── hooks/
│   ├── useAuth.ts         # Authentication state
│   └── useEmotionLog.ts   # Emotion logging logic
├── services/
│   ├── supabase.ts        # Supabase client
│   └── anthropic.ts       # Claude AI integration
├── store/
│   └── useEmotionStore.ts # Zustand state management
├── types/
│   └── emotion.types.ts   # TypeScript interfaces
├── utils/
│   ├── constants.ts       # Emotion wheel data & constants
│   └── helpers.ts         # Utility functions
└── App.tsx                # Main component
```

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **CSS Modules** for component-specific styles
- **Framer Motion** for animations
- Color scheme based on emotion types

## 🔐 Security

- Environment variables for sensitive keys
- Supabase RLS for data protection
- HTTPS only in production
- Password hashing handled by Supabase
- CORS configured properly

## 📊 State Management

- **Zustand** for global emotion state
- **React hooks** for local component state
- **Supabase** for persistent storage

## 🤖 AI Integration

- **Claude 3.5 Sonnet** for coping strategy generation
- Structured prompts for consistent quality
- Error handling with fallback strategies
- Response caching for performance (future)

## 🧪 Testing

Testing setup (to be implemented):

```bash
npm run type-check    # TypeScript type checking
npm install --save-dev vitest @testing-library/react
```

## 📈 Analytics (Future)

Track key metrics:
- Active users
- Emotions logged
- Feature engagement
- User retention

## 🚀 Deployment

### Deploy Web App to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Deploy to App Stores

1. **iOS App Store**: Use Xcode and App Store Connect
2. **Google Play**: Use Android Studio and Google Play Console

## 🐛 Troubleshooting

### Supabase Connection Issues

- Check `.env.local` has correct URL and keys
- Verify Supabase project is active
- Check network connectivity

### Claude API Errors

- Verify API key in `.env.local`
- Check API quota and billing
- Review API rate limits

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Documentation

- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com)
- [Framer Motion Docs](https://www.framer.com/motion)
- [Supabase Docs](https://supabase.com/docs)
- [Anthropic Docs](https://docs.anthropic.com)

## 📄 License

MIT License - feel free to use this for personal or commercial projects

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review environment variables
3. Check Supabase and API status pages
4. Create an issue with details

---

**Next Steps:**
- [ ] Set up Supabase backend
- [ ] Configure environment variables
- [ ] Run development server
- [ ] Test emotion wheel interactions
- [ ] Test AI strategy generation
- [ ] Setup mobile development environment
- [ ] Implement emotion logging
- [ ] Add analytics
