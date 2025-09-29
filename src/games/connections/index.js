/**
 * Connections Game Module
 * Find groups of 4 related items
 */

class ConnectionsGameModule extends GameInterface {
    constructor() {
        super({
            id: 'connections',
            name: 'Connections',
            icon: '🔢',
            description: 'Find groups of 4 related items',
            category: 'puzzle'
        });
        
        this.categories = [
            { 
                name: "STREET NAMES", 
                words: ["Petman Ave", "Karaca Sk", "Yonge St", "Bagdat Cd"],
                color: 'yellow'
            },
            { 
                name: "FAMILY", 
                words: ["Nehir", "Erdal", "Can", "Isik"],
                color: 'green'
            },
            { 
                name: "BAYINDIR", 
                words: ["Dede", "Bahce", "Sicak", "Katmer"],
                color: 'blue'
            },
            { 
                name: "CITY NAMES", 
                words: ["Toronto", "Montreal", "Istanbul", "Izmir"],
                color: 'purple'
            }
        ];
        
        this.gridWords = [];
        this.selectedWords = [];
        this.solvedGroups = [];
        this.mistakes = 4;
        this.gamesPlayed = 0;
        this.gamesWon = 0;
    }
    
    render(container) {
        if (!container) return;
        
        this.container = container;
        container.innerHTML = `
            <div class="connections-game-container">
                <div class="game-header">
                    <h2>Connections</h2>
                    <p>Find groups of 4 related items</p>
                </div>
                
                <div class="mistakes-counter">
                    Mistakes remaining: <span id="mistakes-count">${'● '.repeat(this.mistakes)}</span>
                </div>
                
                <div id="solved-groups" class="solved-groups">
                    <!-- Solved groups will appear here -->
                </div>
                
                <div id="connections-grid" class="connections-grid">
                    <!-- Word grid will be rendered here -->
                </div>
                
                <div class="game-controls">
                    <button onclick="gameRegistry.getGame('connections').shuffle()" class="control-button">
                        Shuffle
                    </button>
                    <button onclick="gameRegistry.getGame('connections').clearSelection()" class="control-button">
                        Clear
                    </button>
                    <button onclick="gameRegistry.getGame('connections').submitGuess()" class="submit-button" id="submit-button">
                        Submit
                    </button>
                </div>
                
                <div id="game-message" class="game-message"></div>
            </div>
        `;
        
        this.addStyles();
        this.startNewGame();
    }
    
    startNewGame() {
        // Reset game state
        this.solvedGroups = [];
        this.mistakes = 4;
        this.selectedWords = [];
        
        // Create shuffled grid
        const allWords = this.categories.flatMap(cat => cat.words);
        this.gridWords = this.shuffleArray(allWords);
        
        this.renderGame();
    }
    
    renderGame() {
        this.renderSolvedGroups();
        this.renderGrid();
        this.updateMistakesDisplay();
        this.updateSubmitButton();
    }
    
    renderSolvedGroups() {
        const container = document.getElementById('solved-groups');
        if (!container) return;
        
        container.innerHTML = this.solvedGroups.map(group => `
            <div class="solved-group ${group.color}">
                <div class="group-name">${group.name}</div>
                <div class="group-words">${group.words.join(', ')}</div>
            </div>
        `).join('');
    }
    
    renderGrid() {
        const grid = document.getElementById('connections-grid');
        if (!grid) return;
        
        grid.innerHTML = this.gridWords.map(word => `
            <div class="connection-word ${this.selectedWords.includes(word) ? 'selected' : ''}"
                 onclick="gameRegistry.getGame('connections').toggleWord('${word}')"
                 data-word="${word}">
                ${word}
            </div>
        `).join('');
    }
    
    toggleWord(word) {
        if (this.selectedWords.includes(word)) {
            this.selectedWords = this.selectedWords.filter(w => w !== word);
        } else if (this.selectedWords.length < 4) {
            this.selectedWords.push(word);
        }
        
        this.renderGame();
    }
    
    clearSelection() {
        this.selectedWords = [];
        this.renderGame();
    }
    
    shuffle() {
        this.gridWords = this.shuffleArray(this.gridWords);
        this.renderGrid();
    }
    
    submitGuess() {
        if (this.selectedWords.length !== 4) return;
        
        // Check if selection matches a category
        const correctGroup = this.categories.find(cat => 
            this.selectedWords.every(word => cat.words.includes(word))
        );
        
        if (correctGroup) {
            // Correct!
            this.solvedGroups.push(correctGroup);
            this.gridWords = this.gridWords.filter(word => 
                !correctGroup.words.includes(word)
            );
            this.selectedWords = [];
            
            // Check for win
            if (this.solvedGroups.length === this.categories.length) {
                this.handleWin();
            }
        } else {
            // Wrong!
            this.mistakes--;
            this.animateWrongGuess();
            
            // Check for loss
            if (this.mistakes === 0) {
                this.handleLoss();
            }
        }
        
        this.renderGame();
    }
    
    animateWrongGuess() {
        const grid = document.getElementById('connections-grid');
        if (grid) {
            grid.classList.add('shake');
            setTimeout(() => grid.classList.remove('shake'), 500);
        }
    }
    
    handleWin() {
        this.gamesWon++;
        this.gamesPlayed++;
        this.showMessage('🎉 Congratulations! You found all groups!', 'success');
        setTimeout(() => this.startNewGame(), 3000);
    }
    
    handleLoss() {
        this.gamesPlayed++;
        this.showMessage('💔 Game Over! Try again!', 'error');
        
        // Show remaining groups
        const remaining = this.categories.filter(cat => 
            !this.solvedGroups.includes(cat)
        );
        remaining.forEach(cat => this.solvedGroups.push(cat));
        this.renderSolvedGroups();
        
        setTimeout(() => this.startNewGame(), 5000);
    }
    
    showMessage(text, type) {
        const messageEl = document.getElementById('game-message');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.className = `game-message ${type}`;
            setTimeout(() => {
                messageEl.textContent = '';
                messageEl.className = 'game-message';
            }, 3000);
        }
    }
    
    updateMistakesDisplay() {
        const mistakesEl = document.getElementById('mistakes-count');
        if (mistakesEl) {
            mistakesEl.textContent = '● '.repeat(this.mistakes);
        }
    }
    
    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-button');
        if (submitBtn) {
            submitBtn.disabled = this.selectedWords.length !== 4;
        }
    }
    
    shuffleArray(array) {
        return [...array].sort(() => Math.random() - 0.5);
    }
    
    addStyles() {
        if (document.getElementById('connections-inline-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'connections-inline-styles';
        style.textContent = `
            .connections-game-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .game-header {
                text-align: center;
                margin-bottom: 20px;
            }
            .mistakes-counter {
                text-align: center;
                font-size: 18px;
                margin-bottom: 20px;
                color: #dc2626;
            }
            .solved-groups {
                margin-bottom: 20px;
            }
            .solved-group {
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 8px;
                text-align: center;
                color: white;
            }
            .solved-group.yellow { background: #fbbf24; }
            .solved-group.green { background: #10b981; }
            .solved-group.blue { background: #3b82f6; }
            .solved-group.purple { background: #8b5cf6; }
            .group-name {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 5px;
            }
            .group-words {
                font-size: 16px;
            }
            .connections-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
                margin-bottom: 20px;
            }
            .connection-word {
                padding: 20px 10px;
                background: #e5e7eb;
                border-radius: 8px;
                font-weight: bold;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
                user-select: none;
            }
            .connection-word:hover {
                background: #d1d5db;
                transform: scale(1.02);
            }
            .connection-word.selected {
                background: #a5b4fc;
                color: #312e81;
            }
            .game-controls {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-bottom: 20px;
            }
            .control-button, .submit-button {
                padding: 10px 20px;
                border-radius: 6px;
                border: 2px solid #d1d5db;
                background: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .control-button:hover {
                background: #f3f4f6;
            }
            .submit-button {
                background: #4f46e5;
                color: white;
                border-color: #4f46e5;
            }
            .submit-button:hover:not(:disabled) {
                background: #4338ca;
            }
            .submit-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .game-message {
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                padding: 10px;
                border-radius: 8px;
                margin-top: 20px;
                opacity: 0;
                transition: opacity 0.3s;
            }
            .game-message.success {
                background: #d1fae5;
                color: #065f46;
                opacity: 1;
            }
            .game-message.error {
                background: #fee2e2;
                color: #991b1b;
                opacity: 1;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            .connections-grid.shake {
                animation: shake 0.5s;
            }
        `;
        document.head.appendChild(style);
    }
    
    getStatistics() {
        return {
            gamesPlayed: this.gamesPlayed,
            wins: this.gamesWon,
            losses: this.gamesPlayed - this.gamesWon,
            winRate: this.gamesPlayed > 0 
                ? Math.round((this.gamesWon / this.gamesPlayed) * 100)
                : 0
        };
    }
}

// Register the game
if (typeof gameRegistry !== 'undefined') {
    gameRegistry.register(new ConnectionsGameModule());
    console.log('Connections game registered');
}

// Export
if (typeof window !== 'undefined') {
    window.ConnectionsGameModule = ConnectionsGameModule;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConnectionsGameModule;
}
