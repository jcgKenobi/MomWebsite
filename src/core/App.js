/**
 * Main Application Controller
 * Coordinates the entire Mom's Website application
 */

class App {
    constructor(config = {}) {
        this.config = {
            containerId: config.containerId || 'root',
            title: config.title || "Mom's Game Center",
            version: config.version || '2.0.0',
            debug: config.debug || false,
            ...config
        };
        
        this.container = null;
        this.router = null;
        this.gameRegistry = null;
        this.currentView = null;
        this.initialized = false;
        
        // Store reference globally
        if (typeof window !== 'undefined') {
            window.app = this;
        }
    }
    
    /**
     * Initialize the application
     */
    async initialize() {
        if (this.initialized) {
            console.warn('App already initialized');
            return;
        }
        
        console.log(`Initializing ${this.config.title} v${this.config.version}`);
        
        try {
            // Setup container
            this.setupContainer();
            
            // Initialize core systems
            await this.initializeCoreSystems();
            
            // Register games
            await this.registerGames();
            
            // Setup routes
            this.setupRoutes();
            
            // Initialize UI
            this.initializeUI();
            
            // Start router
            this.router.start();
            
            this.initialized = true;
            console.log('App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application', error);
        }
    }
    
    /**
     * Setup main container
     */
    setupContainer() {
        this.container = document.getElementById(this.config.containerId);
        
        if (!this.container) {
            // Create container if it doesn't exist
            this.container = document.createElement('div');
            this.container.id = this.config.containerId;
            document.body.appendChild(this.container);
        }
        
        // Add app classes
        this.container.className = 'app-container';
        this.container.setAttribute('data-app-version', this.config.version);
    }
    
    /**
     * Initialize core systems
     */
    async initializeCoreSystems() {
        // Initialize game registry
        if (typeof GameRegistry !== 'undefined') {
            this.gameRegistry = window.gameRegistry || new GameRegistry();
        } else {
            console.warn('GameRegistry not found, creating stub');
            this.gameRegistry = { 
                register: () => {}, 
                loadGame: () => {},
                getAllGames: () => []
            };
        }
        
        // Initialize router
        if (typeof Router !== 'undefined') {
            this.router = window.router || new Router({
                container: this.container,
                beforeNavigate: (path) => this.beforeNavigate(path),
                afterNavigate: (context) => this.afterNavigate(context)
            });
        } else {
            console.warn('Router not found, creating stub');
            this.router = {
                register: () => {},
                navigate: () => {},
                start: () => {}
            };
        }
        
        // Setup global error handler
        this.setupErrorHandler();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    /**
     * Register all games
     */
    async registerGames() {
        console.log('Registering games...');
        
        // Import and register games dynamically
        const gameModules = [
            { path: '/src/games/wordle/index.js', id: 'wordle' },
            { path: '/src/games/matching/index.js', id: 'matching' },
            { path: '/src/games/connections/index.js', id: 'connections' },
            { path: '/src/games/crossword/index.js', id: 'crossword' }
        ];
        
        for (const module of gameModules) {
            try {
                // Try to load game module
                // In production, these would be bundled
                if (this.config.debug) {
                    console.log(`Loading game module: ${module.id}`);
                }
                
                // For now, we'll create placeholder games
                // These will be replaced when actual game modules are created
                this.registerPlaceholderGame(module.id);
                
            } catch (error) {
                console.warn(`Failed to load game ${module.id}:`, error);
            }
        }
    }
    
    /**
     * Register a placeholder game
     */
    registerPlaceholderGame(gameId) {
        const gameConfigs = {
            wordle: {
                name: 'Wordle',
                icon: '🎯',
                description: 'Guess the 5-letter word',
                category: 'word'
            },
            matching: {
                name: 'Matching Game',
                icon: '🔗',
                description: 'Match Turkish and English words',
                category: 'language'
            },
            connections: {
                name: 'Connections',
                icon: '🔢',
                description: 'Find groups of related items',
                category: 'puzzle'
            },
            crossword: {
                name: 'Crossword',
                icon: '📝',
                description: 'Turkish crossword puzzle',
                category: 'word'
            }
        };
        
        const config = gameConfigs[gameId];
        if (!config) return;
        
        // Create placeholder game
        if (typeof GameInterface !== 'undefined') {
            class PlaceholderGame extends GameInterface {
                constructor() {
                    super({
                        id: gameId,
                        ...config
                    });
                }
                
                render(container) {
                    container.innerHTML = `
                        <div class="game-placeholder">
                            <div class="placeholder-icon">${this.icon}</div>
                            <h2>${this.name}</h2>
                            <p>${this.description}</p>
                            <p class="placeholder-note">Game implementation coming soon...</p>
                        </div>
                    `;
                }
            }
            
            this.gameRegistry.register(new PlaceholderGame());
        }
    }
    
    /**
     * Setup application routes
     */
    setupRoutes() {
        // Home page
        this.router.register('/', () => this.renderHome());
        
        // Games list
        this.router.register('/games', () => this.renderGamesList());
        
        // Individual game routes
        this.router.register('/game/:id', (context) => this.renderGame(context.params.id));
        
        // Statistics
        this.router.register('/stats', () => this.renderStatistics());
        
        // Settings
        this.router.register('/settings', () => this.renderSettings());
        
        // About
        this.router.register('/about', () => this.renderAbout());
        
        // Birthday message (special)
        this.router.register('/birthday', () => this.renderBirthdayMessage());
    }
    
    /**
     * Initialize UI components
     */
    initializeUI() {
        // Add navigation
        this.createNavigation();
        
        // Add theme support
        this.setupTheme();
        
        // Add loading indicator
        this.createLoadingIndicator();
    }
    
    /**
     * Create navigation menu
     */
    createNavigation() {
        const nav = document.createElement('nav');
        nav.className = 'app-navigation';
        nav.innerHTML = `
            <div class="nav-brand">
                <span class="nav-icon">🎮</span>
                <span class="nav-title">${this.config.title}</span>
            </div>
            <div class="nav-menu">
                <a href="/" class="nav-link" data-route="/">Home</a>
                <a href="/games" class="nav-link" data-route="/games">Games</a>
                <a href="/stats" class="nav-link" data-route="/stats">Statistics</a>
                <a href="/settings" class="nav-link" data-route="/settings">Settings</a>
            </div>
        `;
        
        // Insert before container
        this.container.parentNode.insertBefore(nav, this.container);
    }
    
    /**
     * Render home page
     */
    renderHome() {
        const games = this.gameRegistry.getAllGames({ enabled: true });
        
        return `
            <div class="home-page">
                <header class="home-header">
                    <h1>Welcome to ${this.config.title}!</h1>
                    <p>Choose a game to play</p>
                </header>
                
                <div class="featured-games">
                    <h2>Featured Games</h2>
                    <div class="games-grid">
                        ${games.slice(0, 4).map(game => `
                            <div class="game-card" onclick="app.navigateToGame('${game.id}')">
                                <div class="game-icon">${game.icon}</div>
                                <h3>${game.name}</h3>
                                <p>${game.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="quick-links">
                    <a href="/birthday" class="special-link">
                        <span>🎂</span> Birthday Message
                    </a>
                </div>
            </div>
        `;
    }
    
    /**
     * Render games list
     */
    renderGamesList() {
        const gamesByCategory = this.gameRegistry.getGamesByCategory();
        
        return `
            <div class="games-list-page">
                <h1>All Games</h1>
                ${Object.entries(gamesByCategory).map(([category, games]) => `
                    <section class="games-category">
                        <h2>${category.charAt(0).toUpperCase() + category.slice(1)} Games</h2>
                        <div class="games-grid">
                            ${games.map(game => `
                                <div class="game-card" onclick="app.navigateToGame('${game.id}')">
                                    <div class="game-icon">${game.icon}</div>
                                    <h3>${game.name}</h3>
                                    <p>${game.description}</p>
                                    <button class="play-button">Play</button>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Render a specific game
     */
    async renderGame(gameId) {
        this.showLoading();
        
        try {
            const gameContainer = document.createElement('div');
            gameContainer.className = 'game-container';
            gameContainer.id = `game-${gameId}`;
            
            this.container.innerHTML = '';
            this.container.appendChild(gameContainer);
            
            // Add back button
            const header = document.createElement('div');
            header.className = 'game-header';
            header.innerHTML = `
                <button onclick="app.router.back()" class="back-button">← Back</button>
                <button onclick="app.reloadGame('${gameId}')" class="reload-button">↻ Restart</button>
            `;
            this.container.insertBefore(header, gameContainer);
            
            // Load the game
            await this.gameRegistry.loadGame(gameId, gameContainer);
            
        } catch (error) {
            console.error(`Failed to load game ${gameId}:`, error);
            this.showError(`Failed to load game: ${gameId}`, error);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * Render statistics page
     */
    renderStatistics() {
        const stats = this.gameRegistry.getGlobalStatistics();
        
        return `
            <div class="statistics-page">
                <h1>Your Statistics</h1>
                
                <div class="stats-overview">
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalGamesPlayed}</div>
                        <div class="stat-label">Games Played</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalWins}</div>
                        <div class="stat-label">Total Wins</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.globalWinRate}%</div>
                        <div class="stat-label">Win Rate</div>
                    </div>
                </div>
                
                <div class="game-stats">
                    <h2>Stats by Game</h2>
                    ${Object.entries(stats.gameStats).map(([gameId, gameStats]) => `
                        <div class="game-stat-row">
                            <span class="game-name">${gameId}</span>
                            <span class="game-played">${gameStats.gamesPlayed} played</span>
                            <span class="game-wins">${gameStats.wins} wins</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * Render settings page
     */
    renderSettings() {
        return `
            <div class="settings-page">
                <h1>Settings</h1>
                
                <div class="settings-section">
                    <h2>Appearance</h2>
                    <label class="setting-item">
                        <span>Dark Mode</span>
                        <input type="checkbox" id="darkModeToggle" onchange="app.toggleDarkMode()">
                    </label>
                </div>
                
                <div class="settings-section">
                    <h2>Games</h2>
                    <label class="setting-item">
                        <span>Show hints</span>
                        <input type="checkbox" id="hintsToggle">
                    </label>
                    <label class="setting-item">
                        <span>Sound effects</span>
                        <input type="checkbox" id="soundToggle">
                    </label>
                </div>
                
                <div class="settings-section">
                    <h2>Data</h2>
                    <button onclick="app.exportData()" class="settings-button">Export Data</button>
                    <button onclick="app.importData()" class="settings-button">Import Data</button>
                    <button onclick="app.clearData()" class="settings-button danger">Clear All Data</button>
                </div>
            </div>
        `;
    }
    
    /**
     * Render about page
     */
    renderAbout() {
        return `
            <div class="about-page">
                <h1>About ${this.config.title}</h1>
                <p>Version ${this.config.version}</p>
                <p>A special collection of games made with ❤️</p>
                
                <div class="credits">
                    <h2>Games Included</h2>
                    <ul>
                        ${this.gameRegistry.getAllGames().map(game => 
                            `<li>${game.icon} ${game.name} - ${game.description}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    /**
     * Render birthday message
     */
    renderBirthdayMessage() {
        return `
            <div class="birthday-page">
                <div class="birthday-content">
                    <h1>🎂 Happy Birthday, Mom! 🎉</h1>
                    <div class="birthday-message">
                        <p>This website was made especially for you!</p>
                        <p>Enjoy playing all these games.</p>
                        <p>With love ❤️</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Navigate to a game
     */
    navigateToGame(gameId) {
        this.router.navigate(`/game/${gameId}`);
    }
    
    /**
     * Reload current game
     */
    reloadGame(gameId) {
        const game = this.gameRegistry.getGame(gameId);
        if (game) {
            game.reset();
            this.router.reload();
        }
    }
    
    /**
     * Show loading indicator
     */
    showLoading() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }
    
    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
    
    /**
     * Create loading indicator
     */
    createLoadingIndicator() {
        const loader = document.createElement('div');
        loader.id = 'app-loader';
        loader.className = 'loading-indicator';
        loader.style.display = 'none';
        loader.innerHTML = `
            <div class="spinner"></div>
            <div>Loading...</div>
        `;
        document.body.appendChild(loader);
    }
    
    /**
     * Show error message
     */
    showError(message, error) {
        this.container.innerHTML = `
            <div class="error-page">
                <h1>Error</h1>
                <p>${message}</p>
                ${error ? `<pre>${error.stack || error.message}</pre>` : ''}
                <button onclick="app.router.navigate('/')">Go Home</button>
            </div>
        `;
    }
    
    /**
     * Setup error handler
     */
    setupErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            if (this.config.debug) {
                this.showError('An error occurred', event.error);
            }
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            if (this.config.debug) {
                this.showError('An error occurred', event.reason);
            }
        });
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + H = Home
            if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
                event.preventDefault();
                this.router.navigate('/');
            }
            
            // Escape = Back
            if (event.key === 'Escape') {
                this.router.back();
            }
        });
    }
    
    /**
     * Setup theme support
     */
    setupTheme() {
        const savedTheme = localStorage.getItem('app-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }
    
    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('app-theme', isDark ? 'dark' : 'light');
    }
    
    /**
     * Before navigate hook
     */
    beforeNavigate(path) {
        console.log(`Navigating to: ${path}`);
        return true;
    }
    
    /**
     * After navigate hook
     */
    afterNavigate(context) {
        console.log(`Navigated to: ${context.path}`);
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            const route = link.getAttribute('data-route');
            if (route === context.path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    /**
     * Export user data
     */
    exportData() {
        const data = {
            version: this.config.version,
            timestamp: new Date().toISOString(),
            games: {}
        };
        
        // Collect data from all games
        this.gameRegistry.getAllGames().forEach(game => {
            data.games[game.id] = game.saveState();
        });
        
        // Download as JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mom-games-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * Import user data
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Restore game states
                    Object.entries(data.games).forEach(([gameId, state]) => {
                        const game = this.gameRegistry.getGame(gameId);
                        if (game) {
                            game.loadState(state);
                        }
                    });
                    
                    alert('Data imported successfully!');
                    this.router.reload();
                    
                } catch (error) {
                    console.error('Failed to import data:', error);
                    alert('Failed to import data. Please check the file.');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    /**
     * Clear all data
     */
    clearData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.clear();
            this.gameRegistry.getAllGames().forEach(game => game.reset());
            alert('All data cleared!');
            this.router.navigate('/');
        }
    }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const app = new App({
                debug: true // Set to false for production
            });
            app.initialize();
        });
    } else {
        // DOM already loaded
        const app = new App({
            debug: true
        });
        app.initialize();
    }
}

// Export for use in modules and browser
if (typeof window !== 'undefined') {
    window.App = App;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
