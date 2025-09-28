/**
 * Client-Side Router
 * Handles navigation between games and pages without page refresh
 */

class Router {
    constructor(config = {}) {
        this.routes = new Map();
        this.currentRoute = null;
        this.previousRoute = null;
        this.container = config.container || document.getElementById('app');
        this.notFoundHandler = config.notFoundHandler || this.defaultNotFound;
        this.beforeNavigate = config.beforeNavigate || (() => true);
        this.afterNavigate = config.afterNavigate || (() => {});
        this.baseUrl = config.baseUrl || '';
        
        // History management
        this.historyStack = [];
        this.historyIndex = -1;
        
        // Setup popstate listener for browser back/forward
        this.setupHistoryListener();
        
        // Setup link interceptor
        if (config.interceptLinks !== false) {
            this.setupLinkInterceptor();
        }
    }
    
    /**
     * Register a route
     * @param {string} path - Route path (supports parameters like /game/:id)
     * @param {Function|Object} handler - Route handler or component
     * @param {Object} options - Route options
     */
    register(path, handler, options = {}) {
        const routePattern = this.createRoutePattern(path);
        
        this.routes.set(path, {
            path,
            pattern: routePattern,
            handler,
            options,
            params: this.extractParamNames(path)
        });
        
        console.log(`Registered route: ${path}`);
        return this;
    }
    
    /**
     * Navigate to a route
     * @param {string} path - Path to navigate to
     * @param {Object} state - Optional state data
     * @param {boolean} replace - Replace current history entry
     */
    async navigate(path, state = {}, replace = false) {
        // Clean path
        path = this.cleanPath(path);
        
        // Check if navigation should proceed
        if (!this.beforeNavigate(path, this.currentRoute)) {
            console.log('Navigation cancelled by beforeNavigate hook');
            return false;
        }
        
        // Find matching route
        const route = this.findRoute(path);
        
        if (!route) {
            this.handleNotFound(path);
            return false;
        }
        
        // Extract parameters
        const params = this.extractParams(path, route);
        
        // Store previous route
        this.previousRoute = this.currentRoute;
        
        // Create route context
        const context = {
            path,
            params,
            state,
            route: route.path,
            query: this.parseQuery(window.location.search),
            router: this
        };
        
        // Update current route
        this.currentRoute = context;
        
        try {
            // Clear container
            if (this.container) {
                this.container.innerHTML = '';
                this.container.classList.add('route-loading');
            }
            
            // Execute handler
            await this.executeHandler(route.handler, context);
            
            // Update history
            if (!replace) {
                this.pushHistory(path, state);
            } else {
                this.replaceHistory(path, state);
            }
            
            // Update browser URL
            this.updateUrl(path);
            
            // After navigate hook
            this.afterNavigate(context);
            
            if (this.container) {
                this.container.classList.remove('route-loading');
            }
            
            console.log(`Navigated to: ${path}`);
            return true;
            
        } catch (error) {
            console.error(`Navigation error for ${path}:`, error);
            this.handleError(error, context);
            return false;
        }
    }
    
    /**
     * Go back in history
     */
    back() {
        if (this.canGoBack()) {
            window.history.back();
        } else if (this.previousRoute) {
            this.navigate(this.previousRoute.path, this.previousRoute.state);
        }
    }
    
    /**
     * Go forward in history
     */
    forward() {
        if (this.canGoForward()) {
            window.history.forward();
        }
    }
    
    /**
     * Reload current route
     */
    reload() {
        if (this.currentRoute) {
            this.navigate(this.currentRoute.path, this.currentRoute.state, true);
        }
    }
    
    /**
     * Check if can go back
     */
    canGoBack() {
        return this.historyIndex > 0;
    }
    
    /**
     * Check if can go forward
     */
    canGoForward() {
        return this.historyIndex < this.historyStack.length - 1;
    }
    
    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
    
    /**
     * Get previous route
     */
    getPreviousRoute() {
        return this.previousRoute;
    }
    
    /**
     * Create route pattern for matching
     */
    createRoutePattern(path) {
        // Convert route pattern to regex
        // /game/:id -> /game/([^/]+)
        const pattern = path
            .replace(/:[^/]+/g, '([^/]+)')
            .replace(/\*/g, '.*');
        
        return new RegExp(`^${pattern}$`);
    }
    
    /**
     * Extract parameter names from route
     */
    extractParamNames(path) {
        const matches = path.match(/:([^/]+)/g);
        return matches ? matches.map(m => m.substring(1)) : [];
    }
    
    /**
     * Find matching route for path
     */
    findRoute(path) {
        for (const [_, route] of this.routes) {
            if (route.pattern.test(path)) {
                return route;
            }
        }
        return null;
    }
    
    /**
     * Extract parameters from path
     */
    extractParams(path, route) {
        const matches = path.match(route.pattern);
        const params = {};
        
        if (matches && route.params.length > 0) {
            route.params.forEach((param, index) => {
                params[param] = matches[index + 1];
            });
        }
        
        return params;
    }
    
    /**
     * Execute route handler
     */
    async executeHandler(handler, context) {
        if (typeof handler === 'function') {
            // Function handler
            const result = await handler(context);
            
            // If handler returns HTML string, render it
            if (typeof result === 'string' && this.container) {
                this.container.innerHTML = result;
            }
            // If handler returns a React component, render it
            else if (result && result.$$typeof && window.React && window.ReactDOM) {
                const root = window.ReactDOM.createRoot(this.container);
                root.render(result);
            }
            // If handler returns a DOM element, append it
            else if (result instanceof HTMLElement && this.container) {
                this.container.appendChild(result);
            }
        }
        // If handler is a component class
        else if (typeof handler === 'object' && handler.render) {
            await handler.render(this.container, context);
        }
    }
    
    /**
     * Handle not found routes
     */
    handleNotFound(path) {
        console.warn(`Route not found: ${path}`);
        this.notFoundHandler(path, this.container);
    }
    
    /**
     * Default not found handler
     */
    defaultNotFound(path, container) {
        if (container) {
            container.innerHTML = `
                <div class="not-found">
                    <h1>404 - Page Not Found</h1>
                    <p>The page "${path}" could not be found.</p>
                    <a href="/" onclick="event.preventDefault(); window.router.navigate('/');">Go Home</a>
                </div>
            `;
        }
    }
    
    /**
     * Handle navigation errors
     */
    handleError(error, context) {
        console.error('Navigation error:', error);
        
        if (this.container) {
            this.container.innerHTML = `
                <div class="error">
                    <h1>Error</h1>
                    <p>An error occurred while loading this page.</p>
                    <details>
                        <summary>Details</summary>
                        <pre>${error.stack || error.message}</pre>
                    </details>
                    <a href="/" onclick="event.preventDefault(); window.router.navigate('/');">Go Home</a>
                </div>
            `;
        }
    }
    
    /**
     * Clean path
     */
    cleanPath(path) {
        // Remove base URL if present
        if (this.baseUrl && path.startsWith(this.baseUrl)) {
            path = path.substring(this.baseUrl.length);
        }
        
        // Ensure path starts with /
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // Remove trailing slash (except for root)
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        
        return path;
    }
    
    /**
     * Update browser URL
     */
    updateUrl(path) {
        const url = this.baseUrl + path;
        
        if (window.location.pathname + window.location.search !== url) {
            window.history.pushState({ path }, '', url);
        }
    }
    
    /**
     * Push to history stack
     */
    pushHistory(path, state) {
        this.historyIndex++;
        this.historyStack = this.historyStack.slice(0, this.historyIndex);
        this.historyStack.push({ path, state, timestamp: Date.now() });
        
        // Limit history size
        if (this.historyStack.length > 50) {
            this.historyStack.shift();
            this.historyIndex--;
        }
    }
    
    /**
     * Replace current history entry
     */
    replaceHistory(path, state) {
        if (this.historyIndex >= 0) {
            this.historyStack[this.historyIndex] = { path, state, timestamp: Date.now() };
        } else {
            this.pushHistory(path, state);
        }
        
        window.history.replaceState({ path }, '', this.baseUrl + path);
    }
    
    /**
     * Setup history listener for browser navigation
     */
    setupHistoryListener() {
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.path) {
                this.navigate(event.state.path, event.state, true);
            }
        });
    }
    
    /**
     * Setup link interceptor for SPA navigation
     */
    setupLinkInterceptor() {
        document.addEventListener('click', (event) => {
            // Find closest anchor tag
            const link = event.target.closest('a');
            
            if (!link) return;
            
            // Check if should intercept
            const href = link.getAttribute('href');
            
            if (!href || 
                href.startsWith('http') || 
                href.startsWith('#') ||
                link.hasAttribute('download') ||
                link.hasAttribute('data-no-route') ||
                link.target === '_blank') {
                return;
            }
            
            // Intercept and navigate
            event.preventDefault();
            this.navigate(href);
        });
    }
    
    /**
     * Parse query string
     */
    parseQuery(queryString) {
        const params = new URLSearchParams(queryString);
        const query = {};
        
        for (const [key, value] of params) {
            query[key] = value;
        }
        
        return query;
    }
    
    /**
     * Start router with initial route
     */
    start() {
        // Get initial path from URL
        const path = this.cleanPath(window.location.pathname);
        
        // Navigate to initial route
        this.navigate(path, {}, true);
        
        console.log('Router started');
        return this;
    }
    
    /**
     * Get all registered routes
     */
    getRoutes() {
        return Array.from(this.routes.entries()).map(([path, route]) => ({
            path,
            params: route.params,
            options: route.options
        }));
    }
    
    /**
     * Check if a route exists
     */
    hasRoute(path) {
        return this.findRoute(this.cleanPath(path)) !== null;
    }
    
    /**
     * Remove a route
     */
    unregister(path) {
        this.routes.delete(path);
        console.log(`Unregistered route: ${path}`);
        return this;
    }
    
    /**
     * Clear all routes
     */
    clearRoutes() {
        this.routes.clear();
        console.log('Cleared all routes');
        return this;
    }
}

// Create singleton instance
const router = new Router({
    container: document.getElementById('app') || document.getElementById('root')
});

// Export for use in modules and browser
if (typeof window !== 'undefined') {
    window.Router = Router;
    window.router = router;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Router,
        router
    };
}
