/**
 * Compatibility Shim
 * Ensures backward compatibility between old and new architecture
 */

(function() {
    'use strict';
    
    console.log('Loading compatibility shim...');
    
    // Create global namespace if needed
    window.MomGameCenter = window.MomGameCenter || {};
    
    // Path mapping for migrated files
    const PATH_MAP = {
        'enhanced-storage.js': 'src/shared/utils/storage.js',
        'js/game-constants.js': 'src/games/wordle/wordBanks.js',
        'js/game-logic.js': 'src/games/wordle/game-logic.js',
        'js/storage-hook.js': 'src/shared/utils/storage-hook.js',
        'components/wordle-components.js': 'src/games/wordle/WordleComponents.js',
        'components/wordle-game.js': 'src/games/wordle/WordleGame.js',
        'components/statistics.js': 'src/games/wordle/Statistics.js',
        'components/app.js': 'src/games/wordle/WordleApp.js',
        'css/wordle-styles.css': 'src/games/wordle/wordle.css'
    };
    
    // Polyfill for older browsers
    if (!window.Promise) {
        console.warn('Promise not supported, loading polyfill...');
        // In production, load a Promise polyfill here
    }
    
    // Check for required dependencies
    function checkDependencies() {
        const required = {
            'React': window.React,
            'ReactDOM': window.ReactDOM,
            'localStorage': window.localStorage
        };
        
        const missing = [];
        for (const [name, obj] of Object.entries(required)) {
            if (!obj) {
                missing.push(name);
            }
        }
        
        if (missing.length > 0) {
            console.warn('Missing dependencies:', missing.join(', '));
            return false;
        }
        
        return true;
    }
    
    // Redirect old paths to new paths
    function redirectPath(oldPath) {
        return PATH_MAP[oldPath] || oldPath;
    }
    
    // Override script loading for compatibility
    const originalAppendChild = document.head.appendChild;
    const originalInsertBefore = document.head.insertBefore;
    
    function processScriptElement(script) {
        if (script.tagName === 'SCRIPT' && script.src) {
            const src = script.src;
            const filename = src.substring(src.lastIndexOf('/') + 1);
            
            // Check if this needs path remapping
            for (const [oldFile, newFile] of Object.entries(PATH_MAP)) {
                if (src.includes(oldFile)) {
                    console.log(`Redirecting ${oldFile} to ${newFile}`);
                    script.src = src.replace(oldFile, newFile);
                    break;
                }
            }
        }
        return script;
    }
    
    // Compatibility for old storage system
    if (typeof WordleStorage === 'undefined' && typeof window.WordleStorage === 'undefined') {
        console.log('Creating WordleStorage compatibility layer...');
        
        // Check if the new storage exists
        const checkStorage = setInterval(() => {
            if (window.WordleStorage) {
                clearInterval(checkStorage);
                console.log('WordleStorage loaded successfully');
            }
        }, 100);
        
        // Stop checking after 5 seconds
        setTimeout(() => clearInterval(checkStorage), 5000);
    }
    
    // Ensure game constants are available globally
    window.ensureGameConstants = function() {
        if (!window.WORD_BANKS) {
            console.warn('WORD_BANKS not found, creating default...');
            window.WORD_BANKS = {
                ENGLISH: ["HAPPY", "WORLD", "SMILE"],
                TURKEY: ["SEVGI", "MUTLU", "HUZUR"],
                NATURE: ["AGAC", "ORMAN", "NEHIR"]
            };
        }
        
        if (!window.GAME_CONFIG) {
            console.warn('GAME_CONFIG not found, creating default...');
            window.GAME_CONFIG = {
                MAX_GUESSES: 6,
                WORD_LENGTH: 5,
                KEYBOARD_LAYOUTS: {
                    TURKISH: [
                        "QWERTYUIOPĞÜ".split(""),
                        "ASDFGHJKLŞİ".split(""),
                        ["ENTER", ..."ZXCVBNMÖÇ".split(""), "BACKSPACE"]
                    ]
                }
            };
        }
    };
    
    // Migration helper
    window.MomGameCenter.migrate = function() {
        console.log('Starting migration to new architecture...');
        console.log('1. Update all script src paths according to PATH_MAP');
        console.log('2. Update all link href paths for CSS files');
        console.log('3. Test each game independently');
        console.log('4. Verify storage persistence');
        
        console.log('\nPath mappings:');
        for (const [oldPath, newPath] of Object.entries(PATH_MAP)) {
            console.log(`  ${oldPath} → ${newPath}`);
        }
        
        return PATH_MAP;
    };
    
    // Version information
    window.MomGameCenter.version = {
        current: '2.0.0',
        architecture: 'unified',
        compatible: true
    };
    
    // Check compatibility on load
    window.addEventListener('DOMContentLoaded', () => {
        if (!checkDependencies()) {
            console.error('Compatibility check failed!');
            
            // Show user-friendly error
            const container = document.getElementById('root') || document.body;
            if (container && container.children.length === 0) {
                container.innerHTML = `
                    <div style="padding: 2rem; text-align: center; font-family: sans-serif;">
                        <h1 style="color: #dc2626;">Compatibility Error</h1>
                        <p>Some required components are missing or incompatible.</p>
                        <p style="margin-top: 1rem;">Please try:</p>
                        <ul style="list-style: none; padding: 0; margin-top: 1rem;">
                            <li>• Refreshing the page</li>
                            <li>• Using a modern browser (Chrome, Firefox, Safari, Edge)</li>
                            <li>• Clearing your browser cache</li>
                        </ul>
                        <button onclick="location.reload()" style="margin-top: 2rem; padding: 0.5rem 2rem; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Refresh Page
                        </button>
                    </div>
                `;
            }
        } else {
            console.log('✓ Compatibility check passed');
        }
        
        // Ensure game constants are loaded
        setTimeout(() => {
            window.ensureGameConstants();
        }, 500);
    });
    
    console.log('Compatibility shim loaded successfully');
})();
