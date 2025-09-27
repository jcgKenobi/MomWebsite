# 🚀 GitHub Pages Deployment Guide

## Quick Setup for GitHub Pages

### Step 1: Push to GitHub
```bash
# If not already a git repository
git init
git add .
git commit -m "Initial commit: Anniversary website with Wordle Bean Edition"

# Add your GitHub repository as remote
git remote add origin https://github.com/[YOUR-USERNAME]/[YOUR-REPO-NAME].git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **"Deploy from a branch"**
5. Select branch: **main** and folder: **/ (root)**
6. Click **Save**

### Step 3: Access Your Site
Your site will be available at:
```
https://[YOUR-USERNAME].github.io/[YOUR-REPO-NAME]/
```

## 📱 Testing Before Deployment

### Local Testing
1. Open `index.html` in your browser
2. Test all games and navigation
3. Play Wordle: Bean Edition to verify statistics work
4. Test on mobile by using browser dev tools or your phone

### Pre-deployment Checklist
- ✅ All links work correctly
- ✅ Wordle game loads and saves statistics  
- ✅ Mobile responsiveness works
- ✅ All images/assets load properly
- ✅ Turkish characters display correctly

## 🔧 Troubleshooting

### Common Issues

**"Page not found" error:**
- Make sure `index.html` is in the root directory
- Check that GitHub Pages is enabled in Settings

**Wordle statistics not saving:**
- This is normal behavior - localStorage works once deployed
- Statistics will persist for each user's browser

**Links broken on GitHub Pages:**
- Use relative paths only (no `file://` or absolute paths)
- Ensure file names match exactly (case-sensitive)

**Mobile layout issues:**
- Test using browser developer tools
- The site is already optimized for mobile

## 🎨 Customization Tips

### Adding Your Own Words
Edit `WorldeForkImproved.html` around line 250:
```javascript
const WORD_BANKS = {
    BEAN: ["YOUR", "WORDS", "HERE"],
    US: ["RELATIONSHIP", "WORDS"],
    ENVIRONMENT: ["NATURE", "WORDS"]
};
```

### Changing Colors/Styling
The site uses Tailwind CSS classes. Common customizations:
- Background colors: `bg-blue-500`, `bg-green-500`, etc.
- Text colors: `text-red-600`, `text-purple-700`, etc.
- Hover effects: `hover:bg-blue-600`, `hover:scale-105`, etc.

## 📊 Analytics (Optional)

To track visitors, add Google Analytics:
1. Get a Google Analytics tracking ID
2. Add the tracking code to the `<head>` section of both HTML files

## 🔒 Making Repository Private

If you want to keep the repository private but still use GitHub Pages:
1. Go to repository Settings
2. Scroll to "Danger Zone"
3. Click "Change repository visibility"
4. Select "Private"

**Note:** Private repositories require GitHub Pro for GitHub Pages.

## 🎉 You're Done!

Your anniversary website is now live! Share the link with Bean and enjoy watching her play the personalized Wordle game and explore all the other features you've created.

Remember: The statistics will be unique to each device/browser, so Bean's progress on her phone will be separate from her computer.
