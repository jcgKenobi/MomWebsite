/**
 * Wordle Game Module
 * Main entry point for the Wordle game
 */

// Import dependencies (will be bundled in production)
// For now, these are loaded via script tags

class WordleGameModule extends GameInterface {
    constructor() {
        super({
            id: 'wordle',
            name: 'Wordle',
            icon: '🎯',
            description: 'Guess the 5-letter word in 6 tries',
            category: 'word'
        });
        
        this.gameLogic = null;
        this.currentMode = null;
        this.solution = null;
        this.storage = null;
    }
    
    /**
     * Initialize the Wordle game
     */
    async initialize() {
        if (this.initialized) return;
        
        console.log('Initializing Wordle game...');
        
        // Initialize game logic
        if (typeof WordleGameLogic !== 'undefined') {
            this.gameLogic = new WordleGameLogic();
        }
        
        // Initialize storage
        if (typeof WordleStorage !== 'undefined') {
            this.storage = new WordleStorage();
        } else if (typeof BasicStorage !== 'undefined') {
            this.storage = new BasicStorage();
        }
        
        this.initialized = true;
    }
    
    /**
     * Render the Wordle game
     */
    render(container) {
        if (!container) return;
        
        this.container = container;
        
        // Check if we have React available
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
            this.renderReactVersion(container);
        } else {
            this.renderVanillaVersion(container);
        }
    }
    
    /**
     * Render React version of Wordle
     */
    renderReactVersion(container) {
        // Check if WordleApp component is available
        if (typeof WordleApp !== 'undefined') {
            const root = ReactDOM.createRoot(container);
            root.render(React.createElement(WordleApp, {
                onBack: () => {
                    if (window.app && window.app.router) {
                        window.app.router.back();
                    }
                }
            }));
        } else {
            // Fallback to vanilla version
            this.renderVanillaVersion(container);
        }
    }
    
    /**
     * Render vanilla JavaScript version
     */
    renderVanillaVersion(container) {
        container.innerHTML = `
            <div class="wordle-game-container">
                <div class="wordle-header">
                    <h1>Wordle - Mom Edition</h1>
                    <button onclick="window.location.href='WordleProduction.html'" class="play-button">
                        Play Full Version
                    </button>
                </div>
                <div class="wordle-modes">
                    <button onclick="gameRegistry.getGame('wordle').startGame('ENGLISH')" class="mode-button">
                        🇬🇧 English
                    </button>
                    <button onclick="gameRegistry.getGame('wordle').startGame('TURKEY')" class="mode-button">
                        🇹🇷 Turkish
                    </button>
                    <button onclick="gameRegistry.getGame('wordle').startGame('NATURE')" class="mode-button">
                        🌿 Nature
                    </button>
                </div>
                <div id="wordle-game-area"></div>
            </div>
        `;
        
        // Add styles
        this.addStyles();
    }
    
    /**
     * Start a game with specific mode
     */
    startGame(mode) {
        this.currentMode = mode;
        
        // Select a random word
        if (this.gameLogic) {
            this.solution = this.gameLogic.selectRandomWord(mode);
        } else {
            // Fallback word selection
            const words = {
                ENGLISH: ["HAPPY", "WORLD", "SMILE"],
                TURKEY: ["SEVGI", "MUTLU", "HUZUR"],
                NATURE: ["AGAC", "ORMAN", "NEHIR"]
            };
            const bank = words[mode] || words.ENGLISH;
            this.solution = bank[Math.floor(Math.random() * bank.length)];
        }
        
        // Render game board
        const gameArea = document.getElementById('wordle-game-area');
        if (gameArea) {
            gameArea.innerHTML = `
                <div class="wordle-board">
                    <p>Playing ${mode} mode</p>
                    <p>Solution: ${this.solution} (debug mode)</p>
                    <div class="game-grid">
                        ${Array(6).fill(0).map(() => `
                            <div class="word-row">
                                ${Array(5).fill(0).map(() => `
                                    <div class="letter-tile"></div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * Add game-specific styles
     */
    addStyles() {
        if (document.getElementById('wordle-inline-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'wordle-inline-styles';
        style.textContent = `
            .wordle-game-container {
                max-width: 500px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            .wordle-header {
                margin-bottom: 30px;
            }
            .wordle-modes {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-bottom: 30px;
            }
            .mode-button {
                padding: 10px 20px;
                border-radius: 8px;
                background: var(--color-primary-600, #4f46e5);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s;
            }
            .mode-button:hover {
                background: var(--color-primary-700, #4338ca);
                transform: translateY(-2px);
            }
            .play-button {
                padding: 12px 24px;
                border-radius: 8px;
                background: var(--color-success-600, #16a34a);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 18px;
                font-weight: 600;
                margin-top: 20px;
            }
            .wordle-board {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .game-grid {
                display: inline-block;
                margin-top: 20px;
            }
            .word-row {
                display: flex;
                gap: 5px;
                margin-bottom: 5px;
            }
            .letter-tile {
                width: 50px;
                height: 50px;
                border: 2px solid #d3d6da;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: bold;
                text-transform: uppercase;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Get game statistics
     */
    getStatistics() {
        if (this.storage) {
            const stats = this.storage.getStats();
            return {
                gamesPlayed: stats.overall.totalGames,
                wins: stats.overall.totalWins,
                losses: stats.overall.totalGames - stats.overall.totalWins,
                winRate: stats.overall.winPercentage,
                currentStreak: stats.overall.currentStreak,
                bestStreak: stats.overall.bestStreak
            };
        }
        
        return super.getStatistics();
    }
    
    /**
     * Save game state
     */
    saveState() {
        const state = {
            currentMode: this.currentMode,
            solution: this.solution,
            timestamp: Date.now()
        };
        
        if (this.storage) {
            // Use Wordle's storage system
            return state;
        }
        
        return state;
    }
    
    /**
     * Load game state
     */
    loadState(state) {
        if (state) {
            this.currentMode = state.currentMode;
            this.solution = state.solution;
        }
    }
    
    /**
     * Reset the game
     */
    reset() {
        this.currentMode = null;
        this.solution = null;
        
        if (this.container) {
            this.render(this.container);
        }
    }
}

// Register the game if registry is available
if (typeof gameRegistry !== 'undefined') {
    const wordleGame = new WordleGameModule();
    gameRegistry.register(wordleGame);
    console.log('Wordle game registered');
}

// Export for use in modules and browser
if (typeof window !== 'undefined') {
    window.WordleGameModule = WordleGameModule;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordleGameModule;
}
