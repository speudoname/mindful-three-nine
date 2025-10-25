# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Web App (Already Working)
```bash
npm install
npm run dev
```
Visit: http://localhost:5173

### Mobile App (New!)
```bash
cd mobile
npm install
npm start
```

Scan QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

Download Expo Go:
- iOS: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

## ✅ What Works Right Now

### Web Application
- ✅ User authentication (sign up/sign in)
- ✅ Meditation timer with intervals
- ✅ Breathing exercises
- ✅ Course creation (teachers)
- ✅ Admin dashboard
- ✅ Progress tracking
- ✅ Token system

### Mobile Application
- ✅ User authentication
- ✅ Home dashboard with stats
- ✅ Navigation (5 tabs)
- ✅ User profile
- ✅ API integration
- 🔄 Content screens (ready for development)

### Database (Supabase)
- ✅ All tables created (25+)
- ✅ Performance indexes (35+)
- ✅ Mobile-optimized functions (10+)
- ✅ Row Level Security
- ✅ Authentication configured

## 📱 Mobile App Features

### Completed
1. **Authentication Flow**
   - Sign in screen
   - Sign up screen
   - Auto-redirect when logged in

2. **Home Dashboard**
   - User statistics
   - Streak counter
   - Total sessions & minutes
   - Token balance
   - Quick action buttons

3. **Profile Screen**
   - User info display
   - Settings menu
   - Sign out

4. **Navigation**
   - Tab bar with 5 sections
   - Protected routes
   - Smooth transitions

### Ready to Build
- Meditation timer
- Audio player
- Course browsing
- Progress charts
- Breathing animations

## 🎯 Next Steps

### Priority 1: Core Features
1. **Meditation Timer** (mobile/app/(tabs)/meditation.tsx)
   - Add timer controls
   - Implement interval sounds
   - Background audio support

2. **Course Browsing** (mobile/app/(tabs)/courses.tsx)
   - Fetch courses from API
   - Display course cards
   - Course detail screen

3. **Progress Screen** (mobile/app/(tabs)/progress.tsx)
   - Fetch user stats
   - Display charts
   - Show achievements

### Priority 2: Content
1. Upload sample meditation audio to Supabase Storage
2. Create starter courses in admin dashboard
3. Add meditation categories

### Priority 3: Polish
1. Add app icon and splash screen
2. Implement offline downloads
3. Set up push notifications

## 📦 What's Included

### Web App (`/src`)
```
src/
├── components/        # UI components
├── hooks/            # React hooks (useAuth, etc.)
├── pages/            # All screens
├── lib/api/          # API functions
└── integrations/     # Supabase client
```

### Mobile App (`/mobile`)
```
mobile/
├── app/              # Screens (Expo Router)
│   ├── (auth)/      # Sign in/up
│   └── (tabs)/      # Main app tabs
├── components/       # Shared components
├── hooks/           # useAuth
└── lib/             # Supabase & API
```

### Database (`/supabase`)
```
supabase/
└── migrations/      # All schema changes
```

## 🔑 Environment Setup

### Web (.env)
```bash
VITE_SUPABASE_URL=https://cplfjckfaprxrvbovarj.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-key>
```

### Mobile (mobile/.env)
```bash
EXPO_PUBLIC_SUPABASE_URL=https://cplfjckfaprxrvbovarj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-key>
```

**Get your keys from**: Supabase Dashboard → Project Settings → API

## 🛠 Development Commands

### Web
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Mobile
```bash
npm start        # Start Expo
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

## 📊 Database Functions (Ready to Use)

```typescript
// Get dashboard data
mobileApi.getDashboardSummary(userId)

// Get progress stats
mobileApi.getProgressStats(userId)

// Get user's courses
mobileApi.getUserCoursesWithProgress(userId)

// Browse courses
mobileApi.getCoursesPaginated(categoryId, pageSize, offset)

// Save meditation session
mobileApi.syncMeditationSession({
  userId,
  sessionType: 'timer',
  durationMinutes: 10,
  status: 'completed',
  startedAt: new Date().toISOString()
})
```

## 👥 User Roles

### Students (Mobile + Web)
- Meditation timer
- Course access
- Progress tracking
- Achievements

### Teachers (Web Only)
- Create courses
- Upload audio
- Manage content
- View analytics

### Admins (Web Only)
- User management
- Content moderation
- System settings
- Full access

## 🔒 Security

- ✅ Row Level Security active on all tables
- ✅ JWT authentication
- ✅ Secure token storage (mobile)
- ✅ Role-based access control
- ✅ Input validation

## 📚 Documentation

1. **MOBILE_APP_SETUP.md** - Complete mobile guide
2. **IMPLEMENTATION_SUMMARY.md** - Technical details
3. **GITHUB_SETUP.md** - Collaboration guide
4. **This file** - Quick reference

## ❓ Common Questions

### How do I test the mobile app?
1. Install Expo Go on your phone
2. Run `cd mobile && npm start`
3. Scan QR code
4. App loads instantly!

### How do I add a new feature?
1. Create React component
2. Add route if needed
3. Connect to API
4. Test and iterate

### How do I access the database?
- Supabase Dashboard: https://supabase.com/dashboard
- Or use the API functions in `mobile/lib/mobile-api.ts`

### How do I deploy?
- **Web**: Vercel, Netlify, or any static host
- **Mobile**: Use EAS Build (`eas build`)

### Can I use the mobile app on web?
Yes! Run `npm run web` in the mobile directory. It's fully compatible.

## 🎉 You're Ready!

Everything is set up and working:
- ✅ Database connected
- ✅ Authentication working
- ✅ Web app tested
- ✅ Mobile app structured
- ✅ API layer created

**Start building features and make something amazing!**

## 🆘 Need Help?

- Check the other .md files in this project
- Review Supabase docs: https://supabase.com/docs
- Check Expo docs: https://docs.expo.dev
- Mobile app logs: Run `npm start` and press 'j' for dev menu

---

**Built with:** React, React Native, Expo, Supabase, TypeScript, Tailwind CSS
