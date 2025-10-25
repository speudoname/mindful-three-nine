# GitHub & Supabase Integration Guide

## Overview
Your meditation app is now connected to Supabase with a fully functional mobile app architecture. This guide helps you understand the setup and continue development.

## Repository Structure

```
meditation-app/
├── Web Application (/)
│   ├── src/              # React web app
│   ├── public/           # Static assets
│   ├── supabase/         # Database migrations
│   └── package.json
│
└── Mobile Application (/mobile)
    ├── app/              # Expo Router screens
    ├── components/       # React Native components
    ├── hooks/            # React hooks
    ├── lib/              # Utilities & API
    └── package.json
```

## Supabase Connection

### Current Setup
- **Project URL**: `https://cplfjckfaprxrvbovarj.supabase.co`
- **Database**: PostgreSQL with full schema
- **Authentication**: Email/password enabled
- **Storage**: Ready for audio/video files
- **Migrations**: All applied successfully

### What's in Supabase

#### Database Tables (25+)
- User management (profiles, roles)
- Content (courses, meditations, sessions)
- Tracking (meditation sessions, breathing)
- Gamification (streaks, badges, goals)
- Monetization (tokens, purchases)
- Notifications

#### Functions (10+)
- Mobile-optimized queries
- Progress calculations
- Badge awarding
- Streak management
- Content purchases

#### Security
- Row Level Security on all tables
- Role-based access control
- Secure authentication

## GitHub Repository Setup

### If Syncing with Lovable
Your changes are automatically committed to GitHub when you work in Lovable. The mobile app is included in the repository.

### If Using Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd <repo-name>
```

2. **Install web dependencies**
```bash
npm install
```

3. **Install mobile dependencies**
```bash
cd mobile
npm install
cd ..
```

4. **Set up environment variables**

Create `.env` in root:
```bash
VITE_SUPABASE_URL=https://cplfjckfaprxrvbovarj.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

Create `mobile/.env`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://cplfjckfaprxrvbovarj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

5. **Run applications**
```bash
# Web app
npm run dev

# Mobile app (in another terminal)
cd mobile
npm start
```

## Team Collaboration

### For Developers Joining the Project

1. **Get Access**
   - GitHub repository access
   - Supabase project access (if needed)

2. **Environment Setup**
   - Clone repository
   - Install dependencies (web + mobile)
   - Get `.env` files from team lead
   - Verify build works

3. **Understand the Stack**
   - Web: React + TypeScript + Vite + Tailwind
   - Mobile: React Native + Expo + TypeScript
   - Backend: Supabase (PostgreSQL + Auth + Storage)
   - UI: shadcn/ui components

### Development Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
- Web: Edit files in `src/`
- Mobile: Edit files in `mobile/app/`
- Database: Add migrations in `supabase/migrations/`

3. **Test Locally**
```bash
# Test web
npm run build

# Test mobile
cd mobile && npm start
```

4. **Commit and Push**
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

5. **Create Pull Request**
- Describe changes
- Link related issues
- Request review

## Mobile App Development

### Quick Start
```bash
cd mobile
npm install
npm start
```

### Testing on Real Device
1. Install Expo Go app on your phone
2. Run `npm start` in mobile directory
3. Scan QR code with your phone
4. App loads instantly

### Building for Production
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Supabase Migrations

### Adding New Tables/Features

1. **Create Migration File**
```bash
# Naming: YYYYMMDDHHMMSS_description.sql
supabase/migrations/20251026100000_add_new_feature.sql
```

2. **Write SQL**
```sql
-- Description of changes

CREATE TABLE IF NOT EXISTS public.new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- columns
);

ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_name" ON public.new_table
  FOR SELECT USING (auth.uid() = user_id);
```

3. **Apply via Supabase Dashboard or CLI**

### Database Access

#### Supabase Dashboard
- URL: https://supabase.com/dashboard
- Navigate to your project
- Use SQL Editor, Table Editor, etc.

#### Local Development
```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref <your-project-ref>

# Pull remote changes
supabase db pull

# Apply local migrations
supabase db push
```

## CI/CD Considerations

### GitHub Actions (Suggested)

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on: [push, pull_request]

jobs:
  web-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build

  mobile-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd mobile && npm install
      - run: cd mobile && npm run lint
```

### Deployment

**Web App:**
- Vercel, Netlify, or any static host
- Build command: `npm run build`
- Output directory: `dist`

**Mobile App:**
- EAS Build for app stores
- OTA updates via Expo
- TestFlight (iOS) / Internal Testing (Android)

## Common Tasks

### Add New Mobile Screen
```bash
cd mobile/app
# Create new file: my-screen.tsx
```

### Add New API Function
```typescript
// In mobile/lib/mobile-api.ts or src/lib/api/mobile-api.ts
export const mobileApi = {
  async myNewFunction() {
    // Implementation
  }
}
```

### Update Database Schema
1. Create migration file
2. Write SQL changes
3. Test locally
4. Apply to production
5. Update TypeScript types if needed

## Troubleshooting

### Web App Won't Build
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Mobile App Won't Start
```bash
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

### Supabase Connection Issues
- Check environment variables
- Verify project is active in Supabase dashboard
- Check network/firewall settings
- Confirm RLS policies allow access

### Git Sync Issues
```bash
git fetch origin
git status
# Resolve conflicts if any
git pull
```

## Important Files

- **package.json** - Web dependencies
- **mobile/package.json** - Mobile dependencies
- **.env** - Web environment variables (not in git)
- **mobile/.env** - Mobile environment variables (not in git)
- **supabase/migrations/** - Database schema history
- **MOBILE_APP_SETUP.md** - Detailed mobile setup
- **IMPLEMENTATION_SUMMARY.md** - Technical overview

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **shadcn/ui**: https://ui.shadcn.com

## Project Status

✅ **Production Ready:**
- Web application
- Database schema
- Authentication
- Security policies

🔄 **In Development:**
- Mobile app features
- Content creation
- Audio playback
- Offline support

📋 **Planned:**
- Push notifications
- Background audio
- Download manager
- Advanced analytics

---

**Ready to develop!** The infrastructure is complete. Focus on building features that deliver value to your users.
