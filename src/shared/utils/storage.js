// Enhanced Storage System for Wordle: Mom Edition
// This provides comprehensive game tracking across browser sessions

const STORAGE_KEYS = {
    GAME_HISTORY: 'wordleMomHistory',
    DAILY_STATS: 'wordleMomDailyStats', 
    OVERALL_STATS: 'wordleMomOverallStats',
    STREAKS: 'wordleMomStreaks',
    CATEGORY_STATS: 'wordleMomCategoryStats'
};

class WordleStorage {
    constructor() {
        this.initializeStorage();
    }

    // Initialize storage with default values if not exists
    initializeStorage() {
        if (!this.getItem(STORAGE_KEYS.OVERALL_STATS)) {
            this.setItem(STORAGE_KEYS.OVERALL_STATS, {
                totalGames: 0,
                totalWins: 0,
                winPercentage: 0,
                averageGuesses: 0,
                bestStreak: 0,
                currentStreak: 0,
                guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
                firstPlayed: null,
                lastPlayed: null
            });
        }

        if (!this.getItem(STORAGE_KEYS.CATEGORY_STATS)) {
            this.setItem(STORAGE_KEYS.CATEGORY_STATS, {
                ENGLISH: { played: 0, won: 0, percentage: 0 },
                TURKEY: { played: 0, won: 0, percentage: 0 },
                NATURE: { played: 0, won: 0, percentage: 0 }
            });
        }

        if (!this.getItem(STORAGE_KEYS.GAME_HISTORY)) {
            this.setItem(STORAGE_KEYS.GAME_HISTORY, []);
        }

        if (!this.getItem(STORAGE_KEYS.DAILY_STATS)) {
            this.setItem(STORAGE_KEYS.DAILY_STATS, {});
        }
    }

    // Safe localStorage operations with error handling
    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return null;
        }
    }

    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
            return false;
        }
    }

    // Get today's date as YYYY-MM-DD
    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    // Add a new game result
    addGameResult(gameData) {
        const {
            solution,
            guesses,
            isWin,
            mode,
            guessCount,
            timeSpent = null
        } = gameData;

        const today = this.getTodayKey();
        const timestamp = new Date().toISOString();

        // Create game record
        const gameRecord = {
            id: Date.now(),
            date: today,
            timestamp,
            solution,
            guesses: guesses.slice(), // Copy array
            isWin,
            mode,
            guessCount: isWin ? guessCount : null,
            timeSpent
        };

        // Update game history (keep last 100 games)
        const history = this.getItem(STORAGE_KEYS.GAME_HISTORY) || [];
        history.unshift(gameRecord);
        if (history.length > 100) {
            history.splice(100);
        }
        this.setItem(STORAGE_KEYS.GAME_HISTORY, history);

        // Update overall stats
        this.updateOverallStats(gameRecord);

        // Update category stats
        this.updateCategoryStats(mode, isWin);

        // Update daily stats
        this.updateDailyStats(today, gameRecord);

        // Update streaks
        this.updateStreaks(isWin);

        return gameRecord;
    }

    updateOverallStats(gameRecord) {
        const stats = this.getItem(STORAGE_KEYS.OVERALL_STATS);
        
        stats.totalGames++;
        if (gameRecord.isWin) {
            stats.totalWins++;
            if (gameRecord.guessCount) {
                stats.guessDistribution[gameRecord.guessCount]++;
            }
        }

        stats.winPercentage = Math.round((stats.totalWins / stats.totalGames) * 100);
        
        // Calculate average guesses (only for wins)
        const totalGuessesForWins = Object.entries(stats.guessDistribution)
            .reduce((sum, [guesses, count]) => sum + (parseInt(guesses) * count), 0);
        stats.averageGuesses = stats.totalWins > 0 ? 
            Math.round((totalGuessesForWins / stats.totalWins) * 10) / 10 : 0;

        // Update play dates
        if (!stats.firstPlayed) {
            stats.firstPlayed = gameRecord.timestamp;
        }
        stats.lastPlayed = gameRecord.timestamp;

        this.setItem(STORAGE_KEYS.OVERALL_STATS, stats);
    }

    updateCategoryStats(mode, isWin) {
        const categoryStats = this.getItem(STORAGE_KEYS.CATEGORY_STATS);
        
        if (categoryStats[mode]) {
            categoryStats[mode].played++;
            if (isWin) {
                categoryStats[mode].won++;
            }
            categoryStats[mode].percentage = Math.round(
                (categoryStats[mode].won / categoryStats[mode].played) * 100
            );
        }

        this.setItem(STORAGE_KEYS.CATEGORY_STATS, categoryStats);
    }

    updateDailyStats(dateKey, gameRecord) {
        const dailyStats = this.getItem(STORAGE_KEYS.DAILY_STATS) || {};
        
        if (!dailyStats[dateKey]) {
            dailyStats[dateKey] = {
                played: 0,
                won: 0,
                games: []
            };
        }

        dailyStats[dateKey].played++;
        if (gameRecord.isWin) {
            dailyStats[dateKey].won++;
        }
        dailyStats[dateKey].games.push({
            solution: gameRecord.solution,
            isWin: gameRecord.isWin,
            mode: gameRecord.mode,
            timestamp: gameRecord.timestamp
        });

        this.setItem(STORAGE_KEYS.DAILY_STATS, dailyStats);
    }

    updateStreaks(isWin) {
        const stats = this.getItem(STORAGE_KEYS.OVERALL_STATS);
        
        if (isWin) {
            stats.currentStreak++;
            if (stats.currentStreak > stats.bestStreak) {
                stats.bestStreak = stats.currentStreak;
            }
        } else {
            stats.currentStreak = 0;
        }

        this.setItem(STORAGE_KEYS.OVERALL_STATS, stats);
    }

    // Get comprehensive statistics
    getStats() {
        return {
            overall: this.getItem(STORAGE_KEYS.OVERALL_STATS),
            categories: this.getItem(STORAGE_KEYS.CATEGORY_STATS),
            daily: this.getItem(STORAGE_KEYS.DAILY_STATS),
            recentGames: this.getRecentGames(10)
        };
    }

    // Get games from specific date
    getGamesByDate(dateKey) {
        const dailyStats = this.getItem(STORAGE_KEYS.DAILY_STATS) || {};
        return dailyStats[dateKey] || { played: 0, won: 0, games: [] };
    }

    // Get recent games
    getRecentGames(limit = 10) {
        const history = this.getItem(STORAGE_KEYS.GAME_HISTORY) || [];
        return history.slice(0, limit);
    }

    // Get games by date range
    getGamesByDateRange(startDate, endDate) {
        const history = this.getItem(STORAGE_KEYS.GAME_HISTORY) || [];
        return history.filter(game => {
            const gameDate = game.date;
            return gameDate >= startDate && gameDate <= endDate;
        });
    }

    // Get today's games
    getTodaysGames() {
        return this.getGamesByDate(this.getTodayKey());
    }

    // Export all data (for backup)
    exportData() {
        return {
            overall: this.getItem(STORAGE_KEYS.OVERALL_STATS),
            categories: this.getItem(STORAGE_KEYS.CATEGORY_STATS),
            daily: this.getItem(STORAGE_KEYS.DAILY_STATS),
            history: this.getItem(STORAGE_KEYS.GAME_HISTORY),
            exportDate: new Date().toISOString()
        };
    }

    // Import data (for restore)
    importData(data) {
        try {
            if (data.overall) this.setItem(STORAGE_KEYS.OVERALL_STATS, data.overall);
            if (data.categories) this.setItem(STORAGE_KEYS.CATEGORY_STATS, data.categories);
            if (data.daily) this.setItem(STORAGE_KEYS.DAILY_STATS, data.daily);
            if (data.history) this.setItem(STORAGE_KEYS.GAME_HISTORY, data.history);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data
    clearAllData() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initializeStorage();
    }
}

// Usage example:
/*
const storage = new WordleStorage();

// Add a game result
storage.addGameResult({
    solution: "CANIM",
    guesses: ["HELLO", "WORLD", "CANIM"],
    isWin: true,
    mode: "BEAN",
    guessCount: 3,
    timeSpent: 120 // seconds
});

// Get comprehensive stats
const stats = storage.getStats();
console.log(stats);

// Get today's games
const todaysGames = storage.getTodaysGames();
console.log(todaysGames);
*/

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordleStorage;
} else if (typeof window !== 'undefined') {
    window.WordleStorage = WordleStorage;
}
