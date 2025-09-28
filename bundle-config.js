// Bundle Configuration for Production
// This file shows how to combine all separated files back into a single file if needed

const BUNDLE_CONFIG = {
    // Order matters for dependencies
    scripts: [
        'enhanced-storage.js',           // External dependency
        'js/game-constants.js',          // Constants first
        'js/game-logic.js',              // Logic utilities
        'js/storage-hook.js',            // React hook (needs Babel)
        'components/wordle-components.js', // UI components (needs Babel)
        'components/wordle-game.js',     // Game component (needs Babel)
        'components/statistics.js',       // Stats component (needs Babel)
        'components/app.js'              // Main app last (needs Babel)
    ],
    
    styles: [
        'css/wordle-styles.css'
    ],
    
    // External CDN dependencies
    cdnDependencies: [
        'https://cdn.tailwindcss.com',
        'https://unpkg.com/react@18/umd/react.production.min.js',
        'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
        'https://unpkg.com/@babel/standalone/babel.min.js'
    ],
    
    // Google Fonts
    fonts: [
        'https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=Inter:wght@400;500;600&display=swap'
    ]
};

// Simple bundler function (for Node.js environment)
async function createBundle() {
    const fs = require('fs').promises;
    const path = require('path');
    
    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wordle - Mom Edition (Bundled)</title>
    
    <!-- External Libraries -->
    ${BUNDLE_CONFIG.cdnDependencies.map(url => 
        `<script src="${url}"></script>`
    ).join('\n    ')}
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    ${BUNDLE_CONFIG.fonts.map(url => 
        `<link href="${url}" rel="stylesheet">`
    ).join('\n    ')}
    
    <style>
`;
    
    // Bundle CSS
    for (const stylePath of BUNDLE_CONFIG.styles) {
        const content = await fs.readFile(stylePath, 'utf-8');
        htmlContent += content + '\n';
    }
    
    htmlContent += `    </style>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
`;
    
    // Bundle JavaScript
    for (const scriptPath of BUNDLE_CONFIG.scripts) {
        const content = await fs.readFile(scriptPath, 'utf-8');
        // Remove module exports for bundling
        const cleanedContent = content
            .replace(/if \(typeof module[\s\S]*?\}/g, '')
            .replace(/module\.exports[\s\S]*?;/g, '');
        htmlContent += cleanedContent + '\n\n';
    }
    
    // Add initialization
    htmlContent += `
        // Initialize App
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                initializeApp();
            }, 100);
        });
    </script>
</body>
</html>`;
    
    // Write bundled file
    await fs.writeFile('WordleBundled.html', htmlContent);
    console.log('Bundle created: WordleBundled.html');
}

// Export for use in build scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BUNDLE_CONFIG,
        createBundle
    };
}