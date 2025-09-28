/**
 * Website Utilities - Created by Claude's File Creation Demo
 * Useful JavaScript functions for your MomWebsite project
 */

class WebsiteUtils {
    constructor() {
        this.visitCount = this.getVisitCount();
        this.initializeUtils();
    }

    // Visit counter
    getVisitCount() {
        const count = localStorage.getItem('visitCount') || 0;
        return parseInt(count);
    }

    incrementVisitCount() {
        this.visitCount++;
        localStorage.setItem('visitCount', this.visitCount);
        return this.visitCount;
    }

    // Smooth scrolling utility
    smoothScrollTo(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Dark mode toggle
    toggleDarkMode() {
        const body = document.body;
        const isDark = body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark);
        return isDark;
    }

    // Initialize dark mode from saved preference
    initializeDarkMode() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
        }
    }

    // Form validation helper
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
                
                // Special validation for email
                if (input.type === 'email' && !this.validateEmail(input.value)) {
                    input.classList.add('error');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    // Image lazy loading
    initializeLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Performance monitoring
    logPageLoadTime() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
            
            // Optional: Send to analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: Math.round(loadTime),
                    custom_parameter: 'load_time_ms'
                });
            }
        });
    }

    // Cookie utilities
    setCookie(name, value, days = 30) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Initialize all utilities
    initializeUtils() {
        this.initializeDarkMode();
        this.logPageLoadTime();
        
        // Initialize lazy loading when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeLazyLoading();
            });
        } else {
            this.initializeLazyLoading();
        }

        // Increment visit count
        this.incrementVisitCount();
        console.log(`Welcome! This is visit #${this.visitCount}`);
    }
}

// Auto-initialize when script loads
const websiteUtils = new WebsiteUtils();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebsiteUtils;
}