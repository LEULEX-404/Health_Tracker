import { useId } from 'react';

/**
 * Reusable labelled form input with icon.
 * Props: label, icon (ReactNode), type, value, onChange, placeholder, name, required, ...rest
 */
export default function AuthFormInput({
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
    ...rest
}) {
    const id = useId();
    return (
        <div className="Imasha-field" style={style}>
            {label && <label className="Imasha-label" htmlFor={id}>{label}</label>}
            <div className="Imasha-input-wrap">
                {icon && <span className="Imasha-input-icon">{icon}</span>}
                {as === 'select' ? (
                    <select
                        id={id}
                        name={name}
                        value={value}
                        onChange={onChange}
                        required={required}
                        className="Imasha-select"
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
                        className="Imasha-input"
                        {...rest}
                    />
                )}
            </div>
        </div>
    );
}
