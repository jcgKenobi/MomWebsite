// Enhanced Storage Hook for Wordle
// Custom React hook for managing game storage and history

const useEnhancedStorage = () => {
    const [storage] = React.useState(() => {
        // Check if WordleStorage is available (from enhanced-storage.js)
        if (typeof WordleStorage !== 'undefined') {
            return new WordleStorage();
        }
        // Fallback to basic localStorage implementation
        return new BasicStorage();
    });
    
    const [gameHistory, setGameHistory] = React.useState([]);

    // Load initial game history
    React.useEffect(() => {
        if (storage) {
            const recentGames = storage.getRecentGames ? 
                storage.getRecentGames(10) : 
                storage.getAllGames();
            setGameHistory(recentGames);
        }
    }, [storage]);

    // Add a new game to history
    const addGameToHistory = React.useCallback((gameData) => {
        const gameRecord = storage.addGameResult ? 
            storage.addGameResult(gameData) : 
            storage.saveGame(gameData);
            
        const updatedHistory = storage.getRecentGames ? 
            storage.getRecentGames(10) : 
            storage.getAllGames();
            
        setGameHistory(updatedHistory);
        return gameRecord;
    }, [storage]);

    return [gameHistory, addGameToHistory, storage];
};

// Basic storage fallback implementation
class BasicStorage {
    constructor() {
        this.storageKey = 'wordle_games';
        this.loadGames();
    }

    loadGames() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.games = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading games:', error);
            this.games = [];
        }
    }

    saveGames() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.games));
        } catch (error) {
            console.error('Error saving games:', error);
        }
    }

    saveGame(gameData) {
        const gameRecord = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...gameData
        };
        
        this.games.unshift(gameRecord);
        this.saveGames();
        return gameRecord;
    }

    getAllGames() {
        return this.games;
    }

    getStats() {
        const games = this.games;
        const totalGames = games.length;
        const wins = games.filter(g => g.isWin);
        const totalWins = wins.length;
        
        // Calculate guess distribution
        const guessDistribution = {};
        for (let i = 1; i <= 6; i++) {
            guessDistribution[i] = wins.filter(g => g.guessCount === i).length;
        }
        
        // Calculate streaks
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;
        
        for (let i = 0; i < games.length; i++) {
            if (games[i].isWin) {
                tempStreak++;
                if (i === 0) currentStreak = tempStreak;
                bestStreak = Math.max(bestStreak, tempStreak);
            } else {
                tempStreak = 0;
                if (i === 0) currentStreak = 0;
            }
        }
        
        // Calculate category stats
        const categories = {};
        const modes = ['ENGLISH', 'TURKEY', 'NATURE'];
        
        modes.forEach(mode => {
            const modeGames = games.filter(g => g.mode === mode);
            const modeWins = modeGames.filter(g => g.isWin);
            
            categories[mode] = {
                played: modeGames.length,
                won: modeWins.length,
                percentage: modeGames.length > 0 ? 
                    Math.round((modeWins.length / modeGames.length) * 100) : 0
            };
        });
        
        return {
            overall: {
                totalGames,
                totalWins,
                winPercentage: totalGames > 0 ? 
                    Math.round((totalWins / totalGames) * 100) : 0,
                currentStreak,
                bestStreak,
                guessDistribution
            },
            categories,
            recentGames: games.slice(0, 20)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        useEnhancedStorage,
        BasicStorage
    };
}