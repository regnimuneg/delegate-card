import './Card.css';

/**
 * NIMUN Card Component
 * Glassmorphic card container with optional glow effect
 */
export function Card({
    children,
    variant = 'default',
    glow = false,
    padding = 'medium',
    className = '',
    ...props
}) {
    const classes = [
        'nimun-card',
        `nimun-card--${variant}`,
        `nimun-card--padding-${padding}`,
        glow && 'nimun-card--glow',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`nimun-card-header ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }) {
    return (
        <div className={`nimun-card-body ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }) {
    return (
        <div className={`nimun-card-footer ${className}`}>
            {children}
        </div>
    );
}

export default Card;
