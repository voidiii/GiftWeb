# Quick Setup Guide

## Step 1: Generate Icons

1. Open `generate-icons.html` in your browser
2. Click "Generate Icons" button
3. 13 icon files will download automatically
4. Move all `icon-*.png` files from Downloads to this folder

## Step 2: Test Locally (Optional)

1. Open `index.html` in your browser
2. Try adding a gift to make sure everything works
3. Test on your phone by:
   - Finding your computer's local IP address
   - Making sure your phone is on the same WiFi
   - Opening `http://[your-ip-address]/path/to/index.html` on your phone

## Step 3: Deploy to GitHub Pages

### Create Repository
1. Go to https://github.com
2. Click "+ New repository"
3. Name: `gift-wishlist` (or any name you like)
4. Make it **Public**
5. Click "Create repository"

### Upload Files
Upload ALL these files:
- `index.html`
- `styles.css`
- `script.js`
- `manifest.json`
- `sw.js`
- `icon-16.png`
- `icon-32.png`
- `icon-72.png`
- `icon-96.png`
- `icon-120.png`
- `icon-128.png`
- `icon-144.png`
- `icon-152.png`
- `icon-167.png`
- `icon-180.png`
- `icon-192.png`
- `icon-384.png`
- `icon-512.png`

### Enable GitHub Pages
1. Go to repository Settings
2. Click "Pages" in left sidebar
3. Under "Source": select "main" branch
4. Click "Save"
5. Wait 1-2 minutes

### Your Website URL
```
https://[your-github-username].github.io/gift-wishlist/
```

## Step 4: Install on iPhone

1. Open the GitHub Pages URL in Safari on iPhone
2. Tap Share button (square with arrow up)
3. Tap "Add to Home Screen"
4. Tap "Add"
5. Done! Open from home screen

## Step 5: Start Using!

Your girlfriend can now:
- Take photos of things she wants
- Upload them to the app
- Add descriptions and notes
- View in a beautiful grid layout
- Everything saves automatically!

## Troubleshooting

**Icons not showing?**
- Make sure all icon files are in the same folder as index.html
- Check that icon files are named exactly like `icon-192.png`

**App not installing on iPhone?**
- Must use Safari browser (not Chrome)
- Must be deployed online (GitHub Pages), won't work with file://
- Try clearing Safari cache and refreshing

**Images not uploading?**
- Check file size (very large images may take time)
- Try a smaller image
- Make sure you're using a supported format (JPG, PNG, GIF, WebP)

**Data disappeared?**
- Clearing browser data will delete the wishlist
- Each device/browser has its own separate data
- Consider taking screenshots as backup of important items
