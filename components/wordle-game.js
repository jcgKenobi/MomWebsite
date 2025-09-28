// Wordle Game Core Component
// Handles the main game logic and state management

const WordleGame = ({ solution, onGameOver, onNextWord, onBackToMenu }) => {
    const [guesses, setGuesses] = React.useState(Array(6).fill(null));
    const [currentGuess, setCurrentGuess] = React.useState("");
    const [roundStatus, setRoundStatus] = React.useState('playing'); // 'playing', 'won', 'lost'
    const [keyStatuses, setKeyStatuses] = React.useState({});
    const [gameLogic] = React.useState(() => new WordleGameLogic());
    const [keyboardHandler, setKeyboardHandler] = React.useState(null);

    // Initialize keyboard handler
    React.useEffect(() => {
        const handler = new KeyboardHandler((key) => handleKeyPress(key));
        setKeyboardHandler(handler);
        
        const handleKeyDown = (e) => handler.handleKey(e.key);
        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentGuess, roundStatus, guesses, solution, keyStatuses]);

    const handleEndRound = (isWin) => {
        if (keyboardHandler) {
            keyboardHandler.disable();
        }
        
        const finalGuesses = [...guesses];
        const currentGuessIndex = guesses.findIndex(g => g === null);
        if (currentGuessIndex !== -1) {
            finalGuesses[currentGuessIndex] = currentGuess;
        }
        
        const stats = gameLogic.calculateGameStats(
            finalGuesses.filter(Boolean), 
            isWin
        );
        
        onGameOver({
            solution,
            guesses: finalGuesses.filter(Boolean),
            isWin,
            stats
        });
        
        setRoundStatus(isWin ? 'won' : 'lost');
    };

    const handleKeyPress = React.useCallback((key) => {
        if (roundStatus !== 'playing') return;

        if (key === "ENTER") {
            // Validate guess
            if (!gameLogic.isValidGuess(currentGuess, GAME_CONFIG.WORD_LENGTH)) {
                // Could add a shake animation here
                return;
            }

            // Evaluate the guess
            const evaluation = gameLogic.evaluateGuess(currentGuess, solution);
            
            // Update keyboard statuses
            const newKeyStatuses = gameLogic.updateKeyStatuses(
                keyStatuses, 
                currentGuess, 
                evaluation
            );
            setKeyStatuses(newKeyStatuses);

            // Update guesses
            const newGuesses = [...guesses];
            const currentGuessIndex = guesses.findIndex(g => g === null);
            newGuesses[currentGuessIndex] = currentGuess;
            setGuesses(newGuesses);
            
            // Check win condition
            if (gameLogic.isWin(currentGuess, solution)) {
                handleEndRound(true);
            } else if (currentGuessIndex === GAME_CONFIG.MAX_GUESSES - 1) {
                handleEndRound(false);
            } else {
                setCurrentGuess("");
            }
        } else if (key === "BACKSPACE") {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (currentGuess.length < GAME_CONFIG.WORD_LENGTH && /^[A-ZÜĞIŞÖÇ]$/.test(key)) {
            setCurrentGuess(prev => prev + key);
        }
    }, [currentGuess, roundStatus, guesses, solution, keyStatuses, gameLogic]);

    const handleNextWordClick = () => {
        // Reset game state
        setGuesses(Array(6).fill(null));
        setCurrentGuess("");
        setRoundStatus('playing');
        setKeyStatuses({});
        if (keyboardHandler) {
            keyboardHandler.enable();
        }
        onNextWord();
    };

    return (
        <div className="wordle-container">
            <div className="mb-4 text-center">
                <span className="text-sm text-gray-600">
                    Guess {guesses.filter(g => g !== null).length + 1} of {GAME_CONFIG.MAX_GUESSES}
                </span>
            </div>
            
            <WordleGrid 
                guesses={guesses} 
                currentGuess={currentGuess} 
                solution={solution} 
            />
            
            <Keyboard 
                onKeyPress={handleKeyPress} 
                keyStatuses={keyStatuses} 
            />
            
            {roundStatus !== 'playing' && (
                <EndOfRoundMenu
                    status={roundStatus}
                    solution={solution}
                    onNextWord={handleNextWordClick}
                    onBackToMenu={onBackToMenu}
                />
            )}
        </div>
    );
};

// Export for use in main app and browser
if (typeof window !== 'undefined') {
    window.WordleGame = WordleGame;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordleGame;
}