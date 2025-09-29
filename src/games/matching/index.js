/**
 * Matching Game Module
 * Turkish-English word matching game
 */

class MatchingGameModule extends GameInterface {
    constructor() {
        super({
            id: 'matching',
            name: 'Word Matching',
            icon: '🔗',
            description: 'Match Turkish and English words',
            category: 'language'
        });
        
        this.wordBank = [
            { id: 1, tr: 'Aşk', en: 'Love' },
            { id: 2, tr: 'Aile', en: 'Family' },
            { id: 3, tr: 'Çiçek', en: 'Flower' },
            { id: 4, tr: 'Köpek', en: 'Dog' },
            { id: 5, tr: 'Bahçe', en: 'Garden' },
            { id: 6, tr: 'Daire', en: 'Condo' },
            { id: 7, tr: 'Hırs', en: 'Ambition' },
            { id: 8, tr: 'Cesur', en: 'Brave' },
            { id: 9, tr: 'Nazik', en: 'Kind' },
            { id: 10, tr: 'Güneş', en: 'Sun' },
            { id: 11, tr: 'Arkadaş', en: 'Friend' },
            { id: 12, tr: 'Mutlu', en: 'Happy' },
            { id: 13, tr: 'Kedi', en: 'Cat' },
            { id: 14, tr: 'Ev', en: 'Home' },
            { id: 15, tr: 'Kitap', en: 'Book' },
            { id: 16, tr: 'Su', en: 'Water' },
            { id: 17, tr: 'Gökyüzü', en: 'Sky' },
            { id: 18, tr: 'Yıldız', en: 'Star' },
            { id: 19, tr: 'Rüya', en: 'Dream' },
            { id: 20, tr: 'Umut', en: 'Hope' }
        ];
        
        this.currentWords = [];
        this.matchedPairs = [];
        this.selectedTurkish = null;
        this.gameSize = 4;
        this.gamesPlayed = 0;
        this.gamesWon = 0;
    }
    
    render(container) {
        if (!container) return;
        
        this.container = container;
        container.innerHTML = `
            <div class="matching-game-container">
                <div class="game-header">
                    <h2>Turkish-English Word Matching</h2>
                    <div class="game-controls">
                        <label>
                            Pairs: 
                            <select id="game-size" onchange="gameRegistry.getGame('matching').changeSize(this.value)">
                                <option value="4">4</option>
                                <option value="6">6</option>
                                <option value="8">8</option>
                                <option value="10">10</option>
                            </select>
                        </label>
                        <button onclick="gameRegistry.getGame('matching').resetGame()" class="reset-button">
                            Reset Game
                        </button>
                    </div>
                </div>
                
                <div id="matching-game-board" class="matching-board">
                    <!-- Game will be rendered here -->
                </div>
                
                <div class="game-stats">
                    <span>Games: <strong id="games-played">0</strong></span>
                    <span>Wins: <strong id="games-won">0</strong></span>
                    <span>Win Rate: <strong id="win-rate">0%</strong></span>
                </div>
            </div>
        `;
        
        this.addStyles();
        this.resetGame();
    }
    
    resetGame() {
        // Shuffle and select words
        const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
        const selectedWords = shuffle(this.wordBank).slice(0, this.gameSize);
        
        this.currentWords = shuffle([...selectedWords]);
        this.matchedPairs = [];
        this.selectedTurkish = null;
        
        this.renderGameBoard();
    }
    
    renderGameBoard() {
        const board = document.getElementById('matching-game-board');
        if (!board) return;
        
        const turkishWords = this.currentWords.map(word => `
            <div class="word-box turkish ${this.matchedPairs.includes(word.id) ? 'matched' : ''} 
                        ${this.selectedTurkish?.id === word.id ? 'selected' : ''}"
                 onclick="gameRegistry.getGame('matching').selectTurkish(${word.id})"
                 data-id="${word.id}">
                ${word.tr}
            </div>
        `).join('');
        
        const englishWords = [...this.currentWords].sort(() => Math.random() - 0.5).map(word => `
            <div class="word-box english ${this.matchedPairs.includes(word.id) ? 'matched' : ''}"
                 onclick="gameRegistry.getGame('matching').selectEnglish(${word.id})"
                 data-id="${word.id}">
                ${word.en}
            </div>
        `).join('');
        
        board.innerHTML = `
            <div class="words-container">
                <div class="word-column">
                    <h3>Turkish</h3>
                    ${turkishWords}
                </div>
                <div class="word-column">
                    <h3>English</h3>
                    ${englishWords}
                </div>
            </div>
            ${this.matchedPairs.length === this.gameSize ? `
                <div class="win-message">
                    <h2>🎉 Congratulations!</h2>
                    <p>You matched all pairs!</p>
                    <button onclick="gameRegistry.getGame('matching').resetGame()" class="play-again-button">
                        Play Again
                    </button>
                </div>
            ` : ''}
        `;
    }
    
    selectTurkish(wordId) {
        if (this.matchedPairs.includes(wordId)) return;
        
        const word = this.currentWords.find(w => w.id === wordId);
        this.selectedTurkish = word;
        this.renderGameBoard();
    }
    
    selectEnglish(wordId) {
        if (!this.selectedTurkish || this.matchedPairs.includes(wordId)) return;
        
        if (this.selectedTurkish.id === wordId) {
            // Correct match!
            this.matchedPairs.push(wordId);
            this.selectedTurkish = null;
            
            if (this.matchedPairs.length === this.gameSize) {
                // Game won!
                this.gamesWon++;
                this.gamesPlayed++;
                this.updateStats();
            }
        } else {
            // Wrong match
            const englishBox = document.querySelector(`.english[data-id="${wordId}"]`);
            if (englishBox) {
                englishBox.classList.add('wrong');
                setTimeout(() => {
                    englishBox.classList.remove('wrong');
                }, 500);
            }
            this.selectedTurkish = null;
        }
        
        this.renderGameBoard();
    }
    
    changeSize(newSize) {
        this.gameSize = parseInt(newSize);
        this.resetGame();
    }
    
    updateStats() {
        const playedEl = document.getElementById('games-played');
        const wonEl = document.getElementById('games-won');
        const rateEl = document.getElementById('win-rate');
        
        if (playedEl) playedEl.textContent = this.gamesPlayed;
        if (wonEl) wonEl.textContent = this.gamesWon;
        if (rateEl) {
            const rate = this.gamesPlayed > 0 
                ? Math.round((this.gamesWon / this.gamesPlayed) * 100)
                : 0;
            rateEl.textContent = rate + '%';
        }
    }
    
    addStyles() {
        if (document.getElementById('matching-inline-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'matching-inline-styles';
        style.textContent = `
            .matching-game-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .game-header {
                text-align: center;
                margin-bottom: 30px;
            }
            .game-controls {
                margin-top: 20px;
                display: flex;
                gap: 20px;
                justify-content: center;
                align-items: center;
            }
            .matching-board {
                background: white;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                min-height: 400px;
            }
            .words-container {
                display: flex;
                gap: 60px;
                justify-content: center;
            }
            .word-column {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .word-column h3 {
                text-align: center;
                color: var(--color-primary-600, #4f46e5);
                margin-bottom: 10px;
            }
            .word-box {
                padding: 15px 30px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 18px;
                font-weight: 500;
                text-align: center;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
                min-width: 150px;
            }
            .word-box:hover:not(.matched) {
                border-color: #9ca3af;
                background: #f9fafb;
                transform: translateX(5px);
            }
            .word-box.selected {
                border-color: #3b82f6;
                background: #eff6ff;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            }
            .word-box.matched {
                background: #d1fae5;
                border-color: #10b981;
                color: #065f46;
                cursor: not-allowed;
                opacity: 0.8;
            }
            .word-box.wrong {
                animation: shake 0.5s;
                border-color: #ef4444;
                background: #fee2e2;
            }
            .game-stats {
                margin-top: 30px;
                display: flex;
                gap: 30px;
                justify-content: center;
                font-size: 16px;
            }
            .win-message {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                text-align: center;
                z-index: 10;
            }
            .win-message h2 {
                color: #10b981;
                margin-bottom: 10px;
            }
            .play-again-button {
                margin-top: 20px;
                padding: 12px 30px;
                background: #10b981;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            }
            .reset-button {
                padding: 8px 20px;
                background: #6b7280;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
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
    gameRegistry.register(new MatchingGameModule());
    console.log('Matching game registered');
}

// Export
if (typeof window !== 'undefined') {
    window.MatchingGameModule = MatchingGameModule;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MatchingGameModule;
}
