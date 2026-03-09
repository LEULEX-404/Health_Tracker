import { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable password input with show/hide toggle.
 * Props:
 *   value, onChange, onFocus, onBlur, placeholder, id, label
 *   onPasswordFocusChange {(isFocused: boolean) => void}
 */
export default function PasswordInput({
    value,
    onChange,
    onPasswordFocusChange,
    placeholder = 'Enter password',
    id,
    label = 'Password',
    name,
    autoComplete,
}) {
    const [show, setShow] = useState(false);
    const generatedId = useId();
    const inputId = id || generatedId;

    function handleFocus() { onPasswordFocusChange?.(true); }
    function handleBlur() { onPasswordFocusChange?.(false); }

    return (
        <div className="Imasha-field">
            {label && <label className="Imasha-label" htmlFor={inputId}>{label}</label>}
            <div className="Imasha-input-wrap">
                <span className="Imasha-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
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
                    className="Imasha-input"
                    style={{ paddingRight: '2.8rem' }}
                />
                <button
                    type="button"
                    className="Imasha-pw-toggle"
                    onClick={() => setShow((s) => !s)}
                    tabIndex={-1}
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
            </div>
        </div>
    );
}
