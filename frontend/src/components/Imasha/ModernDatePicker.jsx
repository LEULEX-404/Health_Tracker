import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ModernDatePicker({
    label,
    name,
    value,
    onChange,
    required = false,
    error = '',
    customTrigger,
    placement = 'bottom'
}) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Parse initial value or use current date for viewing
    const initialDate = value && !isNaN(new Date(value).getTime()) ? new Date(value) : new Date(2000, 0, 1);
    
    // Default the viewing month to the selected date or current date
    const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

    // Compute years for select
    const currentYear = new Date().getFullYear();
    const years = useMemo(() => {
        const arr = [];
        for (let y = currentYear; y >= 1900; y--) {
            arr.push(y);
        }
        return arr;
    }, [currentYear]);

    const popoverRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelectDate = (day) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Format as YYYY-MM-DD for form state
        const year = selected.getFullYear();
        const month = String(selected.getMonth() + 1).padStart(2, '0');
        const date = String(selected.getDate()).padStart(2, '0');
        
        onChange({ target: { name, value: `${year}-${month}-${date}` } });
        setIsOpen(false);
    };

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        // empty slots for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        // actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    }, [viewDate]);

    // Format display value
    const displayValue = useMemo(() => {
        if (!value) return '';
        const dateObj = new Date(value);
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }, [value]);

    return (
        <div className="Imasha-field" style={{ position: 'relative', width: '100%' }} ref={popoverRef}>
            {label && !customTrigger && (
                <label className="Imasha-label">
                    {label}
                    {required && <span style={{ color: 'var(--auth-error)', marginLeft: '3px' }}>*</span>}
                </label>
            )}
            
            {customTrigger ? customTrigger({ displayValue, isOpen, setIsOpen }) : (
                <div 
                    className={`Imasha-input-wrap${error ? ' has-error' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="Imasha-input-icon"><CalendarIcon size={16} /></span>
                    <input
                        type="text"
                        className={`Imasha-input${error ? ' has-error' : ''}`}
                        placeholder="mm/dd/yyyy"
                        value={displayValue}
                        readOnly
                        style={{ cursor: 'pointer', paddingRight: '2.5rem' }}
                    />
                </div>
            )}

            {error && !customTrigger && <span className="Imasha-field-error">⚠ {error}</span>}

            {isOpen && (
                <div className={`Imasha-modern-calendar-popover ${placement === 'top' ? 'placement-top' : ''}`}>
                    <div className="Imasha-calendar-header" style={{ justifyContent: 'center' }}>
                        <div className="Imasha-cal-selectors">
                            <select 
                                className="Imasha-cal-select"
                                value={viewDate.getMonth()}
                                onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))}
                            >
                                {MONTHS.map((m, i) => (
                                    <option key={m} value={i}>{m}</option>
                                ))}
                            </select>
                            <select 
                                className="Imasha-cal-select"
                                value={viewDate.getFullYear()}
                                onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))}
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="Imasha-calendar-grid">
                        {DAYS.map((day) => (
                            <div key={day} className="Imasha-cal-day-name">{day}</div>
                        ))}
                        
                        {calendarDays.map((day, idx) => {
                            if (!day) return <div key={`empty-${idx}`} className="Imasha-cal-day empty" />;
                            
                            const isSelected = value && 
                                               new Date(value).getDate() === day && 
                                               new Date(value).getMonth() === viewDate.getMonth() && 
                                               new Date(value).getFullYear() === viewDate.getFullYear();
                            
                            const isToday = day === new Date().getDate() && 
                                            viewDate.getMonth() === new Date().getMonth() && 
                                            viewDate.getFullYear() === new Date().getFullYear();

                            return (
                                <button 
                                    key={`day-${day}`} 
                                    type="button"
                                    className={`Imasha-cal-day ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'today' : ''}`}
                                    onClick={() => handleSelectDate(day)}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            <style>{`
                .Imasha-modern-calendar-popover {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    width: 100%;
                    min-width: 260px;
                    background: var(--auth-card-bg);
                    border: 1px solid var(--auth-card-border);
                    border-radius: 16px;
                    padding: 0.8rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px var(--auth-primary-glow);
                    z-index: 100;
                    animation: scaleInCalendar 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    transform-origin: top center;
                    backdrop-filter: blur(14px);
                }

                .Imasha-modern-calendar-popover.placement-top {
                    top: auto;
                    bottom: calc(100% + 8px);
                    transform-origin: bottom center;
                    animation: scaleInCalendarTop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @media (max-width: 480px) {
                    .Imasha-modern-calendar-popover,
                    .Imasha-modern-calendar-popover.placement-top {
                        position: fixed !important;
                        top: 50% !important;
                        bottom: auto !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 90vw;
                        max-width: 300px;
                        min-width: 260px;
                        animation: scaleInCenterMobile 0.25s ease-out forwards !important;
                        transform-origin: center !important;
                    }
                }

                @keyframes scaleInCenterMobile {
                    from { transform: translate(-50%, -45%) scale(0.95); opacity: 0; }
                    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }

                @keyframes scaleInCalendar {
                    from { opacity: 0; transform: scaleY(0.9) translateY(-10px); }
                    to { opacity: 1; transform: scaleY(1) translateY(0); }
                }

                @keyframes scaleInCalendarTop {
                    from { opacity: 0; transform: scaleY(0.9) translateY(10px); }
                    to { opacity: 1; transform: scaleY(1) translateY(0); }
                }

                .Imasha-calendar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.8rem;
                }

                .Imasha-cal-selectors {
                    display: flex;
                    gap: 0.5rem;
                }

                .Imasha-cal-select {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                    border-radius: 6px;
                    padding: 0.15rem 0.3rem;
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    outline: none;
                }
                
                .Imasha-cal-select option {
                    background: var(--auth-card-bg);
                    color: var(--auth-text-main);
                }

                .Imasha-calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }

                .Imasha-cal-day-name {
                    text-align: center;
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: var(--auth-text-muted);
                    text-transform: uppercase;
                    margin-bottom: 0.4rem;
                }

                .Imasha-cal-day {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: var(--auth-text-main);
                    border-radius: 8px;
                    border: 1px solid transparent;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .Imasha-cal-day:not(.empty):hover {
                    background: rgba(0, 200, 151, 0.15);
                    border-color: rgba(0, 200, 151, 0.3);
                    color: #fff;
                }

                .Imasha-cal-day.today {
                    border-color: rgba(0, 200, 151, 0.5);
                    color: var(--auth-primary);
                    font-weight: 700;
                }

                .Imasha-cal-day.selected {
                    background: var(--auth-primary);
                    color: #fff;
                    border-color: var(--auth-primary);
                    box-shadow: 0 4px 12px var(--auth-primary-glow);
                    font-weight: 700;
                }

                .light-theme .Imasha-modern-calendar-popover {
                    background: #ffffff;
                    border-color: rgba(0, 200, 151, 0.3);
                    box-shadow: 0 10px 40px rgba(0, 200, 151, 0.15);
                }
                
                .light-theme .Imasha-cal-select {
                    background: #f0faf5;
                    border-color: rgba(0, 200, 151, 0.2);
                    color: #062514;
                }
                
                .light-theme .Imasha-cal-day {
                    color: #062514;
                }
            `}</style>
        </div>
    );
}
