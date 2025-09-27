# Mom's Birthday Website 🎂❤️

A special birthday website with personalized games and content, featuring a custom **Wordle: Mom Edition** game.

## 🌟 Features

### 🎮 Games
- **[Wordle: Mom Edition](WorldeForkImproved.html)** - A fully customized Wordle game with:
  - 🇬🇧 English word bank (simple English words)
  - 🇹🇷 Turkish word bank (Turkish words)
  - 🌿 Nature word bank (Turkish nature words)
  - 📊 Complete statistics tracking
  - 🏆 Streak counting and achievements
  - 📱 Mobile-responsive design
  
- **Turkish Word Matching** - Match Turkish and English words
- **Connections** - Find groups of related items
- **Turkish Crossword** - Traditional crossword with Turkish clues

### 📸 Additional Sections
- Photo gallery
- Music playlist
- Special birthday message
- Surprise "Feeling Lucky" section

## 🚀 Live Demo

Visit the website: [Your GitHub Pages URL]

## 📁 File Structure

```
├── index.html                 # Main birthday website
├── WorldeForkImproved.html    # Advanced Wordle: Mom Edition game
├── enhanced-storage.js        # Local storage system for game statistics
├── stats-component.js         # Statistics visualization components
├── WordleFork.html           # Original simple Wordle (backup)
└── README.md                 # This file
```

## 🎯 Wordle: Mom Edition Highlights

### Game Features
- **3 Game Modes**: English words, Turkish words, nature words (Turkish), and random mix
- **Smart Word Selection**: Prevents immediate repeats
- **Turkish Character Support**: Full support for Ğ, Ü, Ş, İ, Ö, Ç
- **Proper Wordle Logic**: Accurate keyboard coloring and game mechanics

### Statistics & Progress
- **Game History**: Tracks last 100 games with full details
- **Daily Statistics**: Day-by-day performance tracking
- **Category Performance**: Individual stats for each word bank
- **Streak Tracking**: Current and best winning streaks
- **Guess Distribution**: Visual chart of solving patterns
- **Export/Import**: Backup and restore game data

### Technical Features
- **Persistent Storage**: All progress saved using localStorage
- **Mobile Optimized**: Works perfectly on phones and tablets
- **Performance Optimized**: React.memo and efficient rendering
- **No External Dependencies**: Runs entirely in the browser

## 🛠️ Technical Details

### Built With
- **React 18** - Frontend framework
- **Tailwind CSS** - Styling and responsive design
- **localStorage** - Client-side data persistence
- **Vanilla JavaScript** - Enhanced storage system

### Browser Compatibility
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Works offline after initial load

## 💝 Personal Touch

This website was created as a special birthday gift with:
- Personalized word banks in English and Turkish
- Custom statistics to track progress over time
- Beautiful, modern design with smooth animations
- Mobile-first approach for playing anywhere, anytime

## 🚀 Deployment

### GitHub Pages Setup
1. Push all files to your GitHub repository
2. Go to repository Settings → Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Your site will be available at: `https://[username].github.io/[repository-name]`

### Local Development
Simply open `index.html` in a web browser. All features work locally without a server.

## 📱 Mobile Experience

The website is fully optimized for mobile devices with:
- Touch-friendly game interfaces
- Responsive layouts that adapt to screen size
- Optimized keyboard for Turkish characters
- Smooth animations that work well on mobile

## 🎨 Customization

To customize the word banks in Wordle: Mom Edition:
1. Edit the `WORD_BANKS` object in `WorldeForkImproved.html`
2. Add or modify words in each category
3. English words should be exactly 5 characters
4. Turkish words should be exactly 5 characters in Turkish

## 📊 Statistics Features

The enhanced statistics system tracks:
- **Overall Performance**: Win rate, average guesses, total games
- **Streaks**: Current winning streak and best streak ever
- **Category Breakdown**: Performance in each word bank
- **Recent Games**: Visual grid of last 10 games with outcomes
- **Guess Distribution**: Chart showing how many guesses typically needed

---

Made with ❤️ for an amazing mom. Happy Birthday! 🎉
