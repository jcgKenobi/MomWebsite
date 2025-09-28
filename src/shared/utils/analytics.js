/**
 * Analytics Utility
 * Centralized analytics tracking for all games and user interactions
 */

class Analytics {
    constructor(config = {}) {
        this.enabled = config.enabled !== false;
        this.debug = config.debug || false;
        this.provider = config.provider || 'console'; // 'console', 'google', 'custom'
        this.userId = config.userId || this.generateUserId();
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.startTime = Date.now();
        
        // Initialize provider
        this.initializeProvider();
    }
    
    /**
     * Initialize analytics provider
     */
    initializeProvider() {
        if (!this.enabled) return;
        
        switch (this.provider) {
            case 'google':
                this.initializeGoogleAnalytics();
                break;
            case 'custom':
                this.initializeCustomProvider();
                break;
            default:
                // Console provider (default)
                break;
        }
        
        // Track session start
        this.trackEvent('session_start', {
            userId: this.userId,
            sessionId: this.sessionId
        });
    }
    
    /**
     * Initialize Google Analytics
     */
    initializeGoogleAnalytics() {
        if (typeof window !== 'undefined' && window.gtag) {
            console.log('Google Analytics initialized');
        } else {
            console.warn('Google Analytics not found, falling back to console');
            this.provider = 'console';
        }
    }
    
    /**
     * Initialize custom analytics provider
     */
    initializeCustomProvider() {
        // Custom implementation here
        console.log('Custom analytics provider initialized');
    }
    
    /**
     * Track an event
     */
    trackEvent(eventName, eventData = {}) {
        if (!this.enabled) return;
        
        const event = {
            name: eventName,
            data: eventData,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId
        };
        
        // Store event
        this.events.push(event);
        
        // Send to provider
        this.sendToProvider(event);
        
        if (this.debug) {
            console.log('📊 Analytics Event:', event);
        }
    }
    
    /**
     * Send event to provider
     */
    sendToProvider(event) {
        switch (this.provider) {
            case 'google':
                if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', event.name, {
                        ...event.data,
                        event_category: 'game',
                        event_label: event.sessionId
                    });
                }
                break;
                
            case 'custom':
                // Send to custom endpoint
                this.sendToCustomEndpoint(event);
                break;
                
            default:
                // Console provider - already logged in debug mode
                break;
        }
    }
    
    /**
     * Send to custom endpoint
     */
    async sendToCustomEndpoint(event) {
        // Implement custom endpoint logic
        // Example:
        // await fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(event)
        // });
    }
    
    /**
     * Track page view
     */
    trackPageView(page, title) {
        this.trackEvent('page_view', {
            page,
            title,
            url: typeof window !== 'undefined' ? window.location.href : ''
        });
    }
    
    /**
     * Track game start
     */
    trackGameStart(gameId, gameMode) {
        this.trackEvent('game_start', {
            game_id: gameId,
            game_mode: gameMode
        });
    }
    
    /**
     * Track game end
     */
    trackGameEnd(gameId, result) {
        this.trackEvent('game_end', {
            game_id: gameId,
            won: result.won,
            score: result.score,
            duration: result.duration,
            moves: result.moves
        });
    }
    
    /**
     * Track user action
     */
    trackAction(action, category, label, value) {
        this.trackEvent('user_action', {
            action,
            category,
            label,
            value
        });
    }
    
    /**
     * Track error
     */
    trackError(error, context) {
        this.trackEvent('error', {
            message: error.message,
            stack: error.stack,
            context
        });
    }
    
    /**
     * Track timing
     */
    trackTiming(category, variable, time, label) {
        this.trackEvent('timing', {
            category,
            variable,
            time,
            label
        });
    }
    
    /**
     * Generate user ID
     */
    generateUserId() {
        // Check localStorage for existing ID
        if (typeof localStorage !== 'undefined') {
            let userId = localStorage.getItem('analytics_user_id');
            if (!userId) {
                userId = 'user_' + Math.random().toString(36).substring(2) + Date.now();
                localStorage.setItem('analytics_user_id', userId);
            }
            return userId;
        }
        
        return 'user_' + Math.random().toString(36).substring(2);
    }
    
    /**
     * Generate session ID
     */
    generateSessionId() {
        return 'session_' + Math.random().toString(36).substring(2) + Date.now();
    }
    
    /**
     * Get session duration
     */
    getSessionDuration() {
        return Date.now() - this.startTime;
    }
    
    /**
     * Get all events
     */
    getEvents() {
        return this.events;
    }
    
    /**
     * Get events by name
     */
    getEventsByName(eventName) {
        return this.events.filter(e => e.name === eventName);
    }
    
    /**
     * Clear events
     */
    clearEvents() {
        this.events = [];
    }
    
    /**
     * Export analytics data
     */
    exportData() {
        return {
            userId: this.userId,
            sessionId: this.sessionId,
            duration: this.getSessionDuration(),
            events: this.events,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * End session
     */
    endSession() {
        this.trackEvent('session_end', {
            duration: this.getSessionDuration(),
            eventCount: this.events.length
        });
        
        // Export data if needed
        if (this.debug) {
            console.log('📊 Analytics Session Data:', this.exportData());
        }
    }
}

// Create singleton instance
const analytics = new Analytics({
    enabled: true,
    debug: false, // Set to true for development
    provider: 'console' // Change to 'google' for Google Analytics
});

// Auto-end session on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        analytics.endSession();
    });
}

// Export for use in modules and browser
if (typeof window !== 'undefined') {
    window.Analytics = Analytics;
    window.analytics = analytics;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Analytics,
        analytics
    };
}
