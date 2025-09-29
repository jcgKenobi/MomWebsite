# 📋 Architecture Migration Guide

## Overview
This guide documents the transition from the monolithic structure to a unified, modular architecture for Mom's Game Center.

## 🏗️ New Directory Structure

```
MomWebsite/
├── src/                          # All source code
│   ├── core/                     # Core framework
│   │   ├── App.js               # Main application controller
│   │   ├── GameRegistry.js      # Game plugin system
│   │   └── Router.js            # Client-side routing
│   │
│   ├── games/                   # Individual games
│   │   ├── wordle/              # Wordle game module
│   │   │   ├── index.js         # Game registration
│   │   │   ├── game-logic.js   # Core game mechanics
│   │   │   ├── wordBanks.js    # Word data
│   │   │   ├── WordleApp.js    # React app component
│   │   │   ├── WordleGame.js   # Game component
│   │   │   ├── WordleComponents.js # UI components
│   │   │   ├── Statistics.js   # Stats component
│   │   │   └── wordle.css      # Game-specific styles
│   │   │
│   │   ├── matching/            # Matching game
│   │   │   └── index.js
│   │   │
│   │   ├── connections/         # Connections game
│   │   │   └── index.js
│   │   │
│   │   └── crossword/           # Crossword game
│   │       └── index.js
│   │
│   └── shared/                  # Shared resources
│       ├── components/          # Reusable UI components
│       │   ├── Button.js
│       │   ├── Card.js
│       │   ├── Grid.js
│       │   └── Modal.js
│       │
│       ├── styles/              # Global styles
│       │   ├── design-tokens.css # CSS variables
│       │   └── components.css   # Component styles
│       │
│       └── utils/               # Utilities
│           ├── storage.js       # Storage system
│           ├── storage-hook.js  # React hook
│           └── analytics.js     # Analytics tracking
│
├── index.html                   # Original (legacy)
├── index-unified.html           # New unified architecture
├── WordleProduction.html        # Standalone Wordle
└── WordleRefactored.html        # Refactored Wordle
```

## 🔄 What Changed

### From Monolithic to Modular
- **Before**: All code in single HTML files (700+ lines each)
- **After**: Modular JavaScript files with clear separation of concerns

### Game Plugin System
- **Before**: Games hardcoded into HTML
- **After**: Games implement `GameInterface` and register with `GameRegistry`

### Unified Routing
- **Before**: Separate HTML files for each section
- **After**: Single-page application with client-side routing

### Shared Components
- **Before**: Duplicate UI code across files
- **After**: Reusable components in `src/shared/components/`

### Design Consistency
- **Before**: Inline styles, mixed approaches
- **After**: CSS variables (design tokens) for consistency

## 🚀 How to Use

### Access the New Architecture
1. Open `index-unified.html` in a browser
2. The app will automatically initialize with all games registered

### Access Legacy Versions
- `index.html` - Original birthday website
- `WordleProduction.html` - Standalone Wordle game
- `WordleRefactored.html` - Refactored Wordle (modular files)

## 🎮 Adding a New Game

### Step 1: Create Game Module
```javascript
// src/games/mygame/index.js
class MyGameModule extends GameInterface {
    constructor() {
        super({
            id: 'mygame',
            name: 'My Game',
            icon: '🎮',
            description: 'Description of my game',
            category: 'puzzle'
        });
    }
    
    render(container) {
        // Render your game
        container.innerHTML = `<div>My Game Content</div>`;
    }
    
    getStatistics() {
        // Return game stats
        return {
            gamesPlayed: 0,
            wins: 0
        };
    }
}

// Register the game
if (typeof gameRegistry !== 'undefined') {
    gameRegistry.register(new MyGameModule());
}
```

### Step 2: Load in HTML
```html
<!-- Add to index-unified.html -->
<script src="src/games/mygame/index.js"></script>
```

## 🔧 Key Components

### GameRegistry
Central registry for all games. Handles:
- Game registration
- Game loading/unloading
- State management
- Statistics aggregation

### Router
Client-side routing system. Features:
- No page refresh navigation
- History management
- Route parameters
- Before/after navigation hooks

### App Controller
Main application controller. Manages:
- Initialization
- Navigation menu
- Game loading
- Global settings
- Theme switching

## 📊 Storage System

### Unified Storage
```javascript
// All games use the same storage system
const storage = new WordleStorage();

// Save game data
storage.addGameResult({
    game: 'wordle',
    solution: 'HELLO',
    guesses: ['WORLD', 'HELLO'],
    isWin: true,
    mode: 'ENGLISH'
});

// Get statistics
const stats = storage.getStats();
```

## 🎨 Design Tokens

### Using CSS Variables
```css
/* Use design tokens for consistency */
.my-component {
    color: var(--color-primary-600);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
}
```

### Available Tokens
- **Colors**: Primary, secondary, success, warning, error, gray scale
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale (0-32)
- **Shadows**: Multiple shadow depths
- **Borders**: Radius scale
- **Transitions**: Consistent animations

## 🔌 Backward Compatibility

### Three Parallel Versions
1. **index.html**: Original implementation (preserved)
2. **WordleProduction.html**: Production Wordle (preserved)
3. **index-unified.html**: New architecture (recommended)

### Migration Path
1. Test new architecture with `index-unified.html`
2. Verify all games work correctly
3. Update links to point to new version
4. Keep old versions as backup

## 📝 Development Guidelines

### File Organization
- One game per directory in `src/games/`
- Shared code in `src/shared/`
- Core framework in `src/core/`
- Game-specific assets with the game

### Naming Conventions
- PascalCase for classes/components
- camelCase for functions/variables
- kebab-case for file names
- UPPER_CASE for constants

### Code Style
- Use ES6+ features
- Comment complex logic
- Keep functions small and focused
- Use meaningful variable names

## 🐛 Troubleshooting

### Game Not Loading
1. Check console for errors
2. Verify game is registered in GameRegistry
3. Ensure all dependencies are loaded
4. Check that GameInterface is implemented correctly

### Styling Issues
1. Verify design-tokens.css is loaded
2. Check for conflicting styles
3. Use browser DevTools to inspect CSS variables
4. Ensure dark mode compatibility

### Storage Problems
1. Check localStorage availability
2. Verify storage key conflicts
3. Test in incognito mode
4. Check storage quota

## 📚 API Reference

### GameInterface Methods
- `initialize()` - Setup game resources
- `render(container)` - Render game UI
- `destroy()` - Cleanup resources
- `saveState()` - Save game state
- `loadState(state)` - Load saved state
- `getStatistics()` - Get game stats
- `reset()` - Reset game

### Router Methods
- `navigate(path, state)` - Navigate to route
- `back()` - Go back in history
- `forward()` - Go forward
- `register(path, handler)` - Register route
- `reload()` - Reload current route

### GameRegistry Methods
- `register(game)` - Register a game
- `loadGame(gameId, container)` - Load a game
- `getGame(gameId)` - Get game instance
- `getAllGames()` - Get all games
- `getGlobalStatistics()` - Get combined stats

## 🚦 Next Steps

### Phase 2: Build System
- Set up Webpack/Vite
- Bundle JavaScript modules
- Minify for production
- Add source maps

### Phase 3: Testing
- Unit tests for game logic
- Integration tests for registry
- E2E tests for user flows
- Performance testing

### Phase 4: Enhancement
- Progressive Web App
- Offline support
- Push notifications
- Cloud sync

## 📞 Support

### Getting Help
- Check console for detailed error messages
- Review this migration guide
- Check code comments for documentation
- Test in different browsers

### Reporting Issues
When reporting issues, include:
- Browser and version
- Console error messages
- Steps to reproduce
- Expected vs actual behavior

---

*Last Updated: December 2024*
*Version: 1.0.0*
