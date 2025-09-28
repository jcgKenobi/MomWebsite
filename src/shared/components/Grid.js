/**
 * Grid Component
 * Flexible grid layout component
 */

const Grid = ({
    columns = 1,
    gap = 'md',
    responsive = true,
    className = '',
    children,
    ...props
}) => {
    // Gap sizes
    const gapSizes = {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-10'
    };
    
    // Column configurations
    const getColumnClasses = () => {
        if (typeof columns === 'number') {
            // Simple column count
            const colClass = `grid-cols-${columns}`;
            
            if (responsive) {
                // Responsive column classes
                return `
                    grid-cols-1
                    ${columns >= 2 ? 'sm:grid-cols-2' : ''}
                    ${columns >= 3 ? 'md:grid-cols-3' : ''}
                    ${columns >= 4 ? 'lg:grid-cols-4' : ''}
                    ${columns >= 5 ? 'xl:grid-cols-5' : ''}
                    ${columns >= 6 ? '2xl:grid-cols-6' : ''}
                `;
            }
            
            return colClass;
        }
        
        // Custom responsive configuration
        if (typeof columns === 'object') {
            let classes = [];
            
            if (columns.xs) classes.push(`grid-cols-${columns.xs}`);
            if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
            if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
            if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
            if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
            if (columns['2xl']) classes.push(`2xl:grid-cols-${columns['2xl']}`);
            
            return classes.join(' ');
        }
        
        return 'grid-cols-1';
    };
    
    const gridClasses = `
        grid
        ${getColumnClasses()}
        ${gapSizes[gap] || gapSizes.md}
        ${className}
    `.replace(/\s+/g, ' ').trim();
    
    return React.createElement('div', {
        className: gridClasses,
        ...props
    }, children);
};

// Export for use in modules and browser
if (typeof window !== 'undefined') {
    window.Grid = Grid;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Grid;
}
