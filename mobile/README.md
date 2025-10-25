# Meditation Mobile App

React Native mobile application for meditation and wellness practices - student-focused features only.

## Features

- Meditation timer with background audio
- Guided meditation courses
- Breathing exercises
- Progress tracking
- Achievement system
- Offline support with sync
- Push notifications

## Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android)

## Setup

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://cplfjckfaprxrvbovarj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Development

Start the development server:
```bash
npm start
```

Run on specific platform:
```bash
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## Project Structure

```
mobile/
├── app/                 # App screens (Expo Router)
│   ├── (auth)/         # Authentication screens
│   ├── (tabs)/         # Main tab navigation
│   └── _layout.tsx     # Root layout
├── components/         # Reusable components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and API
│   ├── supabase.ts    # Supabase client
│   └── mobile-api.ts  # API functions
└── constants/         # App constants

```

## Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## Features Roadmap

- [x] Authentication with Supabase
- [x] Dashboard with user stats
- [x] Meditation timer
- [x] Course browsing
- [ ] Offline meditation downloads
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Background audio playback
- [ ] Widget support

## Notes

- Teacher and Admin features are web-only
- Mobile app focuses on student experience
- Offline support for core features
- Background audio requires proper permissions
