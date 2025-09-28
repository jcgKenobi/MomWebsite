/**
 * Modal Component
 * Reusable modal/dialog component
 */

const Modal = ({
    isOpen = false,
    onClose,
    title,
    size = 'md',
    closeOnOverlayClick = true,
    showCloseButton = true,
    className = '',
    children,
    footer
}) => {
    // Handle overlay click
    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose && onClose();
        }
    };
    
    // Handle escape key
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (isOpen && e.key === 'Escape') {
                onClose && onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;
    
    // Size classes
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full mx-4'
    };
    
    return React.createElement('div', {
        className: 'modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50',
        onClick: handleOverlayClick
    }, 
        React.createElement('div', {
            className: `modal-content bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 ${className}`,
            onClick: (e) => e.stopPropagation()
        }, [
            // Header
            (title || showCloseButton) && React.createElement('div', {
                key: 'header',
                className: 'modal-header flex items-center justify-between px-6 py-4 border-b'
            }, [
                title && React.createElement('h2', {
                    key: 'title',
                    className: 'text-xl font-semibold text-gray-900'
                }, title),
                showCloseButton && React.createElement('button', {
                    key: 'close',
                    onClick: onClose,
                    className: 'text-gray-400 hover:text-gray-600 transition-colors',
                    'aria-label': 'Close modal'
                }, '✕')
            ]),
            
            // Body
            React.createElement('div', {
                key: 'body',
                className: 'modal-body px-6 py-4'
            }, children),
            
            // Footer
            footer && React.createElement('div', {
                key: 'footer',
                className: 'modal-footer px-6 py-4 border-t'
            }, footer)
        ])
    );
};

// Export for use in modules and browser
if (typeof window !== 'undefined') {
    window.Modal = Modal;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modal;
}
