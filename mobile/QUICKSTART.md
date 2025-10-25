# 🚀 Run Your Mobile App in 2 Minutes

## Option 1: Test on Your Phone (EASIEST - No Setup!)

### Step 1: Install Expo Go
- **iOS**: Open App Store, search "Expo Go", install
- **Android**: Open Play Store, search "Expo Go", install

### Step 2: Start the App
Open your terminal and run:
```bash
cd /tmp/cc-agent/59213160/project/mobile
npm install
npm start
```

### Step 3: Scan QR Code
- A QR code will appear in your terminal
- **iOS**: Open Camera app, point at QR code
- **Android**: Open Expo Go app, tap "Scan QR code"

**Done!** Your app loads on your phone in seconds.

---

## Option 2: Test in Web Browser

```bash
cd /tmp/cc-agent/59213160/project/mobile
npm install
npm start
```

Then press `w` when prompted (or visit http://localhost:8081)

---

## Option 3: iOS Simulator (Mac Only)

```bash
cd /tmp/cc-agent/59213160/project/mobile
npm install
npm run ios
```

---

## Option 4: Android Emulator

1. Install Android Studio and set up an emulator
2. Start your emulator
3. Run:
```bash
cd /tmp/cc-agent/59213160/project/mobile
npm install
npm run android
```

---

## 🎯 What You'll See

1. **Sign In Screen** - Create an account or sign in
2. **Home Dashboard** - Your meditation stats, streak, tokens
3. **5 Tabs**: Home, Courses, Meditation, Progress, Profile

---

## ✅ Already Connected

- ✅ Supabase authentication
- ✅ Database access
- ✅ All your meditation data

---

## 🐛 Troubleshooting

**"npm: command not found"**
- Install Node.js from nodejs.org

**"expo: command not found"**
```bash
npm install
```

**QR code doesn't scan**
- Make sure phone and computer are on same WiFi
- Try pressing `w` to open in browser instead

**Port already in use**
```bash
npm start -- --port 8082
```
