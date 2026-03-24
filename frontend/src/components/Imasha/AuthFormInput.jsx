import { useId, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable labelled form input with icon and inline error support.
 * Props: label, icon, type, value, onChange, placeholder, name, required, error, ...rest
 */
const AuthFormInput = memo(function AuthFormInput({
    label,
    icon,
    type = 'text',
    value,
    onChange,
    placeholder,
    name,
    required = false,
    style,
    as = 'input',
    children,
    error = '',
    ...rest
}) {
    const id = useId();
    const hasError = Boolean(error);

    return (
        <div className="Imasha-field" style={style}>
            {label && (
                <label className="Imasha-label" htmlFor={id}>
                    {label}
                    {required && <span style={{ color: 'var(--auth-error)', marginLeft: '4px' }}>*</span>}
                </label>
            )}
            <div className={`Imasha-input-wrap${hasError ? ' has-error' : ''}`}>
                {icon && <span className="Imasha-input-icon">{icon}</span>}
                {as === 'select' ? (
                    <select
                        id={id}
                        name={name}
                        value={value}
                        onChange={onChange}
                        required={required}
                        className={`Imasha-input${hasError ? ' has-error' : ''}`}
                        {...rest}
                    >
                        {children}
                    </select>
                ) : (
                    <input
                        id={id}
                        name={name}
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        className={`Imasha-input${hasError ? ' has-error' : ''}`}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${id}-error` : undefined}
                        {...rest}
                    />
                )}
            </div>
            
            <AnimatePresence>
                {hasError && (
                    <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="Imasha-field-error"
                        id={`${id}-error`}
                        role="alert"
                    >
                        <span style={{ fontSize: '1.1em' }}>⚠</span> {error}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
});

export default AuthFormInput;
