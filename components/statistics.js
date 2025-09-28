// Statistics Component for Wordle Mom Edition
// Displays game statistics and performance metrics

const Statistics = ({ storage, navigate }) => {
    const [stats, setStats] = React.useState(null);
    const [selectedTimeframe, setSelectedTimeframe] = React.useState('all');

    React.useEffect(() => {
        if (storage) {
            setStats(storage.getStats());
        }
    }, [storage]);

    if (!stats) {
        return (
            <div className="text-center">
                <div className="spinner">Loading statistics...</div>
            </div>
        );
    }

    const { overall, categories } = stats;

    // Calculate performance level
    const getPerformanceLevel = (percentage) => {
        if (percentage >= 80) return { level: 'Expert', color: 'text-purple-600', bg: 'bg-purple-100' };
        if (percentage >= 70) return { level: 'Great', color: 'text-green-600', bg: 'bg-green-100' };
        if (percentage >= 50) return { level: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        return { level: 'Learning', color: 'text-red-600', bg: 'bg-red-100' };
    };

    const performance = getPerformanceLevel(overall.winPercentage);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Mom's Wordle Statistics</h2>
                <div className={`inline-block px-4 py-1 rounded-full ${performance.bg}`}>
                    <span className={`font-semibold ${performance.color}`}>
                        {performance.level} Player
                    </span>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stat-label">Games Played</p>
                            <p className="stat-value text-blue-600">{overall.totalGames}</p>
                        </div>
                        <span className="text-3xl">🎮</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stat-label">Win Rate</p>
                            <p className={`stat-value ${performance.color}`}>
                                {overall.winPercentage}%
                            </p>
                        </div>
                        <span className="text-3xl">🏆</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stat-label">Current Streak</p>
                            <p className="stat-value text-orange-600">{overall.currentStreak}</p>
                        </div>
                        <span className="text-3xl">🔥</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stat-label">Best Streak</p>
                            <p className="stat-value text-purple-600">{overall.bestStreak}</p>
                        </div>
                        <span className="text-3xl">⭐</span>
                    </div>
                </div>
            </div>

            {/* Guess Distribution */}
            {overall.totalWins > 0 && (
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-xl font-bold mb-4">Guess Distribution</h3>
                    <GuessDistribution distribution={overall.guessDistribution} totalWins={overall.totalWins} />
                </div>
            )}

            {/* Category Performance */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-xl font-bold mb-4">Category Performance</h3>
                <CategoryPerformance categories={categories} />
            </div>

            {/* Recent Games */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-xl font-bold mb-4">Recent Games</h3>
                <RecentGames games={stats.recentGames || []} />
            </div>

            <button
                className="w-full text-center py-2 text-indigo-600 font-semibold hover:text-indigo-800"
                onClick={() => navigate('MENU')}
            >
                ← Back to Menu
            </button>
        </div>
    );
};

// Sub-components for Statistics
const GuessDistribution = ({ distribution, totalWins }) => {
    const maxCount = Math.max(...Object.values(distribution));

    return (
        <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map(guessNum => {
                const count = distribution[guessNum] || 0;
                const percentage = totalWins > 0 ? (count / totalWins) * 100 : 0;
                const width = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                    <div key={guessNum} className="flex items-center space-x-3">
                        <span className="w-4 text-sm font-medium">{guessNum}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div
                                className="bg-gradient-to-r from-green-500 to-green-400 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                style={{ width: `${Math.max(width, count > 0 ? 15 : 0)}%` }}
                            >
                                {count > 0 && (
                                    <span className="text-white text-xs font-medium">{count}</span>
                                )}
                            </div>
                        </div>
                        <span className="w-12 text-sm text-gray-600">{percentage.toFixed(0)}%</span>
                    </div>
                );
            })}
        </div>
    );
};

const CategoryPerformance = ({ categories }) => {
    return (
        <div className="space-y-3">
            {Object.entries(categories).map(([category, categoryStats]) => {
                const percentage = categoryStats.played > 0 ? categoryStats.percentage : 0;
                const performanceColor = percentage >= 70 ? 'bg-green-100 text-green-800' :
                    percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800';

                return (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <span className="font-medium">{CATEGORY_NAMES[category]}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600">{categoryStats.played} played</span>
                            <span className="text-gray-600">{categoryStats.won} won</span>
                            <span className={`font-medium px-2 py-1 rounded ${performanceColor}`}>
                                {percentage}%
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const RecentGames = ({ games }) => {
    if (games.length === 0) {
        return <p className="text-gray-500">No recent games</p>;
    }

    return (
        <div className="grid grid-cols-5 gap-2">
            {games.slice(0, 20).map((game, index) => (
                <div
                    key={game.id || index}
                    className={`aspect-square rounded border-2 flex flex-col items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform ${
                        game.isWin
                            ? 'border-green-500 bg-green-100 text-green-800'
                            : 'border-red-500 bg-red-100 text-red-800'
                    }`}
                    title={`${game.solution} - ${game.isWin ? 'Won' : 'Lost'} - ${new Date(game.timestamp).toLocaleDateString()}`}
                >
                    <div>{game.isWin ? (game.guessCount || '✓') : '✗'}</div>
                    <div className="text-[8px] mt-1">{game.solution.slice(0, 3)}</div>
                </div>
            ))}
        </div>
    );
};

// Export for use in main app and browser
if (typeof window !== 'undefined') {
    window.Statistics = Statistics;
    window.GuessDistribution = GuessDistribution;
    window.CategoryPerformance = CategoryPerformance;
    window.RecentGames = RecentGames;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Statistics;
}