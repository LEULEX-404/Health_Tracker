import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    
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

    // Track position when opening and on scroll/resize
    useEffect(() => {
        const updateCoords = () => {
            if (isOpen && triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.top + window.scrollY,
                    bottom: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (popoverRef.current && !popoverRef.current.contains(event.target) && 
                triggerRef.current && !triggerRef.current.contains(event.target)) {
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
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    }, [viewDate]);

    const displayValue = useMemo(() => {
        if (!value) return '';
        const dateObj = new Date(value);
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }, [value]);

    return (
        <div className="Imasha-field" style={{ position: 'relative', width: '100%' }} ref={triggerRef}>
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

            {isOpen && createPortal(
                <div 
                    ref={popoverRef}
                    className={`Imasha-modern-calendar-popover ${placement === 'top' ? 'placement-top' : ''}`}
                    style={{
                        position: 'absolute',
                        top: placement === 'top' ? (coords.top - 8) : (coords.bottom + 8),
                        left: coords.left,
                        width: coords.width,
                        transform: placement === 'top' ? 'translateY(-100%)' : 'none',
                    }}
                >
                    <div className="Imasha-calendar-header">
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
                </div>,
                document.body
            )}
            <style>{`
                .Imasha-modern-calendar-popover {
                    min-width: 280px;
                    background: var(--bg-card, #ffffff);
                    border: 1px solid var(--border-color, rgba(0,0,0,0.1));
                    border-radius: 18px;
                    padding: 1rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
                    z-index: 100000; /* Extra high for portal */
                    animation: scaleInCalendar 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    transform-origin: top center;
                    backdrop-filter: blur(14px);
                }

                [data-theme="dark"] .Imasha-modern-calendar-popover {
                    background: var(--bg-card, #101d16);
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                }

                @media (max-width: 480px) {
                    .Imasha-modern-calendar-popover {
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 90vw !important;
                        max-width: 320px;
                        min-width: 280px;
                        animation: scaleInCenterMobile 0.25s ease-out forwards !important;
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

                .Imasha-calendar-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                }

                .Imasha-cal-selectors {
                    display: flex;
                    gap: 0.5rem;
                }

                .Imasha-cal-select {
                    background: var(--bg-secondary, rgba(0, 0, 0, 0.03));
                    border: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));
                    color: var(--text-primary, #111827);
                    border-radius: 8px;
                    padding: 0.3rem 0.6rem;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    outline: none;
                    transition: all 0.2s;
                }

                [data-theme="dark"] .Imasha-cal-select {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }
                
                .Imasha-cal-select option {
                    background: var(--bg-card);
                    color: var(--text-primary);
                }

                .Imasha-calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 6px;
                }

                .Imasha-cal-day-name {
                    text-align: center;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--text-muted, #64748b);
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.05em;
                }

                .Imasha-cal-day {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: var(--text-primary, #111827);
                    border-radius: 10px;
                    border: 1px solid transparent;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                [data-theme="dark"] .Imasha-cal-day {
                    color: #fff;
                }

                .Imasha-cal-day:not(.empty):hover {
                    background: rgba(59, 130, 246, 0.1);
                    border-color: rgba(59, 130, 246, 0.2);
                    color: #3b82f6;
                }

                .Imasha-cal-day.today {
                    border-color: rgba(59, 130, 246, 0.4);
                    color: #3b82f6;
                    font-weight: 700;
                }

                .Imasha-cal-day.selected {
                    background: #3b82f6;
                    color: #fff !important;
                    border-color: #3b82f6;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
}
