# Meditation App - Development Plan & Progress Tracker

**Product Name:** TBD – Meditation App  
**Owner:** Levan  
**PRD Version:** 1.2  
**Last Updated:** October 20, 2025

---

## 🎯 Vision

Build a meditation app centered on 3/9-based timing, guided courses, breathing exercises, and personal gamification—without social comparison. Support teachers creating content and super admin oversight.

---

## 📊 Overall Progress: 5%

- ✅ **Completed:** 1 item
- 🚧 **In Progress:** 0 items
- ⏳ **Not Started:** 50+ items

---

## Phase 0: Foundation (CURRENT PHASE)

### ✅ Completed
- [x] Design system (colors, cosmic theme, animations)
- [x] Landing page with vision
- [x] Basic timer UI shell
- [x] Backend infrastructure (Cloud enabled)

### 🚧 In Progress
- [ ] None currently

### ⏳ Next Up
- [ ] Authentication system
- [ ] Database schema design
- [ ] User roles setup

---

## Phase 1: Authentication & User Management

**Goal:** Enable users to sign up, log in, and manage profiles with role-based access.

### Database Tables Needed
- [ ] `profiles` - User profile data
- [ ] `user_roles` - Role assignments (End User, Teacher, Super Admin)
- [ ] RLS policies for all tables

### Features
- [ ] Sign up / Login pages
- [ ] Email/password authentication
- [ ] Auto-confirm email for development
- [ ] User profile page structure
- [ ] Role-based routing/access

**Estimated Completion:** TBD

---

## Phase 2: Meditation Timer (Complete)

**Goal:** Fully functional 3/9-based meditation timer with all tracking.

### Core Features
- [ ] Custom duration input (any minutes)
- [ ] Interval selection (3/6/9 min)
- [ ] Preset buttons (9/18/27 lengths + 3/6/9 intervals)
- [ ] 9→0 second countdown before start
- [ ] Main timer display (circular progress)
- [ ] Pause/Resume functionality
- [ ] Session state tracking

### Sound System
- [ ] Sound library table in database
- [ ] Upload/manage sounds (admin)
- [ ] Select sounds for: start, interval, end
- [ ] Sound preview
- [ ] Volume controls
- [ ] Vibration toggle

### Tracking & Data
- [ ] `meditation_sessions` table
- [ ] Track: started, paused, resumed, abandoned, completed
- [ ] Minute-level precision
- [ ] Link to user profile
- [ ] Link to streak/goal system

**Estimated Completion:** TBD

---

## Phase 3: Breathing Exercises

**Goal:** Guided breathing patterns with animation and tracking.

### Database
- [ ] `breathing_exercises` table
- [ ] `breathing_presets` table
- [ ] `breathing_sessions` table (tracking)

### Features
- [ ] Preset patterns (3-4-3, 4-4-2, 4-7-8, 7-7-8, box breathing)
- [ ] Custom pattern builder
- [ ] Animated circle (expand/contract)
- [ ] Optional tick sounds
- [ ] Round counter
- [ ] Duration tracker
- [ ] Purpose descriptions for each pattern

**Estimated Completion:** TBD

---

## Phase 4: Guided Content System

**Goal:** Teachers can upload courses and meditations; users can access them.

### Database Schema
- [ ] `teachers` table
- [ ] `courses` table
- [ ] `course_sessions` table (lessons/audio files)
- [ ] `standalone_meditations` table
- [ ] `categories` table
- [ ] `tags` table
- [ ] `course_enrollments` table
- [ ] `course_progress` table
- [ ] Storage buckets for audio/video

### Teacher Dashboard
- [ ] Teacher registration/approval flow
- [ ] Upload audio (required)
- [ ] Upload intro video (optional)
- [ ] Assign categories/tags
- [ ] Define scheduling mode:
  - [ ] Linear (daily unlock)
  - [ ] Day-part windows
  - [ ] Freeform
  - [ ] Challenge mode
- [ ] Publish/unpublish courses
- [ ] View analytics dashboard

### User Experience
- [ ] Browse courses by category/tag
- [ ] Enroll in courses
- [ ] Course detail page
- [ ] Session player (audio)
- [ ] Progress tracking (per-session, minute-level)
- [ ] Resume from last offset
- [ ] Standalone meditation browser
- [ ] Filter by teacher/theme/duration

**Estimated Completion:** TBD

---

## Phase 5: Tracking & Gamification

**Goal:** Personal progress tracking with streaks, badges, and goals.

### Database
- [ ] `practice_plans` table
- [ ] `goals` table
- [ ] `streaks` table
- [ ] `badges` table
- [ ] `user_badges` table
- [ ] `activity_history` table (aggregated view)

### Features
- [ ] Set practice plan (once/twice daily, custom)
- [ ] Weekly target (minutes or sessions)
- [ ] Streak counter ("Strikes")
- [ ] Grace rules (skip allowance)
- [ ] Badge system
- [ ] Calendar heatmap
- [ ] Visual analytics (charts)
- [ ] Adherence tracking (actual vs. plan)

**Estimated Completion:** TBD

---

## Phase 6: Token Economy & Monetization

**Goal:** Token-based access with free and premium tiers.

### Database
- [ ] `token_ledger` table
- [ ] `token_config` table (admin settings)
- [ ] `subscription_tiers` table
- [ ] `user_subscriptions` table
- [ ] `purchases` table

### Features
- [ ] Token balance display
- [ ] Token costs per activity (configurable by admin)
- [ ] Monthly allowance (Free vs Premium)
- [ ] Purchase tokens (in-app)
- [ ] Upgrade to Premium
- [ ] Transaction history
- [ ] Auto-debit on activity
- [ ] Admin controls (set costs, limits, promotions)

**Estimated Completion:** TBD

---

## Phase 7: Downloads & Offline Mode

**Goal:** Premium users can download and use content offline.

### Database
- [ ] `downloads` table
- [ ] `download_licenses` table

### Features
- [ ] Download button (Premium only)
- [ ] Encrypted file storage
- [ ] License validation
- [ ] Offline playback
- [ ] Token debit queue (sync on reconnect)
- [ ] Download management UI
- [ ] Expiry on Premium lapse

**Estimated Completion:** TBD

---

## Phase 8: Super Admin Panel

**Goal:** Central control for managing ecosystem.

### Features
- [ ] User management (view, edit, delete, suspend)
- [ ] Teacher approval/management
- [ ] Course moderation
- [ ] Category/tag management
- [ ] Sound pack uploads
- [ ] Breathing preset management
- [ ] Token configuration
- [ ] Pricing controls
- [ ] Audit log viewer
- [ ] Global analytics dashboard:
  - [ ] Total users/teachers/courses
  - [ ] Token flow
  - [ ] Retention metrics
  - [ ] Usage trends

**Estimated Completion:** TBD

---

## Phase 9: Notifications & Reminders

**Goal:** Contextual reminders based on plans and courses.

### Features
- [ ] Custom reminder setup (plan-based)
- [ ] Course schedule reminders
- [ ] Resume reminders (abandoned sessions)
- [ ] Local notification system
- [ ] Respect Do Not Disturb
- [ ] Notification preferences

**Estimated Completion:** TBD

---

## Phase 10: User Profile & History

**Goal:** Unified hub for all user data.

### Profile Sections
- [ ] Plan & Goals overview
- [ ] Token balance & ledger
- [ ] My Courses (enrolled, progress)
- [ ] Downloads manager
- [ ] Resume Queue
- [ ] History (filterable by date/type)
- [ ] Analytics & charts
- [ ] Badges & Streaks display
- [ ] Settings

**Estimated Completion:** TBD

---

## Phase 11: Polish & Optimization

### Performance
- [ ] Timer launch <0.5s
- [ ] Interval precision ±150ms
- [ ] Audio start <1.5s
- [ ] Page load <1s
- [ ] Image optimization
- [ ] Code splitting

### UX Refinement
- [ ] Loading states everywhere
- [ ] Error handling & recovery
- [ ] Empty states
- [ ] Onboarding flow
- [ ] Help/tutorial overlays
- [ ] Accessibility audit
- [ ] Mobile responsiveness

### Security
- [ ] RLS policy audit
- [ ] Input validation
- [ ] Rate limiting
- [ ] GDPR compliance (data export/delete)
- [ ] Secure file encryption

**Estimated Completion:** TBD

---

## 🚀 Deferred to Phase 2 (Post-MVP)

- [ ] Teacher revenue sharing
- [ ] In-app recording
- [ ] Multi-language support
- [ ] Expanded analytics
- [ ] Social features (optional)
- [ ] Mobile native apps (iOS/Android)
- [ ] Web app conversion

---

## 📝 Development Guidelines

### Before Starting Each Phase
1. ✅ Review database schema needs
2. ✅ Design component structure
3. ✅ Plan API/backend functions
4. ✅ Consider security (RLS policies)
5. ✅ Update this plan with progress

### After Completing Each Phase
1. ✅ Test all features thoroughly
2. ✅ Check security scan results
3. ✅ Update progress percentages
4. ✅ Document any technical decisions
5. ✅ Plan next phase priorities

---

## 🎯 Success Metrics (To Track Post-Launch)

- D7 Retention > 40%
- D30 Retention > 20%
- Avg sessions/user/week ≥ 5
- Avg course completion ≥ 60%
- Premium conversion ≥ 10%
- Avg streak length ≥ 7 days

---

## 📌 Current Sprint Focus

**Status:** Phase 0 (Foundation) → Moving to Phase 1 (Auth & Users)

**Next 3 Tasks:**
1. Design complete database schema for all phases
2. Implement authentication system
3. Set up user roles (End User, Teacher, Super Admin)

---

## 💡 Notes & Decisions

- Using Lovable Cloud for backend (Supabase under the hood)
- Design system uses HSL colors with cosmic purple/indigo theme
- 3/9 numerology guides timing and visual rhythm
- No social comparison—all gamification is personal
- Token economy is flexible and admin-configurable

---

**Track updates in this file as development progresses.**
