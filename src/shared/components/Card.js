/**
 * Card Component
 * Reusable card container component
 */

const Card = ({
    title,
    subtitle,
    icon,
    image,
    onClick,
    hoverable = false,
    selected = false,
    disabled = false,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    footerClassName = '',
    children,
    footer,
    actions
}) => {
    // Base classes
    const baseClasses = `
        card
        bg-white
        rounded-lg
        shadow-md
        overflow-hidden
        transition-all
        duration-200
    `;
    
    // Interactive classes
    const interactiveClasses = onClick ? 'cursor-pointer' : '';
    const hoverClasses = hoverable ? 'hover:shadow-lg hover:scale-105' : '';
    const selectedClasses = selected ? 'ring-2 ring-primary-500 shadow-lg' : '';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    
    // Combine classes
    const combinedClasses = `
        ${baseClasses}
        ${interactiveClasses}
        ${hoverClasses}
        ${selectedClasses}
        ${disabledClasses}
        ${className}
    `.replace(/\s+/g, ' ').trim();
    
    const handleClick = (e) => {
        if (!disabled && onClick) {
            onClick(e);
        }
    };
    
    return React.createElement('div', {
        className: combinedClasses,
        onClick: handleClick,
        role: onClick ? 'button' : undefined,
        tabIndex: onClick ? 0 : undefined,
        'aria-disabled': disabled
    }, [
        // Image
        image && React.createElement('div', {
            key: 'image',
            className: 'card-image'
        }, 
            typeof image === 'string' 
                ? React.createElement('img', {
                    src: image,
                    alt: title || 'Card image',
                    className: 'w-full h-48 object-cover'
                })
                : image
        ),
        
        // Header
        (icon || title || subtitle) && React.createElement('div', {
            key: 'header',
            className: `card-header px-6 py-4 ${headerClassName}`
        }, [
            icon && React.createElement('div', {
                key: 'icon',
                className: 'card-icon text-3xl mb-2'
            }, icon),
            title && React.createElement('h3', {
                key: 'title',
                className: 'card-title text-lg font-semibold text-gray-900'
            }, title),
            subtitle && React.createElement('p', {
                key: 'subtitle',
                className: 'card-subtitle text-sm text-gray-600 mt-1'
            }, subtitle)
        ]),
        
        // Body
        children && React.createElement('div', {
            key: 'body',
            className: `card-body px-6 py-4 ${bodyClassName}`
        }, children),
        
        // Footer
        footer && React.createElement('div', {
            key: 'footer',
            className: `card-footer px-6 py-4 border-t ${footerClassName}`
        }, footer),
        
        // Actions
        actions && React.createElement('div', {
            key: 'actions',
            className: 'card-actions px-6 py-4 border-t flex items-center justify-end space-x-2'
        }, actions)
    ]);
};

// Export for use in modules and browser
if (typeof window !== 'undefined') {
    window.Card = Card;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Card;
}
