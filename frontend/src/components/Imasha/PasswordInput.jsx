import { useState, useId, memo } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Password input with show/hide toggle and optional inline error.
 * showStrength: Boolean to show a subtle strength indicator (useful for Sign Up)
 */
const PasswordInput = memo(function PasswordInput({
    value,
    onChange,
    onPasswordFocusChange,
    placeholder = 'Enter password',
    id,
    label = 'Password',
    name,
    autoComplete,
    error = '',
    required = false,
    showStrength = false,
}) {
    const [show, setShow] = useState(false);
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    function handleFocus() { onPasswordFocusChange?.(true); }
    function handleBlur() { onPasswordFocusChange?.(false); }

    // Simple strength calculation
    const getStrength = (val) => {
        if (!val) return 0;
        let score = 0;
        if (val.length >= 6) score += 25;
        if (/[A-Z]/.test(val)) score += 25;
        if (/[0-9]/.test(val)) score += 25;
        if (/[^A-Za-z0-9]/.test(val)) score += 25;
        return score;
    };

    const strength = getStrength(value);
    const strengthColor = strength <= 25 ? '#ef4444' : strength <= 50 ? '#f59e0b' : strength <= 75 ? '#10b981' : '#00a87d';

    return (
        <div className="Imasha-field">
            {label && (
                <label className="Imasha-label" htmlFor={inputId}>
                    {label}
                    {required && <span style={{ color: 'var(--auth-error)', marginLeft: '4px' }}>*</span>}
                </label>
            )}
            <div className={`Imasha-input-wrap${hasError ? ' has-error' : ''}`}>
                <span className="Imasha-input-icon">
                    <Lock size={16} />
                </span>
                <input
                    id={inputId}
                    name={name}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    required={required}
                    className={`Imasha-input${hasError ? ' has-error' : ''}`}
                    style={{ paddingRight: '3rem' }}
                    aria-invalid={hasError}
                />
                <button
                    type="button"
                    className="Imasha-pw-toggle"
                    onClick={() => setShow((s) => !s)}
                    tabIndex={-1}
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {showStrength && value.length > 0 && (
                <div style={{ marginTop: '0.6rem', height: '4px', background: 'var(--auth-divider)', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${strength}%`, backgroundColor: strengthColor }}
                        transition={{ duration: 0.4 }}
                        style={{ height: '100%' }}
                    />
                </div>
            )}

            <AnimatePresence>
                {hasError && (
                    <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="Imasha-field-error"
                        role="alert"
                    >
                        <span style={{ fontSize: '1.1em' }}>⚠</span> {error}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
});

export default PasswordInput;
