// Main App Component for Wordle Mom Edition
// This is the root component that manages navigation and game state

const App = () => {
    const [page, setPage] = React.useState('MENU');
    const [gameHistory, addGameToHistory, storage] = useEnhancedStorage();
    const [gameConfig, setGameConfig] = React.useState({ mode: null, solution: null });
    const [gameLogic] = React.useState(() => new WordleGameLogic());

    // Handle mode selection and start new game
    const handleSelectMode = (mode) => {
        const solution = gameLogic.selectRandomWord(mode);
        setGameConfig({ mode, solution });
        setPage('GAME');
    };

    // Handle game over - save results and update history
    const handleGameOver = (gameResult) => {
        const enhancedGameData = {
            solution: gameConfig.solution,
            guesses: gameResult.guesses,
            isWin: gameResult.isWin,
            mode: gameConfig.mode,
            guessCount: gameResult.isWin ? gameResult.guesses.length : null,
            timestamp: new Date().toISOString(),
            stats: gameResult.stats || {}
        };
        
        addGameToHistory(enhancedGameData);
    };

    // Handle next word - stay in same mode
    const handleNextWord = () => {
        const { mode, solution: currentSolution } = gameConfig;
        if (mode) {
            const newSolution = gameLogic.selectRandomWord(mode, currentSolution);
            setGameConfig({ mode, solution: newSolution });
            // Force re-render of game component with new key
            setPage('GAME_REFRESH');
            setTimeout(() => setPage('GAME'), 0);
        }
    };

    // Navigation handler
    const navigate = React.useCallback((newPage) => {
        setPage(newPage);
    }, []);

    // Render the appropriate page based on state
    const renderPage = () => {
        switch (page) {
            case 'MENU':
                return <MainMenu navigate={navigate} />;
                
            case 'MODE_SELECT':
                return <GameModeMenu onSelectMode={handleSelectMode} />;
                
            case 'GAME':
            case 'GAME_REFRESH':
                return gameConfig.solution ? (
                    <WordleGame
                        key={`${gameConfig.solution}-${Date.now()}`}
                        solution={gameConfig.solution}
                        onGameOver={handleGameOver}
                        onNextWord={handleNextWord}
                        onBackToMenu={() => navigate('MENU')}
                    />
                ) : (
                    <div>Loading game...</div>
                );
                
            case 'LEADERBOARD':
                return <Leaderboard history={gameHistory} navigate={navigate} />;
                
            case 'STATISTICS':
                return <Statistics storage={storage} navigate={navigate} />;
                
            default:
                return <MainMenu navigate={navigate} />;
        }
    };

    return (
        <div className="app-container">
            {/* Optional: Add a header with consistent navigation */}
            {page !== 'MENU' && page !== 'GAME' && page !== 'GAME_REFRESH' && (
                <div className="mb-4">
                    <button
                        onClick={() => navigate('MENU')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Main Menu
                    </button>
                </div>
            )}
            
            {renderPage()}
            
            {/* Optional: Add version/credit footer */}
            <div className="mt-8 text-center text-xs text-gray-400">
                Wordle Mom Edition v1.0
            </div>
        </div>
    );
};

// Initialize the app
const initializeApp = () => {
    const container = document.getElementById('root');
    if (container) {
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
    } else {
        console.error('Root element not found!');
    }
};

// Export for testing or module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}