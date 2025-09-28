// Game Logic Utilities for Wordle

class WordleGameLogic {
    constructor() {
        this.usedWords = new Set();
    }

    /**
     * Select a random word from the word bank, avoiding recent repeats
     * @param {string} mode - Game mode (ENGLISH, TURKEY, NATURE)
     * @param {string} excludeWord - Word to exclude from selection
     * @returns {string} Selected word
     */
    selectRandomWord(mode, excludeWord = null) {
        const wordBank = WORD_BANKS[mode];
        if (!wordBank) {
            throw new Error(`Invalid game mode: ${mode}`);
        }

        let availableWords = wordBank.filter(word => 
            word !== excludeWord && !this.usedWords.has(word)
        );

        // If all words used, reset and exclude only current word
        if (availableWords.length === 0) {
            availableWords = wordBank.filter(word => word !== excludeWord);
            this.usedWords.clear();
        }

        const randomIndex = Math.floor(Math.random() * availableWords.length);
        const selectedWord = availableWords[randomIndex];
        
        this.usedWords.add(selectedWord);
        return selectedWord;
    }

    /**
     * Evaluate a guess against the solution
     * @param {string} guess - The guessed word
     * @param {string} solution - The correct word
     * @returns {Array} Array of letter states (correct, present, absent)
     */
    evaluateGuess(guess, solution) {
        const result = [];
        const solutionArray = solution.split('');
        const guessArray = guess.split('');
        
        // First pass: mark correct positions
        const solutionCopy = [...solutionArray];
        const correctPositions = [];
        
        for (let i = 0; i < guessArray.length; i++) {
            if (guessArray[i] === solutionArray[i]) {
                result[i] = 'correct';
                correctPositions.push(i);
                solutionCopy[i] = null; // Mark as used
            }
        }
        
        // Second pass: mark present letters
        for (let i = 0; i < guessArray.length; i++) {
            if (result[i] === 'correct') continue;
            
            const letterIndex = solutionCopy.indexOf(guessArray[i]);
            if (letterIndex !== -1) {
                result[i] = 'present';
                solutionCopy[letterIndex] = null; // Mark as used
            } else {
                result[i] = 'absent';
            }
        }
        
        return result;
    }

    /**
     * Update keyboard key statuses based on guess evaluation
     * @param {Object} currentStatuses - Current keyboard key statuses
     * @param {string} guess - The guessed word
     * @param {Array} evaluation - Evaluation result from evaluateGuess
     * @returns {Object} Updated key statuses
     */
    updateKeyStatuses(currentStatuses, guess, evaluation) {
        const newStatuses = { ...currentStatuses };
        
        for (let i = 0; i < guess.length; i++) {
            const char = guess[i];
            const status = evaluation[i];
            
            // Priority: correct > present > absent
            if (!newStatuses[char] || status === 'correct') {
                newStatuses[char] = status;
            } else if (newStatuses[char] === 'absent' && status === 'present') {
                newStatuses[char] = status;
            }
        }
        
        return newStatuses;
    }

    /**
     * Check if the guess is valid
     * @param {string} guess - The guessed word
     * @param {number} wordLength - Required word length
     * @returns {boolean} Whether the guess is valid
     */
    isValidGuess(guess, wordLength = 5) {
        return guess.length === wordLength;
    }

    /**
     * Check if the game is won
     * @param {string} guess - The guessed word
     * @param {string} solution - The correct word
     * @returns {boolean} Whether the game is won
     */
    isWin(guess, solution) {
        return guess === solution;
    }

    /**
     * Check if the game is over
     * @param {number} guessCount - Number of guesses made
     * @param {number} maxGuesses - Maximum allowed guesses
     * @param {boolean} isWin - Whether the game is won
     * @returns {boolean} Whether the game is over
     */
    isGameOver(guessCount, maxGuesses, isWin) {
        return isWin || guessCount >= maxGuesses;
    }

    /**
     * Calculate game statistics
     * @param {Array} guesses - Array of guesses made
     * @param {boolean} isWin - Whether the game was won
     * @returns {Object} Game statistics
     */
    calculateGameStats(guesses, isWin) {
        return {
            totalGuesses: guesses.length,
            isWin: isWin,
            efficiency: isWin ? Math.round((6 - guesses.length + 1) / 6 * 100) : 0
        };
    }
}

// Keyboard input handler utilities
class KeyboardHandler {
    constructor(onKeyPress) {
        this.onKeyPress = onKeyPress;
        this.enabled = true;
    }

    /**
     * Handle keyboard input
     * @param {string} key - The pressed key
     */
    handleKey(key) {
        if (!this.enabled) return;
        
        const upperKey = key.toUpperCase();
        
        // Handle special keys
        if (upperKey === 'ENTER' || upperKey === 'RETURN') {
            this.onKeyPress('ENTER');
        } else if (upperKey === 'BACKSPACE' || upperKey === 'DELETE') {
            this.onKeyPress('BACKSPACE');
        } else if (/^[A-ZÜĞIŞÖÇ]$/.test(upperKey)) {
            this.onKeyPress(upperKey);
        }
    }

    /**
     * Enable keyboard input
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable keyboard input
     */
    disable() {
        this.enabled = false;
    }
}

// Animation utilities
const AnimationUtils = {
    /**
     * Animate tile reveal
     * @param {HTMLElement} tile - The tile element
     * @param {string} status - The tile status (correct, present, absent)
     * @param {number} delay - Animation delay in ms
     */
    animateTileReveal(tile, status, delay = 0) {
        setTimeout(() => {
            tile.classList.add('flip');
            setTimeout(() => {
                tile.classList.add(status);
            }, 250);
        }, delay);
    },

    /**
     * Animate row shake for invalid guess
     * @param {HTMLElement} row - The row element
     */
    animateInvalidGuess(row) {
        row.classList.add('shake');
        setTimeout(() => {
            row.classList.remove('shake');
        }, 500);
    },

    /**
     * Animate win celebration
     * @param {HTMLElement} grid - The grid element
     */
    animateWin(grid) {
        const tiles = grid.querySelectorAll('.wordle-tile.correct');
        tiles.forEach((tile, index) => {
            setTimeout(() => {
                tile.classList.add('bounce');
            }, index * 100);
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WordleGameLogic,
        KeyboardHandler,
        AnimationUtils
    };
}