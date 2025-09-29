/**
 * Crossword Game Module
 * Turkish crossword puzzle game
 */

class CrosswordGameModule extends GameInterface {
    constructor() {
        super({
            id: 'crossword',
            name: 'Turkish Crossword',
            icon: '📝',
            description: 'Solve Turkish crossword puzzles',
            category: 'word'
        });
        
        this.currentPuzzle = {
            across: {
                1: { clue: 'Ağaçların yeşil kısmı (Leaf)', answer: 'YAPRAK', row: 0, col: 2, length: 6 },
                4: { clue: 'Evcil hayvan, sadık dost (Dog)', answer: 'KOPEK', row: 2, col: 0, length: 5 },
                6: { clue: 'Oksijen kaynağımız (Air)', answer: 'HAVA', row: 4, col: 1, length: 4 },
                7: { clue: 'Bal yapan böcek (Bee)', answer: 'ARI', row: 6, col: 0, length: 3 },
                8: { clue: 'Bitkilerin yetiştiği yer (Soil)', answer: 'TOPRAK', row: 6, col: 3, length: 6 }
            },
            down: {
                2: { clue: 'Uçan, tüylü hayvan (Bird)', answer: 'KUS', row: 0, col: 4, length: 3 },
                3: { clue: 'Yeryüzünün büyük su birikintisi (River)', answer: 'NEHIR', row: 1, col: 2, length: 5 },
                5: { clue: 'Bahçelerin renkli süsü (Flower)', answer: 'CICEK', row: 2, col: 6, length: 5 },
                6: { clue: 'Yaşam kaynağımız (Water)', answer: 'SU', row: 4, col: 1, length: 2 }
            }
        };
        
        this.grid = [];
        this.userAnswers = {};
        this.selectedCell = null;
        this.selectedClue = null;
        this.completed = false;
    }
    
    render(container) {
        if (!container) return;
        
        this.container = container;
        
        // Check if React Crossword is available
        if (typeof window !== 'undefined' && window.ReactCrossword) {
            this.renderReactVersion(container);
        } else {
            this.renderVanillaVersion(container);
        }
    }
    
    renderReactVersion(container) {
        // Use the React crossword library if available
        const Crossword = window.ReactCrossword.Crossword;
        
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
            const root = ReactDOM.createRoot(container);
            root.render(
                React.createElement('div', { className: 'crossword-react-container' },
                    React.createElement('h2', null, 'Turkish Crossword'),
                    React.createElement(Crossword, { 
                        data: this.currentPuzzle,
                        onCorrect: () => console.log('Correct!'),
                        onComplete: () => this.handleComplete()
                    })
                )
            );
        }
    }
    
    renderVanillaVersion(container) {
        container.innerHTML = `
            <div class="crossword-game-container">
                <div class="game-header">
                    <h2>Turkish Crossword</h2>
                    <p>Click on a square and type your answer</p>
                </div>
                
                <div class="crossword-content">
                    <div class="crossword-grid-container">
                        <div id="crossword-grid" class="crossword-grid">
                            <!-- Grid will be rendered here -->
                        </div>
                    </div>
                    
                    <div class="clues-container">
                        <div class="clues-section">
                            <h3>Across</h3>
                            <div id="across-clues" class="clues-list">
                                <!-- Across clues -->
                            </div>
                        </div>
                        
                        <div class="clues-section">
                            <h3>Down</h3>
                            <div id="down-clues" class="clues-list">
                                <!-- Down clues -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="game-controls">
                    <button onclick="gameRegistry.getGame('crossword').checkAnswers()" class="check-button">
                        Check Answers
                    </button>
                    <button onclick="gameRegistry.getGame('crossword').revealAnswer()" class="reveal-button">
                        Reveal Selected
                    </button>
                    <button onclick="gameRegistry.getGame('crossword').resetPuzzle()" class="reset-button">
                        Reset Puzzle
                    </button>
                </div>
                
                <div id="completion-message" class="completion-message" style="display: none;">
                    <h2>🎉 Puzzle Complete!</h2>
                    <p>Great job solving the crossword!</p>
                </div>
            </div>
        `;
        
        this.addStyles();
        this.initializePuzzle();
    }
    
    initializePuzzle() {
        // Create grid (9x9 for this puzzle)
        this.grid = Array(9).fill(null).map(() => Array(9).fill(null));
        
        // Place words in grid
        Object.entries(this.currentPuzzle.across).forEach(([num, word]) => {
            for (let i = 0; i < word.length; i++) {
                if (!this.grid[word.row][word.col + i]) {
                    this.grid[word.row][word.col + i] = {
                        letter: word.answer[i],
                        number: i === 0 ? num : null,
                        across: num,
                        down: null,
                        userLetter: ''
                    };
                } else {
                    this.grid[word.row][word.col + i].across = num;
                    if (i === 0) this.grid[word.row][word.col + i].number = num;
                }
            }
        });
        
        Object.entries(this.currentPuzzle.down).forEach(([num, word]) => {
            for (let i = 0; i < word.length; i++) {
                if (!this.grid[word.row + i][word.col]) {
                    this.grid[word.row + i][word.col] = {
                        letter: word.answer[i],
                        number: i === 0 ? num : null,
                        across: null,
                        down: num,
                        userLetter: ''
                    };
                } else {
                    this.grid[word.row + i][word.col].down = num;
                    if (i === 0 && !this.grid[word.row + i][word.col].number) {
                        this.grid[word.row + i][word.col].number = num;
                    }
                }
            }
        });
        
        this.renderGrid();
        this.renderClues();
        this.setupKeyboardHandler();
    }
    
    renderGrid() {
        const gridEl = document.getElementById('crossword-grid');
        if (!gridEl) return;
        
        let html = '';
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.grid[row][col];
                if (cell) {
                    const isSelected = this.selectedCell && 
                                     this.selectedCell.row === row && 
                                     this.selectedCell.col === col;
                    html += `
                        <div class="grid-cell ${isSelected ? 'selected' : ''} 
                                   ${cell.userLetter === cell.letter ? 'correct' : ''}"
                             onclick="gameRegistry.getGame('crossword').selectCell(${row}, ${col})"
                             data-row="${row}" data-col="${col}">
                            ${cell.number ? `<span class="cell-number">${cell.number}</span>` : ''}
                            <span class="cell-letter">${cell.userLetter || ''}</span>
                        </div>
                    `;
                } else {
                    html += '<div class="grid-cell black"></div>';
                }
            }
        }
        
        gridEl.innerHTML = html;
    }
    
    renderClues() {
        const acrossEl = document.getElementById('across-clues');
        const downEl = document.getElementById('down-clues');
        
        if (acrossEl) {
            acrossEl.innerHTML = Object.entries(this.currentPuzzle.across).map(([num, clue]) => `
                <div class="clue ${this.selectedClue === `across-${num}` ? 'selected' : ''}"
                     onclick="gameRegistry.getGame('crossword').selectClue('across', '${num}')">
                    <strong>${num}.</strong> ${clue.clue}
                </div>
            `).join('');
        }
        
        if (downEl) {
            downEl.innerHTML = Object.entries(this.currentPuzzle.down).map(([num, clue]) => `
                <div class="clue ${this.selectedClue === `down-${num}` ? 'selected' : ''}"
                     onclick="gameRegistry.getGame('crossword').selectClue('down', '${num}')">
                    <strong>${num}.</strong> ${clue.clue}
                </div>
            `).join('');
        }
    }
    
    selectCell(row, col) {
        const cell = this.grid[row][col];
        if (!cell || cell.black) return;
        
        this.selectedCell = { row, col };
        
        // Select associated clue
        if (cell.across) {
            this.selectedClue = `across-${cell.across}`;
        } else if (cell.down) {
            this.selectedClue = `down-${cell.down}`;
        }
        
        this.renderGrid();
        this.renderClues();
    }
    
    selectClue(direction, number) {
        this.selectedClue = `${direction}-${number}`;
        
        // Select first cell of this clue
        const clue = this.currentPuzzle[direction][number];
        this.selectedCell = { row: clue.row, col: clue.col };
        
        this.renderGrid();
        this.renderClues();
    }
    
    setupKeyboardHandler() {
        if (!this.container) return;
        
        document.addEventListener('keydown', (e) => {
            if (!this.selectedCell) return;
            
            const cell = this.grid[this.selectedCell.row][this.selectedCell.col];
            if (!cell) return;
            
            if (/^[A-ZÇĞIİÖŞÜa-zçğıiöşü]$/.test(e.key)) {
                // Letter input
                cell.userLetter = e.key.toUpperCase()
                    .replace('i', 'İ')
                    .replace('ı', 'I');
                this.moveToNextCell();
            } else if (e.key === 'Backspace') {
                cell.userLetter = '';
                this.moveToPreviousCell();
            } else if (e.key === 'ArrowUp') {
                this.moveUp();
            } else if (e.key === 'ArrowDown') {
                this.moveDown();
            } else if (e.key === 'ArrowLeft') {
                this.moveLeft();
            } else if (e.key === 'ArrowRight') {
                this.moveRight();
            }
            
            this.renderGrid();
        });
    }
    
    moveToNextCell() {
        // Move based on selected clue direction
        if (this.selectedClue?.startsWith('across')) {
            this.moveRight();
        } else if (this.selectedClue?.startsWith('down')) {
            this.moveDown();
        }
    }
    
    moveToPreviousCell() {
        if (this.selectedClue?.startsWith('across')) {
            this.moveLeft();
        } else if (this.selectedClue?.startsWith('down')) {
            this.moveUp();
        }
    }
    
    moveUp() {
        if (this.selectedCell.row > 0) {
            this.selectedCell.row--;
        }
    }
    
    moveDown() {
        if (this.selectedCell.row < 8) {
            this.selectedCell.row++;
        }
    }
    
    moveLeft() {
        if (this.selectedCell.col > 0) {
            this.selectedCell.col--;
        }
    }
    
    moveRight() {
        if (this.selectedCell.col < 8) {
            this.selectedCell.col++;
        }
    }
    
    checkAnswers() {
        let allCorrect = true;
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.grid[row][col];
                if (cell && !cell.black) {
                    if (cell.userLetter !== cell.letter) {
                        allCorrect = false;
                    }
                }
            }
        }
        
        if (allCorrect) {
            this.handleComplete();
        } else {
            alert('Some answers are incorrect. Keep trying!');
        }
        
        this.renderGrid();
    }
    
    revealAnswer() {
        if (!this.selectedCell) return;
        
        const cell = this.grid[this.selectedCell.row][this.selectedCell.col];
        if (cell) {
            cell.userLetter = cell.letter;
            this.renderGrid();
        }
    }
    
    resetPuzzle() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.grid[row][col];
                if (cell) {
                    cell.userLetter = '';
                }
            }
        }
        
        this.selectedCell = null;
        this.selectedClue = null;
        this.completed = false;
        
        this.renderGrid();
        this.renderClues();
        
        const messageEl = document.getElementById('completion-message');
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }
    
    handleComplete() {
        this.completed = true;
        const messageEl = document.getElementById('completion-message');
        if (messageEl) {
            messageEl.style.display = 'block';
        }
    }
    
    addStyles() {
        if (document.getElementById('crossword-inline-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'crossword-inline-styles';
        style.textContent = `
            .crossword-game-container {
                max-width: 900px;
                margin: 0 auto;
                padding: 20px;
            }
            .game-header {
                text-align: center;
                margin-bottom: 30px;
            }
            .crossword-content {
                display: flex;
                gap: 40px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .crossword-grid-container {
                flex: 0 0 auto;
            }
            .crossword-grid {
                display: grid;
                grid-template-columns: repeat(9, 40px);
                grid-template-rows: repeat(9, 40px);
                gap: 1px;
                background: #333;
                border: 2px solid #333;
                padding: 1px;
            }
            .grid-cell {
                background: white;
                position: relative;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .grid-cell.black {
                background: #333;
                cursor: default;
            }
            .grid-cell.selected {
                background: #fef3c7;
            }
            .grid-cell.correct .cell-letter {
                color: #059669;
            }
            .cell-number {
                position: absolute;
                top: 2px;
                left: 2px;
                font-size: 10px;
                font-weight: bold;
            }
            .cell-letter {
                font-size: 20px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .clues-container {
                flex: 1;
                min-width: 300px;
            }
            .clues-section {
                margin-bottom: 30px;
            }
            .clues-section h3 {
                margin-bottom: 15px;
                color: var(--color-primary-600, #4f46e5);
            }
            .clues-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .clue {
                padding: 10px;
                background: #f3f4f6;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .clue:hover {
                background: #e5e7eb;
            }
            .clue.selected {
                background: #dbeafe;
                border-left: 3px solid #3b82f6;
            }
            .game-controls {
                margin-top: 30px;
                display: flex;
                justify-content: center;
                gap: 15px;
            }
            .check-button, .reveal-button, .reset-button {
                padding: 10px 20px;
                border-radius: 6px;
                border: none;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .check-button {
                background: #10b981;
                color: white;
            }
            .reveal-button {
                background: #f59e0b;
                color: white;
            }
            .reset-button {
                background: #6b7280;
                color: white;
            }
            .completion-message {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 100;
            }
            .completion-message h2 {
                color: #10b981;
                margin-bottom: 10px;
            }
        `;
        document.head.appendChild(style);
    }
    
    getStatistics() {
        return {
            gamesPlayed: this.completed ? 1 : 0,
            wins: this.completed ? 1 : 0,
            losses: 0,
            winRate: 100
        };
    }
}

// Register the game
if (typeof gameRegistry !== 'undefined') {
    gameRegistry.register(new CrosswordGameModule());
    console.log('Crossword game registered');
}

// Export
if (typeof window !== 'undefined') {
    window.CrosswordGameModule = CrosswordGameModule;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrosswordGameModule;
}
