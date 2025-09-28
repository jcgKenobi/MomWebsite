// React Components for Wordle Mom Edition
// This file contains all the UI components separated from the main game logic

// --- MENU COMPONENTS ---
const MainMenu = ({ navigate }) => (
    <div className="text-center relative">
        <button
            onClick={() => window.location.href = 'index.html'}
            className="absolute top-0 left-0 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
            ← Back to Main Site
        </button>
        <h1 className="font-poppins text-6xl font-bold tracking-tighter mt-16">WORDLE</h1>
        <p className="text-xl font-semibold text-indigo-600 mb-12">Mom Edition</p>
        <button className="menu-button" onClick={() => navigate('MODE_SELECT')}>Play</button>
        <button className="menu-button" onClick={() => navigate('LEADERBOARD')}>Leaderboard</button>
        <button className="menu-button" onClick={() => navigate('STATISTICS')}>Statistics</button>
        <button className="menu-button" onClick={() => alert('Settings coming soon!')}>Settings</button>
    </div>
);

const GameModeMenu = ({ onSelectMode }) => (
    <div>
        <h2 className="text-3xl font-bold text-center mb-8">Select Mode</h2>
        <div className="mode-selection-grid">
            <div className="mode-card" onClick={() => onSelectMode('ENGLISH')}>
                <div className="mode-image-placeholder">English 🇬🇧</div>
                <h3>English</h3>
            </div>
            <div className="mode-card" onClick={() => onSelectMode('TURKEY')}>
                <div className="mode-image-placeholder">Turkey 🇹🇷</div>
                <h3>Türkiye</h3>
            </div>
            <div className="mode-card" onClick={() => onSelectMode('NATURE')}>
                <div className="mode-image-placeholder">Nature 🌿</div>
                <h3>Doğa</h3>
            </div>
        </div>
    </div>
);

// --- GAME COMPONENTS ---
const WordleGrid = React.memo(({ guesses, currentGuess, solution, isReplay = false }) => {
    const rows = React.useMemo(() => {
        return Array(6).fill(null).map((_, i) => {
            const guess = guesses[i];
            const isCurrentRow = !isReplay && (i === guesses.findIndex(g => g === null));
            return {
                id: i,
                guess: isCurrentRow ? currentGuess : guess ?? "",
                isSubmitted: guess != null
            };
        });
    }, [guesses, currentGuess, isReplay]);

    return (
        <div className="wordle-grid">
            {rows.map(({ id, guess, isSubmitted }) => (
                <Row key={id} guess={guess} solution={solution} isSubmitted={isSubmitted} />
            ))}
        </div>
    );
});

const Row = React.memo(({ guess, solution, isSubmitted }) => {
    const tiles = React.useMemo(() => {
        const result = [];
        for (let i = 0; i < 5; i++) {
            const char = guess[i];
            let className = "wordle-tile";
            if (isSubmitted && char) {
                if (solution[i] === char) { 
                    className += " correct"; 
                } else if (solution.includes(char)) { 
                    className += " present"; 
                } else { 
                    className += " absent"; 
                }
            } else if (char) { 
                className += " filled"; 
            }
            result.push(
                <div key={i} className={className}>
                    <div className="wordle-tile-content">{char}</div>
                </div>
            );
        }
        return result;
    }, [guess, solution, isSubmitted]);

    return <>{tiles}</>;
});

const Keyboard = React.memo(({ onKeyPress, keyStatuses }) => {
    const rows = GAME_CONFIG.KEYBOARD_LAYOUTS.TURKISH;

    return (
        <div className="keyboard-container">
            {rows.map((row, i) => (
                <div key={i} className="keyboard-row">
                    {row.map(key => {
                        const status = keyStatuses[key];
                        const keyClassName = `key ${status ? status : ''} ${(key === "ENTER" || key === "BACKSPACE") ? 'special' : ''}`;
                        const displayKey = SPECIAL_KEYS[key] || key;
                        
                        return (
                            <button
                                key={key}
                                className={keyClassName}
                                onClick={() => onKeyPress(key)}
                            >
                                {displayKey}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
});

const EndOfRoundMenu = ({ status, solution, onNextWord, onBackToMenu }) => {
    const [isAnswerVisible, setIsAnswerVisible] = React.useState(false);
    const isWin = status === 'won';
    
    return (
        <div className="end-round-modal">
            <h2 className={`end-round-title ${isWin ? 'win' : 'loss'}`}>
                {isWin ? "Correct!" : "WRONG!"}
            </h2>
            {isAnswerVisible && (
                <p className="text-lg font-semibold mb-4">
                    The word was: <span className="font-bold text-indigo-600">{solution}</span>
                </p>
            )}
            <div className="flex flex-col gap-4 w-3/4">
                {!isWin && !isAnswerVisible && (
                    <button 
                        className="menu-button bg-yellow-500 hover:bg-yellow-600" 
                        onClick={() => setIsAnswerVisible(true)}
                    >
                        Show Answer
                    </button>
                )}
                <button 
                    className="menu-button bg-indigo-500 hover:bg-indigo-600" 
                    onClick={onNextWord}
                >
                    Next Word
                </button>
                <button 
                    className="menu-button secondary" 
                    onClick={onBackToMenu}
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

// --- LEADERBOARD COMPONENT ---
const Leaderboard = ({ history, navigate }) => {
    const [selectedGame, setSelectedGame] = React.useState(history.length > 0 ? history[0] : null);

    return (
        <div>
            <h2 className="text-3xl font-bold text-center mb-8">Previous Games</h2>
            <div className="leaderboard-container">
                <div className="leaderboard-list">
                    {history.length === 0 ? (
                        <p className="text-gray-500 text-center">No games played yet.</p>
                    ) : (
                        history.map((game, index) => (
                            <div
                                key={game.id || index}
                                className={`leaderboard-item ${game.isWin ? 'win' : 'loss'} ${selectedGame === game ? 'selected' : ''}`}
                                onClick={() => setSelectedGame(game)}
                            >
                                <span>{game.solution}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                    {new Date(game.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
                <div className="leaderboard-preview">
                    {selectedGame ? (
                        <WordleGrid 
                            guesses={selectedGame.guesses} 
                            solution={selectedGame.solution} 
                            isReplay={true} 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select a game to view
                        </div>
                    )}
                </div>
            </div>
            <button 
                className="mt-8 w-full text-center py-2 text-indigo-600 font-semibold hover:text-indigo-800" 
                onClick={() => navigate('MENU')}
            >
                ← Back to Menu
            </button>
        </div>
    );
};

// Export components for use in main app and browser
if (typeof window !== 'undefined') {
    window.MainMenu = MainMenu;
    window.GameModeMenu = GameModeMenu;
    window.WordleGrid = WordleGrid;
    window.Keyboard = Keyboard;
    window.EndOfRoundMenu = EndOfRoundMenu;
    window.Leaderboard = Leaderboard;
    window.Row = Row;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MainMenu,
        GameModeMenu,
        WordleGrid,
        Keyboard,
        EndOfRoundMenu,
        Leaderboard,
        Row
    };
}