import './Button.css';

/**
 * NIMUN Button Component
 * Capsule-style buttons following nimuneg.org brand guidelines
 */
export function Button({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    disabled = false,
    loading = false,
    type = 'button',
    onClick,
    className = '',
    ...props
}) {
    const classes = [
        'nimun-btn',
        `nimun-btn--${variant}`,
        `nimun-btn--${size}`,
        fullWidth && 'nimun-btn--full',
        loading && 'nimun-btn--loading',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && <span className="nimun-btn__spinner" />}
            <span className="nimun-btn__content">{children}</span>
        </button>
    );
}

export default Button;
