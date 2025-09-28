/**
 * Game Registry System
 * Central registry for all games in the Mom's Website
 * Implements a plugin architecture for easy game addition/removal
 */

class GameInterface {
    /**
     * Base interface that all games must implement
     * @param {Object} config - Game configuration
     */
    constructor(config) {
        if (!config.id || !config.name) {
            throw new Error('Game must have an id and name');
        }
        
        this.id = config.id;
        this.name = config.name;
        this.icon = config.icon || '🎮';
        this.description = config.description || '';
        this.category = config.category || 'general';
        this.enabled = config.enabled !== false;
        this.container = null;
        this.initialized = false;
    }
    
    /**
     * Initialize game resources
     * Override this to load assets, set up state, etc.
     */
    async initialize() {
        if (this.initialized) return;
        
        console.log(`Initializing game: ${this.name}`);
        this.initialized = true;
    }
    
    /**
     * Render the game into a container
     * @param {HTMLElement} container - DOM element to render into
     */
    render(container) {
        if (!container) {
            throw new Error('Container element is required');
        }
        
        this.container = container;
        container.innerHTML = `
            <div class="game-placeholder">
                <h2>${this.name}</h2>
                <p>Game not implemented yet</p>
            </div>
        `;
    }
    
    /**
     * Clean up game resources
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
            this.container = null;
        }
        this.initialized = false;
    }
    
    /**
     * Save current game state
     * @returns {Object} Game state to be persisted
     */
    saveState() {
        return {
            id: this.id,
            timestamp: Date.now()
        };
    }
    
    /**
     * Load saved game state
     * @param {Object} state - Previously saved state
     */
    loadState(state) {
        console.log(`Loading state for ${this.name}:`, state);
    }
    
    /**
     * Get game statistics
     * @returns {Object} Statistics object
     */
    getStatistics() {
        return {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            winRate: 0
        };
    }
    
    /**
     * Reset game to initial state
     */
    reset() {
        console.log(`Resetting game: ${this.name}`);
    }
    
    /**
     * Get game metadata
     * @returns {Object} Metadata object
     */
    getMetadata() {
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            description: this.description,
            category: this.category,
            enabled: this.enabled
        };
    }
}

class GameRegistry {
    constructor() {
        this.games = new Map();
        this.currentGame = null;
        this.categories = new Set(['general']);
        this.listeners = new Map();
    }
    
    /**
     * Register a new game
     * @param {GameInterface} game - Game instance to register
     */
    register(game) {
        if (!(game instanceof GameInterface)) {
            throw new Error('Game must extend GameInterface');
        }
        
        if (this.games.has(game.id)) {
            console.warn(`Game ${game.id} is already registered, replacing...`);
        }
        
        this.games.set(game.id, game);
        
        // Add category if new
        if (game.category) {
            this.categories.add(game.category);
        }
        
        console.log(`Registered game: ${game.name} (${game.id})`);
        this.emit('gameRegistered', game);
        
        return this;
    }
    
    /**
     * Unregister a game
     * @param {string} gameId - ID of game to remove
     */
    unregister(gameId) {
        const game = this.games.get(gameId);
        if (game) {
            if (this.currentGame === game) {
                this.unloadCurrentGame();
            }
            
            game.destroy();
            this.games.delete(gameId);
            this.emit('gameUnregistered', game);
            console.log(`Unregistered game: ${gameId}`);
        }
        
        return this;
    }
    
    /**
     * Load and activate a game
     * @param {string} gameId - ID of game to load
     * @param {HTMLElement} container - Container to render into
     */
    async loadGame(gameId, container) {
        const game = this.games.get(gameId);
        
        if (!game) {
            throw new Error(`Game ${gameId} not found`);
        }
        
        if (!game.enabled) {
            throw new Error(`Game ${gameId} is disabled`);
        }
        
        // Save state of current game if any
        if (this.currentGame) {
            this.unloadCurrentGame();
        }
        
        try {
            // Initialize and render new game
            await game.initialize();
            game.render(container);
            this.currentGame = game;
            
            // Try to restore saved state
            const savedState = this.loadGameState(gameId);
            if (savedState) {
                game.loadState(savedState);
            }
            
            this.emit('gameLoaded', game);
            console.log(`Loaded game: ${game.name}`);
            
        } catch (error) {
            console.error(`Failed to load game ${gameId}:`, error);
            this.emit('gameLoadError', { gameId, error });
            throw error;
        }
        
        return game;
    }
    
    /**
     * Unload the current game
     */
    unloadCurrentGame() {
        if (this.currentGame) {
            const state = this.currentGame.saveState();
            this.saveGameState(this.currentGame.id, state);
            
            this.currentGame.destroy();
            this.emit('gameUnloaded', this.currentGame);
            
            console.log(`Unloaded game: ${this.currentGame.name}`);
            this.currentGame = null;
        }
    }
    
    /**
     * Get a game by ID
     * @param {string} gameId - Game ID
     * @returns {GameInterface|null}
     */
    getGame(gameId) {
        return this.games.get(gameId) || null;
    }
    
    /**
     * Get all registered games
     * @param {Object} filter - Optional filter criteria
     * @returns {Array<GameInterface>}
     */
    getAllGames(filter = {}) {
        let games = Array.from(this.games.values());
        
        // Apply filters
        if (filter.category) {
            games = games.filter(g => g.category === filter.category);
        }
        
        if (filter.enabled !== undefined) {
            games = games.filter(g => g.enabled === filter.enabled);
        }
        
        return games;
    }
    
    /**
     * Get games grouped by category
     * @returns {Object}
     */
    getGamesByCategory() {
        const grouped = {};
        
        for (const category of this.categories) {
            grouped[category] = this.getAllGames({ category });
        }
        
        return grouped;
    }
    
    /**
     * Get all game metadata
     * @returns {Array<Object>}
     */
    getAllGameMetadata() {
        return this.getAllGames().map(game => game.getMetadata());
    }
    
    /**
     * Get global statistics across all games
     * @returns {Object}
     */
    getGlobalStatistics() {
        const stats = {
            totalGamesPlayed: 0,
            totalWins: 0,
            totalLosses: 0,
            gameStats: {}
        };
        
        for (const [gameId, game] of this.games) {
            const gameStats = game.getStatistics();
            stats.gameStats[gameId] = gameStats;
            stats.totalGamesPlayed += gameStats.gamesPlayed || 0;
            stats.totalWins += gameStats.wins || 0;
            stats.totalLosses += gameStats.losses || 0;
        }
        
        stats.globalWinRate = stats.totalGamesPlayed > 0
            ? (stats.totalWins / stats.totalGamesPlayed * 100).toFixed(1)
            : 0;
        
        return stats;
    }
    
    /**
     * Save game state to storage
     * @param {string} gameId - Game ID
     * @param {Object} state - State to save
     */
    saveGameState(gameId, state) {
        try {
            const key = `game_state_${gameId}`;
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Failed to save state for game ${gameId}:`, error);
        }
    }
    
    /**
     * Load game state from storage
     * @param {string} gameId - Game ID
     * @returns {Object|null}
     */
    loadGameState(gameId) {
        try {
            const key = `game_state_${gameId}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Failed to load state for game ${gameId}:`, error);
            return null;
        }
    }
    
    /**
     * Event emitter functionality
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return this;
    }
    
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
        return this;
    }
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    /**
     * Enable a game
     * @param {string} gameId - Game ID
     */
    enableGame(gameId) {
        const game = this.games.get(gameId);
        if (game) {
            game.enabled = true;
            this.emit('gameEnabled', game);
        }
    }
    
    /**
     * Disable a game
     * @param {string} gameId - Game ID
     */
    disableGame(gameId) {
        const game = this.games.get(gameId);
        if (game) {
            if (this.currentGame === game) {
                this.unloadCurrentGame();
            }
            game.enabled = false;
            this.emit('gameDisabled', game);
        }
    }
    
    /**
     * Check if a game is registered
     * @param {string} gameId - Game ID
     * @returns {boolean}
     */
    hasGame(gameId) {
        return this.games.has(gameId);
    }
    
    /**
     * Get the count of registered games
     * @returns {number}
     */
    getGameCount() {
        return this.games.size;
    }
}

// Create singleton instance
const gameRegistry = new GameRegistry();

// Export for use in modules and browser
if (typeof window !== 'undefined') {
    window.GameInterface = GameInterface;
    window.GameRegistry = GameRegistry;
    window.gameRegistry = gameRegistry;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameInterface,
        GameRegistry,
        gameRegistry
    };
}
