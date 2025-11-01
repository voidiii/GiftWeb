# Firebase Setup Guide

Follow these steps to set up Firebase for your Gift Wishlist app. This will enable cloud storage so both you and your girlfriend can see the wishlist from any device!

## Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name: `gift-wishlist` (or any name you like)
4. Click **Continue**
5. Disable Google Analytics (not needed) or leave it on if you want
6. Click **Create project**
7. Wait for the project to be created, then click **Continue**

## Step 2: Register Your Web App

1. In the Firebase console, click the **Web icon** (`</>`) to add a web app
2. Register app nickname: `Gift Wishlist Web`
3. **Do NOT** check "Also set up Firebase Hosting" (we're using GitHub Pages)
4. Click **Register app**
5. You'll see your Firebase configuration - **KEEP THIS PAGE OPEN!**

## Step 3: Copy Your Firebase Configuration

You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "gift-wishlist-xxxxx.firebaseapp.com",
  projectId: "gift-wishlist-xxxxx",
  storageBucket: "gift-wishlist-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

**Copy these values!** You'll need them in the next step.

## Step 4: Update firebase-config.js

1. Open `firebase-config.js` in your project folder
2. Replace the placeholder values with your actual Firebase config values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",              // Replace with your actual apiKey
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // Replace
    projectId: "YOUR_PROJECT_ID",        // Replace
    storageBucket: "YOUR_PROJECT_ID.appspot.com",   // Replace
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // Replace
    appId: "YOUR_APP_ID"                 // Replace
};
```

3. Save the file

## Step 5: Enable Firestore Database

1. In the Firebase console, click **Build** > **Firestore Database** in the left sidebar
2. Click **Create database**
3. Select **Start in production mode** (we'll set up rules next)
4. Click **Next**
5. Choose a location (pick one closest to you, e.g., `us-central` or `asia-northeast`)
6. Click **Enable**

## Step 6: Set Up Firestore Security Rules

1. In Firestore Database, click the **Rules** tab
2. Replace the default rules with these:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read and write to the gifts collection
    match /gifts/{giftId} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**

**Note:** These rules allow anyone with the link to read/write. For a private wishlist, you can add Firebase Authentication later.

## Step 7: Enable Firebase Storage

1. In the Firebase console, click **Build** > **Storage** in the left sidebar
2. Click **Get started**
3. Click **Next** (keep default security rules for now)
4. Click **Done**

## Step 8: Set Up Storage Security Rules

1. In Storage, click the **Rules** tab
2. Replace the default rules with these:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gifts/{imageId} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**

## Step 9: Test Locally (Optional)

Before deploying, you can test locally:

1. Open `index.html` in your browser
2. Try adding a gift
3. Check the browser console (F12) for any errors
4. If you see "Firebase initialized successfully!" - you're good!
5. Check Firebase Console > Firestore Database to see if the gift was added

## Step 10: Deploy to GitHub Pages

Follow the deployment steps in `SETUP.md` to deploy your app to GitHub Pages.

**IMPORTANT:** Make sure to upload `firebase-config.js` with your actual Firebase credentials!

## Files to Upload to GitHub

Make sure these files are uploaded:
- `index.html`
- `styles.css`
- `script.js`
- **`firebase-config.js`** (with your real Firebase config!)
- `manifest.json`
- `sw.js`
- All `icon-*.png` files

## How It Works Now

### Real-time Sync
- When your girlfriend adds a gift from her iPhone, you'll see it appear on your device instantly!
- When you add a comment, she'll see it right away
- All changes sync across all devices in real-time

### Cloud Storage
- Images are stored in Firebase Storage (1GB free storage)
- Gift data is stored in Firestore (1GB free database)
- No more lost data when clearing browser cache!

## Free Tier Limits

Firebase free tier ("Spark Plan") includes:
- **Storage:** 1 GB (thousands of images)
- **Downloads:** 10 GB/month
- **Firestore reads:** 50,000/day
- **Firestore writes:** 20,000/day

This is **more than enough** for a personal wishlist!

## Troubleshooting

### "Firebase: No Firebase App '[DEFAULT]' has been created"
- Make sure `firebase-config.js` is loaded before `script.js`
- Check that your Firebase config values are correct

### Images not uploading
- Check Firebase Console > Storage to see if images appear
- Check browser console for errors
- Make sure Storage rules are set correctly

### Gifts not appearing
- Check Firebase Console > Firestore Database to see if documents are created
- Check browser console for errors
- Make sure Firestore rules are set correctly

### Still having issues?
- Open browser console (F12) and check for error messages
- Verify all Firebase config values are correct
- Make sure you published the security rules
- Try deleting and re-creating the Firebase project

## Making It More Secure (Optional)

If you want to make the wishlist private:

1. Go to Firebase Console > **Authentication**
2. Click **Get started**
3. Enable **Email/Password** authentication
4. Update Firestore and Storage rules to require authentication
5. Add login functionality to the app (requires code changes)

For now, the app works without authentication - anyone with the link can view/add gifts. If you want to keep it private, just don't share the URL publicly!

## Next Steps

Once Firebase is set up and working:
1. Both of you can access the wishlist from any device
2. Install it as a PWA on your phones (see README.md)
3. Start adding gifts!
4. Changes sync in real-time across all devices

Enjoy your cloud-synced gift wishlist! 🎁
