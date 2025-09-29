// Enhanced Statistics Component for Wordle: Mom Edition
// This creates beautiful visualizations of Mom's game statistics

// Add this component to your WorldeForkImproved.html file

const StatsVisualizer = ({ storage }) => {
    const [stats, setStats] = useState(null);
    const [selectedTimeframe, setSelectedTimeframe] = useState('all'); // 'all', 'week', 'month'
    
    useEffect(() => {
        if (storage) {
            setStats(storage.getStats());
        }
    }, [storage]);

    if (!stats) return <div>Loading stats...</div>;

    const { overall, categories, daily } = stats;

    // Calculate timeframe-specific stats
    const getTimeframeStats = () => {
        const today = new Date();
        let startDate;
        
        switch (selectedTimeframe) {
            case 'week':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(today);
                startDate.setMonth(today.getMonth() - 1);
                break;
            default:
                return overall;
        }
        
        const games = storage.getGamesByDateRange(
            startDate.toISOString().split('T')[0],
            today.toISOString().split('T')[0]
        );
        
        const won = games.filter(g => g.isWin).length;
        return {
            totalGames: games.length,
            totalWins: won,
            winPercentage: games.length > 0 ? Math.round((won / games.length) * 100) : 0
        };
    };

    const timeframeStats = getTimeframeStats();

    return (
        <div className="stats-container space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Mom's Wordle Stats</h2>
                <div className="flex justify-center space-x-2 mb-6">
                    {['all', 'week', 'month'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedTimeframe(period)}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                selectedTimeframe === period
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {period === 'all' ? 'All Time' : `Past ${period}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Games Played"
                    value={timeframeStats.totalGames}
                    icon="🎮"
                />
                <StatCard
                    title="Win Rate"
                    value={`${timeframeStats.winPercentage}%`}
                    icon="🏆"
                    color={timeframeStats.winPercentage >= 70 ? 'green' : timeframeStats.winPercentage >= 50 ? 'yellow' : 'red'}
                />
                <StatCard
                    title="Current Streak"
                    value={overall.currentStreak}
                    icon="🔥"
                />
                <StatCard
                    title="Best Streak"
                    value={overall.bestStreak}
                    icon="⭐"
                />
            </div>

            {/* Guess Distribution (All Time Only) */}
            {selectedTimeframe === 'all' && overall.totalWins > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">Guess Distribution</h3>
                    <GuessDistributionChart distribution={overall.guessDistribution} totalWins={overall.totalWins} />
                </div>
            )}

            {/* Category Performance */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Category Performance</h3>
                <div className="space-y-3">
                    {Object.entries(categories).map(([category, stats]) => (
                        <CategoryRow key={category} category={category} stats={stats} />
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Recent Games</h3>
                <RecentGamesGrid games={stats.recentGames} />
            </div>

            {/* Calendar View (if you want to add this later) */}
            {selectedTimeframe === 'all' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">Calendar View</h3>
                    <CalendarHeatmap dailyStats={daily} />
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, color = 'blue' }) => {
    const colorClasses = {
        green: 'border-green-200 bg-green-50',
        yellow: 'border-yellow-200 bg-yellow-50',
        red: 'border-red-200 bg-red-50',
        blue: 'border-blue-200 bg-blue-50'
    };

    return (
        <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <span className="text-2xl">{icon}</span>
            </div>
        </div>
    );
};

const GuessDistributionChart = ({ distribution, totalWins }) => {
    const maxCount = Math.max(...Object.values(distribution));
    
    return (
        <div className="space-y-2">
            {Object.entries(distribution).map(([guesses, count]) => {
                const percentage = totalWins > 0 ? (count / totalWins) * 100 : 0;
                const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                    <div key={guesses} className="flex items-center space-x-3">
                        <span className="w-4 text-sm font-medium">{guesses}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div
                                className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${width}%` }}
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

const CategoryRow = ({ category, stats }) => {
    const categoryNames = {
        ENGLISH: '🇬🇧 English',
        TURKEY: '🇹🇷 Türkiye', 
        NATURE: '🌿 Doğa'
    };

    const percentage = stats.played > 0 ? stats.percentage : 0;
    
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
                <span className="font-medium">{categoryNames[category]}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">{stats.played} played</span>
                <span className="text-gray-600">{stats.won} won</span>
                <span className={`font-medium px-2 py-1 rounded ${
                    percentage >= 70 ? 'bg-green-100 text-green-800' :
                    percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {percentage}%
                </span>
            </div>
        </div>
    );
};

const RecentGamesGrid = ({ games }) => {
    if (!games || games.length === 0) {
        return <p className="text-gray-500">No recent games</p>;
    }

    return (
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {games.map((game, index) => (
                <div
                    key={game.id || index}
                    className={`aspect-square rounded border-2 flex items-center justify-center text-xs font-bold ${
                        game.isWin
                            ? 'border-green-500 bg-green-100 text-green-800'
                            : 'border-red-500 bg-red-100 text-red-800'
                    }`}
                    title={`${game.solution} - ${game.isWin ? 'Won' : 'Lost'} - ${new Date(game.timestamp).toLocaleDateString()}`}
                >
                    {game.isWin ? game.guessCount || '✓' : '✗'}
                </div>
            ))}
        </div>
    );
};

const CalendarHeatmap = ({ dailyStats }) => {
    const today = new Date();
    const pastDays = 30; // Show last 30 days
    const days = [];
    
    for (let i = pastDays - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const dayStats = dailyStats[dateKey] || { played: 0, won: 0 };
        
        days.push({
            date: dateKey,
            day: date.getDate(),
            dayName: date.toLocaleDateString('en', { weekday: 'short' }),
            ...dayStats
        });
    }

    return (
        <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
                const intensity = day.played === 0 ? 0 :
                    day.played === 1 ? 1 :
                    day.played <= 3 ? 2 :
                    day.played <= 5 ? 3 : 4;
                
                const colors = [
                    'bg-gray-100',
                    'bg-green-100',
                    'bg-green-200', 
                    'bg-green-300',
                    'bg-green-400'
                ];

                return (
                    <div
                        key={day.date}
                        className={`aspect-square rounded text-xs flex items-center justify-center ${colors[intensity]} border`}
                        title={`${day.date}: ${day.played} games, ${day.won} won`}
                    >
                        {day.day}
                    </div>
                );
            })}
        </div>
    );
};

// Usage in your main app:
/*
// In your main App component, add:
const [storage] = useState(() => new WordleStorage());

// Add to your page routing:
case 'STATS':
    return <StatsVisualizer storage={storage} />;

// Add stats button to main menu:
<button className="menu-button" onClick={() => navigate('STATS')}>Statistics</button>
*/
