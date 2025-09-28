/**
 * Button Component
 * Reusable button component with multiple variants and sizes
 */

const Button = ({ 
    variant = 'primary', 
    size = 'md', 
    onClick, 
    disabled = false,
    loading = false,
    icon = null,
    iconPosition = 'left',
    fullWidth = false,
    type = 'button',
    className = '',
    children,
    ...props 
}) => {
    // Base classes
    const baseClasses = `
        button 
        inline-flex 
        items-center 
        justify-center
        font-medium
        transition-all 
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        disabled:opacity-50
        disabled:cursor-not-allowed
    `;
    
    // Variant styles
    const variantClasses = {
        primary: `
            bg-primary-600 
            text-white 
            hover:bg-primary-700
            focus:ring-primary-500
        `,
        secondary: `
            bg-gray-200 
            text-gray-800 
            hover:bg-gray-300
            focus:ring-gray-500
        `,
        success: `
            bg-success-600 
            text-white 
            hover:bg-success-700
            focus:ring-success-500
        `,
        danger: `
            bg-error-600 
            text-white 
            hover:bg-error-700
            focus:ring-error-500
        `,
        warning: `
            bg-warning-600 
            text-white 
            hover:bg-warning-700
            focus:ring-warning-500
        `,
        ghost: `
            bg-transparent 
            text-gray-700 
            hover:bg-gray-100
            focus:ring-gray-500
        `,
        outline: `
            bg-transparent 
            text-primary-600 
            border-2 
            border-primary-600
            hover:bg-primary-50
            focus:ring-primary-500
        `
    };
    
    // Size styles
    const sizeClasses = {
        xs: 'px-2.5 py-1.5 text-xs rounded',
        sm: 'px-3 py-2 text-sm rounded-md',
        md: 'px-4 py-2 text-base rounded-md',
        lg: 'px-6 py-3 text-lg rounded-md',
        xl: 'px-8 py-4 text-xl rounded-lg'
    };
    
    // Full width
    const widthClass = fullWidth ? 'w-full' : '';
    
    // Combine classes
    const combinedClasses = `
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
    `.replace(/\s+/g, ' ').trim();
    
    return React.createElement('button', {
        type,
        className: combinedClasses,
        onClick,
        disabled: disabled || loading,
        ...props
    }, [
        loading && React.createElement('span', {
            key: 'spinner',
            className: 'spinner mr-2'
        }, '⟳'),
        icon && iconPosition === 'left' && React.createElement('span', {
            key: 'icon-left',
            className: 'mr-2'
        }, icon),
        React.createElement('span', { key: 'children' }, children),
        icon && iconPosition === 'right' && React.createElement('span', {
            key: 'icon-right',
            className: 'ml-2'
        }, icon)
    ]);
};

// Export for use in modules and browser
if (typeof window !== 'undefined') {
    window.Button = Button;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Button;
}
