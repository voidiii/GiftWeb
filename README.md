# Gift Wishlist Website

A beautiful Pinterest/Rednote-style gift wishlist website where you can upload pictures of gifts you want with descriptions and comments.

## Features

- Masonry grid layout (like Pinterest/Rednote)
- Click any gift card to see it in full-page modal view
- Upload gift images with descriptions
- Add comments to each gift
- Delete gifts
- All data saved locally in browser (localStorage)
- Fully responsive design
- **Progressive Web App (PWA)** - Install on iPhone/Android home screen!
- **Optimized for mobile** - Smooth touch interactions and gestures
- **Works offline** - Service worker caches the app
- **iOS Safari support** - Full-screen mode when installed

## Local Testing

Simply open `index.html` in your web browser. The website will work completely offline!

## Deploy to GitHub Pages (FREE Hosting)

Follow these steps to deploy your website online for free:

### 1. Create a GitHub Account
- Go to https://github.com and sign up if you don't have an account

### 2. Create a New Repository
- Click the "+" icon in the top right
- Select "New repository"
- Name it something like "gift-wishlist" or "my-wishlist"
- Make it **Public**
- Click "Create repository"

### 3. Generate App Icons
Before uploading, you need to generate the app icons:
- Open `generate-icons.html` in your browser
- Click "Generate Icons" button
- All icon files will download to your Downloads folder
- Move all `icon-*.png` files to your project folder

### 4. Upload Files
- Click "uploading an existing file"
- Drag and drop these files:
  - `index.html`
  - `styles.css`
  - `script.js`
  - `manifest.json`
  - `sw.js`
  - All `icon-*.png` files (13 files)
  - `README.md` (optional)
- Click "Commit changes"

### 5. Enable GitHub Pages
- Go to your repository Settings
- Scroll down to "Pages" in the left sidebar
- Under "Source", select "main" branch
- Click "Save"
- Wait 1-2 minutes for deployment

### 6. Access Your Website
Your website will be available at:
```
https://[your-username].github.io/[repository-name]/
```

For example: `https://johndoe.github.io/gift-wishlist/`

## Installing as an App on iPhone

Once deployed to GitHub Pages, you can install it as a home screen app:

1. Open the website in **Safari** on your iPhone
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "Gift Wishlist" or whatever you prefer
5. Tap **"Add"**
6. The app icon will appear on your home screen!

Now you can open it like a native app - it will run in full-screen mode without the Safari browser UI!

## Installing as an App on Android

1. Open the website in **Chrome** on your Android phone
2. Tap the **menu** (three dots)
3. Tap **"Add to Home screen"** or **"Install app"**
4. Confirm the installation
5. The app will be added to your home screen!

## Using the Website

1. **Add a Gift**: Click the "+ Add Gift" button, upload an image, add a description, and submit
2. **View Gift Details**: Click any gift card to see it in full-screen modal view
3. **Add Comments**: In the modal view, type a comment and click "Post"
4. **Delete a Gift**: Open the gift modal and click the "Delete" button

## Notes

- All data is stored in your browser's localStorage
- Data persists across sessions but is local to your browser
- If you clear browser data, gifts will be lost
- Each browser/device will have its own separate data

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera

Enjoy your gift wishlist!
