# 🚀 Quick Start Checklist - Emotion Wheel App

## ✅ Setup Checklist (Follow in Order)

### 1️⃣ Pre-Setup Requirements (5 min)
- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v9+ installed (`npm --version`)
- [ ] VS Code or editor open
- [ ] Windows PowerShell terminal ready
- [ ] Internet connection active
- [ ] GitHub account (for Supabase)

### 2️⃣ Dependencies Installation (10-15 min)
- [ ] Navigate to project: `cd "d:\My Projects\AI Projects\Emotion-wheel-app"`
- [ ] Run: `npm install --legacy-peer-deps`
- [ ] Wait for completion ⏳
- [ ] Verify: `npm list react` (should show React 18.2.0)

### 3️⃣ Environment Configuration (5 min)
- [ ] Copy template: `cp .env.local.example .env.local`
- [ ] Open `.env.local` in editor
- [ ] Note down three values to get in steps 4-5

### 4️⃣ Supabase Setup (10 min)

**Step 1: Create Project**
- [ ] Go to https://supabase.com
- [ ] Click "Start Your Project"
- [ ] Sign in with GitHub (or create account)
- [ ] Create new organization if needed
- [ ] Create new project (choose free tier)
- [ ] Wait for project to initialize ⏳

**Step 2: Get API Credentials**
- [ ] Go to: Settings (⚙️ icon) → API
- [ ] Copy "Project URL" → paste in `.env.local` as `VITE_SUPABASE_URL`
- [ ] Copy "anon public" key → paste in `.env.local` as `VITE_SUPABASE_ANON_KEY`
- [ ] Save `.env.local` file

**Step 3: Enable Authentication**
- [ ] In Supabase, go to: Authentication → Providers
- [ ] Click "Email"
- [ ] Click "Enable" (if not already enabled)
- [ ] No additional configuration needed - click outside to close

**Step 4: Create Database**
- [ ] Go to: SQL Editor
- [ ] Click "New Query"
- [ ] Paste the SQL from DATABASE_SETUP.sql file (see below)
- [ ] Click "Run"
- [ ] Should see: ✅ with no errors

### 5️⃣ Anthropic API Setup (5 min)
- [ ] Go to https://console.anthropic.com
- [ ] Click "Create Key" or "API Keys"
- [ ] Copy your new API key
- [ ] Paste in `.env.local` as `VITE_ANTHROPIC_API_KEY`
- [ ] Save `.env.local` file

**Note**: Your key format should look like: `sk_ant_xxxxxxxxxxxx`

### 6️⃣ Verify Configuration (2 min)
- [ ] Open `.env.local` file
- [ ] Check line 1: `VITE_SUPABASE_URL` - not empty ✓
- [ ] Check line 2: `VITE_SUPABASE_ANON_KEY` - not empty ✓
- [ ] Check line 3: `VITE_ANTHROPIC_API_KEY` - not empty ✓
- [ ] Check line 4: `VITE_API_TIMEOUT` - has value ✓
- [ ] Save file

### 7️⃣ Start Development Server (2 min)
- [ ] In terminal, run: `npm run dev`
- [ ] Wait for message: "Local: http://localhost:5173"
- [ ] Browser will auto-open, or manually open: http://localhost:5173 ✓

### 8️⃣ Test the App (5 min)

**Test 1: Sign Up**
- [ ] Enter email: `test@example.com`
- [ ] Enter password: `password123`
- [ ] Click "Create Account"
- [ ] Wait for redirect (may see loading spinner)
- [ ] Should see the emotion wheel screen

**Test 2: Try Emotion Wheel**
- [ ] Click on any colored segment in the wheel
- [ ] Should go to level 2 emotions
- [ ] Click on a level 2 emotion
- [ ] Should go to level 3 emotions
- [ ] Click on a level 3 emotion
- [ ] Modal should open with AI-generated strategies

**Test 3: View AI Strategies**
- [ ] Modal shows emotion name and description
- [ ] Below that are "Coping strategies"
- [ ] Should see "Generating personalized strategies..." briefly
- [ ] Then 4-5 actionable strategies appear
- [ ] Click "Log this emotion"
- [ ] Should see success message

**Test 4: Sign Out & Back In**
- [ ] Click your email in top right
- [ ] Click "Sign Out"
- [ ] Click "Sign In"
- [ ] Use same credentials
- [ ] Should be logged back in

---

## 📝 Troubleshooting Quick Fixes

### If npm install fails:
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

### If app won't start:
```bash
# Kill the process
Ctrl+C

# Try again
npm run dev
```

### If port 5173 is in use:
```bash
# Let Vite pick a new port - it will try 5174, 5175, etc.
# Or kill the process using the port (Windows):
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### If ".env.local not found":
```bash
# Create it manually in project root
# Add your three keys from steps 4-5
```

### If "Cannot find module" error:
```bash
# Reinstall
rm -rf node_modules
npm install --legacy-peer-deps
```

### If Supabase connection fails:
- Verify keys in `.env.local` match exactly
- Check Supabase project is still active
- Try refreshing the page
- Check Chrome DevTools Console (F12) for error details

### If Claude API returns error:
- Verify API key format starts with `sk_ant_`
- Check key hasn't been revoked in Anthropic console
- Verify you have API quota remaining

---

## 📊 Verification Checklist

After completing all steps, verify:

- [ ] `.env.local` file exists and has 3 values filled
- [ ] `npm run dev` starts without errors
- [ ] Browser opens to http://localhost:5173
- [ ] "How are you feeling?" page loads
- [ ] Sign up works with test email
- [ ] Emotion wheel is interactive (clickable)
- [ ] Modal opens with AI strategies
- [ ] Success message appears after "Log this emotion"
- [ ] Can sign out and sign back in

✅ **If all checked, you're ready to start development!**

---

## 🎯 Next Steps After Verification

1. **Explore the Code**:
   - Open `src/App.tsx` to see main flow
   - Open `src/components/` to see component structure
   - Open `src/services/` to see API integration

2. **Customize (Optional)**:
   - Add more emotions in `src/utils/constants.ts`
   - Modify colors in `tailwind.config.ts`
   - Change API model in `src/services/anthropic.ts`

3. **Make Your Enhancements**:
   - Add emotion history page
   - Add data visualizations
   - Add notification reminders
   - Add more UI polish

4. **Deploy**:
   - Create Vercel account (for web)
   - Setup GitHub repository
   - Deploy with: `vercel --prod`

---

## 📱 Mobile Setup (Optional - after web works)

Once web app is working:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
```

---

## 🆘 Getting Help

**If stuck:**
1. Read error messages carefully
2. Check SETUP_GUIDE.md
3. Verify all environment variables
4. Restart dev server
5. Clear browser cache (Ctrl+Shift+Delete)

**Common mistakes:**
- ❌ Running `npm install` without `--legacy-peer-deps`
- ❌ Wrong API keys in `.env.local`
- ❌ `.env.local` not saved after editing
- ❌ Supabase project not fully initialized
- ❌ Using old npm version (needs v9+)

---

## ⏱️ Time Estimate

| Step | Time |
|------|------|
| 1-3: Setup Requirements | 5 min |
| 4: npm install | 10-15 min |
| 5: Environment config | 5 min |
| 6: Supabase setup | 10 min |
| 7: Anthropic API | 5 min |
| 8: Start dev server | 2 min |
| 9: Test the app | 5 min |
| **Total** | **~50 minutes** |

---

## 🎉 Success!

Once finished, you'll have:
✅ Running web app with interactive emotion wheel
✅ AI-powered coping strategies
✅ Secure authentication
✅ Database persistence
✅ Beautiful, responsive UI
✅ Ready for mobile deployment

**Start**: `npm run dev`
**Stop**: `Ctrl+C` in terminal

Enjoy! 🚀✨
