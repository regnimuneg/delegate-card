import './Input.css';

/**
 * NIMUN Input Component
 * Styled form input with label and error handling
 */
export function Input({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    disabled = false,
    required = false,
    icon,
    className = '',
    ...props
}) {
    const inputId = `input-${name}`;

    return (
        <div className={`nimun-input-group ${error ? 'nimun-input-group--error' : ''} ${className}`}>
            {label && (
                <label htmlFor={inputId} className="nimun-input-label">
                    {label}
                    {required && <span className="nimun-input-required">*</span>}
                </label>
            )}
            <div className="nimun-input-wrapper">
                {icon && <span className="nimun-input-icon">{icon}</span>}
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`nimun-input ${icon ? 'nimun-input--with-icon' : ''}`}
                    {...props}
                />
            </div>
            {error && <span className="nimun-input-error">{error}</span>}
        </div>
    );
}

export default Input;
