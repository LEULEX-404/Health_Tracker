import React, { useEffect, useState } from 'react';
import { Star, MapPin, User, Mail, Phone, Calendar, Clock, ShieldCheck, RefreshCw, ChevronRight, X } from 'lucide-react';
import { apiUrl } from '../lib/api';

const SPECIALIST_IMAGE_PATHS = [
    '/specialists/doctor-01.png',
    '/specialists/doctor-02.png',
    '/specialists/doctor-03.png',
    '/specialists/doctor-04.png',
    '/specialists/doctor-05.png',
    '/specialists/doctor-06.png',
    '/specialists/doctor-07.png',
    '/specialists/doctor-08.png',
    '/specialists/doctor-09.png',
    '/specialists/doctor-10.png',
    '/specialists/doctor-11.png',
    '/specialists/doctor-12.png',
    '/specialists/doctor-13.png',
    '/specialists/doctor-14.png',
    '/specialists/doctor-15.png',
];

const withSpecialistImages = (list) =>
    list.map((doctor, index) => ({
        ...doctor,
        fallbackImage: doctor.image,
        image: SPECIALIST_IMAGE_PATHS[index % SPECIALIST_IMAGE_PATHS.length]
    }));

const MAX_SPECIALISTS = 15;

const DEFAULT_DOCTORS = [
    { id: 1, name: "Dr. Sarah Jenkins", specialty: "Cardiologist", experience: "12 yrs exp.", location: "Metro Heart Institute, NY", rating: 4.9, fee: 120, availableSlots: ["02:00 PM", "04:30 PM", "05:15 PM"], image: "https://i.pravatar.cc/150?img=5" },
    { id: 2, name: "Dr. Marcus Chen", specialty: "General Physician", experience: "8 yrs exp.", location: "City Wellness Clinic, SF", rating: 4.8, fee: 85, availableSlots: ["10:00 AM"], image: "https://i.pravatar.cc/150?img=11" },
    { id: 3, name: "Dr. Elena Rodriguez", specialty: "Dermatologist", experience: "10 yrs exp.", location: "Skin Care Central, LA", rating: 5.0, fee: 150, availableSlots: ["04:30 PM", "06:00 PM"], image: "https://i.pravatar.cc/150?img=9" },
    { id: 4, name: "Dr. James Wilson", specialty: "Neurologist", experience: "15 yrs exp.", location: "Brain Health Center, CHI", rating: 4.7, fee: 200, availableSlots: ["Mon, 09:00 AM"], image: "https://i.pravatar.cc/150?img=8" },
    { id: 5, name: "Dr. Priya Sharma", specialty: "Pediatrician", experience: "9 yrs exp.", location: "Children's Health Hub, Boston", rating: 4.9, fee: 95, availableSlots: ["11:00 AM", "03:00 PM", "04:00 PM"], image: "https://i.pravatar.cc/150?img=1" },
    { id: 6, name: "Dr. David Kim", specialty: "Orthopedic Surgeon", experience: "14 yrs exp.", location: "Sports Medicine Center, Denver", rating: 4.8, fee: 180, availableSlots: ["09:30 AM", "02:30 PM"], image: "https://i.pravatar.cc/150?img=12" },
    { id: 7, name: "Dr. Amanda Foster", specialty: "Psychiatrist", experience: "11 yrs exp.", location: "Mind Wellness Clinic, Seattle", rating: 5.0, fee: 175, availableSlots: ["10:00 AM", "01:00 PM", "05:00 PM"], image: "https://i.pravatar.cc/150?img=16" },
    { id: 8, name: "Dr. Robert Hayes", specialty: "Cardiologist", experience: "18 yrs exp.", location: "Cardiac Care Associates, Miami", rating: 4.9, fee: 220, availableSlots: ["08:00 AM", "11:30 AM", "03:00 PM"], image: "https://i.pravatar.cc/150?img=13" },
    { id: 9, name: "Dr. Michelle Park", specialty: "Dermatologist", experience: "7 yrs exp.", location: "Glow Dermatology, Austin", rating: 4.7, fee: 140, availableSlots: ["02:00 PM", "04:00 PM", "05:30 PM"], image: "https://i.pravatar.cc/150?img=20" },
    { id: 10, name: "Dr. Thomas Wright", specialty: "Neurologist", experience: "16 yrs exp.", location: "Neuro Care Institute, Phoenix", rating: 4.8, fee: 195, availableSlots: ["Mon, 10:00 AM", "Wed, 02:00 PM"], image: "https://i.pravatar.cc/150?img=15" },
    { id: 11, name: "Dr. Jennifer Lee", specialty: "Obstetrician", experience: "10 yrs exp.", location: "Women's Health Center, Atlanta", rating: 4.9, fee: 160, availableSlots: ["09:00 AM", "12:00 PM", "04:30 PM"], image: "https://i.pravatar.cc/150?img=23" },
    { id: 12, name: "Dr. Michael Torres", specialty: "General Physician", experience: "6 yrs exp.", location: "Family First Medical, Portland", rating: 4.6, fee: 80, availableSlots: ["08:00 AM", "01:00 PM"], image: "https://i.pravatar.cc/150?img=14" },
    { id: 13, name: "Dr. Rachel Green", specialty: "Pediatrician", experience: "12 yrs exp.", location: "Little Stars Pediatrics, Nashville", rating: 5.0, fee: 100, availableSlots: ["11:30 AM", "02:00 PM", "03:30 PM"], image: "https://i.pravatar.cc/150?img=25" },
    { id: 14, name: "Dr. Kevin Patel", specialty: "Orthopedics", experience: "13 yrs exp.", location: "Bone & Joint Clinic, Dallas", rating: 4.8, fee: 170, availableSlots: ["10:00 AM", "04:00 PM"], image: "https://i.pravatar.cc/150?img=33" },
    { id: 15, name: "Dr. Lisa Martinez", specialty: "Cardiologist", experience: "11 yrs exp.", location: "Heart & Vascular Center, Houston", rating: 4.9, fee: 130, availableSlots: ["08:30 AM", "12:30 PM", "05:00 PM"], image: "https://i.pravatar.cc/150?img=26" },
    { id: 16, name: "Dr. Andrew Clark", specialty: "Dermatology", experience: "9 yrs exp.", location: "Clear Skin Clinic, San Diego", rating: 4.7, fee: 145, availableSlots: ["01:00 PM", "03:00 PM", "06:00 PM"], image: "https://i.pravatar.cc/150?img=32" },
    { id: 17, name: "Dr. Sophia Nguyen", specialty: "Neurology", experience: "14 yrs exp.", location: "Pacific Neuro Center, Oakland", rating: 4.9, fee: 210, availableSlots: ["Tue, 09:00 AM", "Thu, 02:00 PM"], image: "https://i.pravatar.cc/150?img=28" },
    { id: 18, name: "Dr. Daniel Brown", specialty: "Psychiatrist", experience: "8 yrs exp.", location: "Calm Mind Therapy, Chicago", rating: 4.8, fee: 165, availableSlots: ["10:30 AM", "02:00 PM", "04:00 PM"], image: "https://i.pravatar.cc/150?img=34" },
    { id: 19, name: "Dr. Emily Watson", specialty: "Pediatrics", experience: "7 yrs exp.", location: "Happy Kids Medical, Minneapolis", rating: 4.9, fee: 90, availableSlots: ["09:00 AM", "11:00 AM", "03:00 PM"], image: "https://i.pravatar.cc/150?img=30" },
    { id: 20, name: "Dr. Christopher Moore", specialty: "General Physician", experience: "15 yrs exp.", location: "Downtown Health Clinic, DC", rating: 4.8, fee: 95, availableSlots: ["08:00 AM", "12:00 PM", "05:30 PM"], image: "https://i.pravatar.cc/150?img=38" },
    { id: 21, name: "Dr. Natalie Brooks", specialty: "Cardiologist", experience: "10 yrs exp.", location: "Valley Heart Clinic, Phoenix", rating: 4.9, fee: 125, availableSlots: ["09:00 AM", "01:00 PM", "04:00 PM"], image: "https://i.pravatar.cc/150?img=41" },
    { id: 22, name: "Dr. Ryan Mitchell", specialty: "Dermatologist", experience: "8 yrs exp.", location: "Derm Solutions, Tampa", rating: 4.7, fee: 135, availableSlots: ["11:00 AM", "02:30 PM", "05:00 PM"], image: "https://i.pravatar.cc/150?img=42" },
    { id: 23, name: "Dr. Olivia Carter", specialty: "Pediatrician", experience: "11 yrs exp.", location: "Sunshine Pediatrics, Orlando", rating: 5.0, fee: 92, availableSlots: ["08:30 AM", "12:00 PM", "03:30 PM"], image: "https://i.pravatar.cc/150?img=43" },
    { id: 24, name: "Dr. Brandon Lee", specialty: "Neurologist", experience: "17 yrs exp.", location: "Advanced Neuro Care, Boston", rating: 4.8, fee: 205, availableSlots: ["Mon, 11:00 AM", "Fri, 09:00 AM"], image: "https://i.pravatar.cc/150?img=44" },
    { id: 25, name: "Dr. Hannah Reed", specialty: "Orthopedics", experience: "9 yrs exp.", location: "Peak Performance Ortho, Denver", rating: 4.8, fee: 165, availableSlots: ["10:00 AM", "02:00 PM"], image: "https://i.pravatar.cc/150?img=45" },
    { id: 26, name: "Dr. Nathan Scott", specialty: "General Physician", experience: "12 yrs exp.", location: "Community Health, Cleveland", rating: 4.7, fee: 88, availableSlots: ["09:00 AM", "02:00 PM"], image: "https://i.pravatar.cc/150?img=46" },
    { id: 27, name: "Dr. Victoria Adams", specialty: "Psychiatrist", experience: "13 yrs exp.", location: "Serenity Mental Health, San Jose", rating: 4.9, fee: 180, availableSlots: ["10:30 AM", "01:30 PM", "04:30 PM"], image: "https://i.pravatar.cc/150?img=47" },
    { id: 28, name: "Dr. Justin Turner", specialty: "Cardiologist", experience: "14 yrs exp.", location: "Heart Wellness Group, Detroit", rating: 4.9, fee: 140, availableSlots: ["08:00 AM", "11:00 AM", "03:00 PM"], image: "https://i.pravatar.cc/150?img=48" },
    { id: 29, name: "Dr. Isabella Garcia", specialty: "Dermatology", experience: "6 yrs exp.", location: "Radiant Skin Studio, Miami", rating: 4.8, fee: 155, availableSlots: ["01:00 PM", "03:30 PM", "06:00 PM"], image: "https://i.pravatar.cc/150?img=49" },
    { id: 30, name: "Dr. Tyler Phillips", specialty: "Pediatrics", experience: "8 yrs exp.", location: "First Steps Pediatric Care, Charlotte", rating: 4.9, fee: 85, availableSlots: ["09:30 AM", "11:30 AM", "02:00 PM"], image: "https://i.pravatar.cc/150?img=50" },
    { id: 31, name: "Dr. Rebecca Collins", specialty: "Cardiologist", experience: "13 yrs exp.", location: "Summit Cardiac Institute, Denver", rating: 4.9, fee: 145, availableSlots: ["09:00 AM", "11:00 AM", "02:30 PM"], image: "https://i.pravatar.cc/150?img=51" },
    { id: 32, name: "Dr. William Foster", specialty: "Cardiologist", experience: "19 yrs exp.", location: "Premier Heart Center, Baltimore", rating: 5.0, fee: 235, availableSlots: ["08:00 AM", "12:00 PM", "04:00 PM"], image: "https://i.pravatar.cc/150?img=52" },
];

const SPECIALTY_FILTERS = [
    'All Specialists',
    'General Physician',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Psychiatry',
    'Obstetrics',
];

function doctorMatchesSpecialty(doc, filter) {
    if (filter === 'All Specialists') return true;
    const s = doc.specialty.toLowerCase();
    const f = filter.toLowerCase();
    if (f === 'orthopedics') return s.includes('orthoped');
    if (f === 'pediatrics') return s.includes('pediatr');
    if (f === 'psychiatry') return s.includes('psych');
    if (f === 'obstetrics') return s.includes('obstet');
    return s.includes(f);
}

function isCardiologyDoctor(doc) {
    return doc.specialty.toLowerCase().includes('cardio');
}

const prepareDoctors = (list) =>
    withSpecialistImages(
        list
            .filter((doctor) => !isCardiologyDoctor(doctor))
            .slice(0, MAX_SPECIALISTS)
    );

function hasAvailableTodaySlot(doc) {
    if (!doc.availableSlots || !doc.availableSlots.length) return false;
    const dayPrefix = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s/i;
    return doc.availableSlots.some(slot => !dayPrefix.test(slot.trim()));
}

const SLOT_WEEKDAY_MAP = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getWeekdayFromSlot(slot) {
    if (!slot || typeof slot !== 'string') return null;
    const m = slot.trim().match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s/i);
    if (!m) return null;
    const key = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    return SLOT_WEEKDAY_MAP[key];
}

function getMinDateForSlotWeekday(slot) {
    const weekday = getWeekdayFromSlot(slot);
    if (weekday === null) return new Date().toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay();
    let add = weekday - day;
    if (add < 0) add += 7;
    const next = new Date(today);
    next.setDate(today.getDate() + add);
    return next.toISOString().split('T')[0];
}

function getMaxDateForTwoWeekWindow() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay();
    const daysUntilEndOfNextWeek = (14 - day);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + daysUntilEndOfNextWeek);
    return maxDate.toISOString().split('T')[0];
}

function isWithinTwoWeekWindow(dateValue) {
    if (!dateValue) return false;
    const [y, m, d] = dateValue.split('-').map(Number);
    const selected = new Date(y, m - 1, d);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const day = today.getDay();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + (14 - day));

    return selected >= today && selected <= maxDate;
}

const DOCTORS_PER_PAGE = 8;

function getPageNumbers(totalPages, currentPage) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
        return [1, 2, 3, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
        return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

const FindSpecialist = () => {
    const [doctors, setDoctors] = useState(prepareDoctors(DEFAULT_DOCTORS));
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialists');
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [bookingDoctor, setBookingDoctor] = useState(null);
    const [bookingForm, setBookingForm] = useState({ fullName: '', email: '', phone: '', preferredDate: '', timeSlot: '' });
    const [bookingErrors, setBookingErrors] = useState({ fullName: '', email: '', phone: '', preferredDate: '', timeSlot: '' });
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingEmailPreviewUrl, setBookingEmailPreviewUrl] = useState(null);
    const [bookingSubmitError, setBookingSubmitError] = useState('');

    useEffect(() => {
        fetch(apiUrl('/api/doctors'))
            .then(res => res.json())
            .then(data => {
                // Only use API data if it has at least as many doctors as our default list
                const list = Array.isArray(data) && data.length >= DEFAULT_DOCTORS.length ? data : DEFAULT_DOCTORS;
                setDoctors(prepareDoctors(list));
            })
            .catch(() => setDoctors(prepareDoctors(DEFAULT_DOCTORS)));
    }, []);

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = !searchTerm || doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = doctorMatchesSpecialty(doc, selectedSpecialty);
        const matchesAvailability = !showAvailableOnly || hasAvailableTodaySlot(doc);
        return matchesSearch && matchesSpecialty && matchesAvailability;
    });

    const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / DOCTORS_PER_PAGE));
    const pageStart = (currentPage - 1) * DOCTORS_PER_PAGE;
    const doctorsForPage = filteredDoctors.slice(pageStart, pageStart + DOCTORS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedSpecialty, showAvailableOnly]);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const pageNumbers = getPageNumbers(totalPages, currentPage);

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ marginBottom: '16px' }}>Find a Specialist</h1>
                <p style={{ color: '#6b7280' }}>Connect with 120+ top-rated medical professionals.</p>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <input
                    type="text"
                    placeholder="Search by name, specialization, or hospital..."
                    style={{ flex: 1, padding: '12px 16px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setShowAvailableOnly(prev => !prev)}
                    style={{
                        background: showAvailableOnly ? '#3b82f6' : undefined,
                        color: showAvailableOnly ? 'white' : undefined,
                        borderColor: showAvailableOnly ? '#3b82f6' : undefined
                    }}
                >
                    Availability
                </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px', flexWrap: 'nowrap' }}>
                {SPECIALTY_FILTERS.map(spec => (
                    <button
                        key={spec}
                        type="button"
                        onClick={() => setSelectedSpecialty(spec)}
                        style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: '1px solid #e5e7eb',
                            background: selectedSpecialty === spec ? '#3b82f6' : 'white',
                            color: selectedSpecialty === spec ? 'white' : '#374151',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {spec}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {doctorsForPage.map(doctor => (
                    <div key={doctor.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={doctor.image}
                                alt={doctor.name}
                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                onError={(event) => {
                                    if (doctor.fallbackImage && event.currentTarget.src !== doctor.fallbackImage) {
                                        event.currentTarget.src = doctor.fallbackImage;
                                    }
                                }}
                            />
                            <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Star size={14} fill="#fbbf24" strokeWidth={0} /> {doctor.rating}
                            </span>
                            <span className="badge" style={{ position: 'absolute', bottom: '12px', left: '12px', background: '#10b981', color: 'white' }}>AVAILABLE TODAY</span>
                        </div>

                        <div style={{ padding: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{doctor.name}</h3>
                            <div style={{ color: '#3b82f6', fontSize: '0.9rem', marginBottom: '8px' }}>{doctor.specialty} • {doctor.experience}</div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.85rem', marginBottom: '16px' }}>
                                <MapPin size={14} /> {doctor.location}
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af', marginBottom: '8px' }}>AVAILABLE SLOTS</div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {doctor.availableSlots.map(slot => (
                                        <span key={slot} style={{ background: '#f3f4f6', padding: '6px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>{slot}</span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        setBookingDoctor(doctor);
                                        setBookingForm({ fullName: '', email: '', phone: '', preferredDate: '', timeSlot: '' });
                                        setBookingErrors({ fullName: '', email: '', phone: '', preferredDate: '', timeSlot: '' });
                                        setBookingSuccess(false);
                                        setBookingEmailPreviewUrl(null);
                                        setBookingSubmitError('');
                                    }}
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            background: '#f9fafb',
                            color: currentPage === 1 ? '#9ca3af' : '#374151',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        &lt;
                    </button>
                    {pageNumbers.map((pn, i) =>
                        pn === '...' ? (
                            <span key={`ellipsis-${i}`} style={{ padding: '8px 4px', color: '#6b7280' }}>...</span>
                        ) : (
                            <button
                                key={pn}
                                type="button"
                                onClick={() => setCurrentPage(pn)}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    background: currentPage === pn ? '#3b82f6' : '#f9fafb',
                                    color: currentPage === pn ? 'white' : '#374151',
                                    cursor: 'pointer'
                                }}
                            >
                                {pn}
                            </button>
                        )
                    )}
                    <button
                        type="button"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            background: '#f9fafb',
                            color: currentPage === totalPages ? '#9ca3af' : '#374151',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        &gt;
                    </button>
                </div>
            )}

            {bookingDoctor && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '24px',
                        overflowY: 'auto'
                    }}
                    onClick={(e) => e.target === e.currentTarget && setBookingDoctor(null)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            maxWidth: '560px',
                            width: '100%',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => { setBookingDoctor(null); setBookingSuccess(false); setBookingEmailPreviewUrl(null); }}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: '#6b7280'
                            }}
                        >
                            <X size={24} />
                        </button>

                        {bookingSuccess ? (
                            <div style={{ padding: '24px 0', textAlign: 'center' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>✓</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px', color: '#1f2937' }}>Booking Successful</h2>
                                <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: 1.6, marginBottom: '12px' }}>
                                    Booking Successful. After confirm the booking, we will send the meeting details to the email. thank you
                                </p>
                                {bookingForm.email && (
                                    <p style={{ color: '#3b82f6', fontSize: '0.95rem', marginBottom: '12px' }}>
                                        We will send the details to <strong>{bookingForm.email}</strong>.
                                    </p>
                                )}
                                <p style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '500', marginBottom: '16px' }}>Thank you!</p>
                                {bookingEmailPreviewUrl && (
                                    <p style={{ marginBottom: '24px' }}>
                                        <a href={bookingEmailPreviewUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '0.95rem', textDecoration: 'underline' }}>
                                            View confirmation email (test preview)
                                        </a>
                                    </p>
                                )}
                                {!bookingEmailPreviewUrl && bookingForm.email && (
                                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '24px' }}>Check your inbox at {bookingForm.email} for the confirmation email.</p>
                                )}
                                {bookingSubmitError && (
                                    <p style={{ marginBottom: '16px', color: '#ef4444', fontSize: '0.9rem' }}>{bookingSubmitError}</p>
                                )}
                                <button
                                    type="button"
                                    className="btn-primary"
                                    style={{ padding: '12px 24px' }}
                                    onClick={() => { setBookingDoctor(null); setBookingSuccess(false); setBookingEmailPreviewUrl(null); setBookingSubmitError(''); }}
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: '#1f2937' }}>Book Your Appointment</h2>
                                <p style={{ color: '#3b82f6', fontSize: '0.95rem', marginBottom: '24px' }}>
                                    Schedule your consultation with {bookingDoctor.name} in just a few steps.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${bookingErrors.fullName ? '#ef4444' : '#d1d5db'}`, borderRadius: '8px', padding: '10px 12px' }}>
                                            <User size={18} color={bookingErrors.fullName ? '#ef4444' : '#9ca3af'} />
                                            <input
                                                type="text"
                                                placeholder="e.g. John Doe"
                                                value={bookingForm.fullName}
                                                onChange={e => { setBookingForm(f => ({ ...f, fullName: e.target.value })); setBookingErrors(err => ({ ...err, fullName: '' })); }}
                                                style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.95rem' }}
                                            />
                                        </div>
                                        {bookingErrors.fullName && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>{bookingErrors.fullName}</p>}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${bookingErrors.email ? '#ef4444' : '#d1d5db'}`, borderRadius: '8px', padding: '10px 12px' }}>
                                                <Mail size={18} color={bookingErrors.email ? '#ef4444' : '#9ca3af'} />
                                                <input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={bookingForm.email}
                                                    onChange={e => { setBookingForm(f => ({ ...f, email: e.target.value })); setBookingErrors(err => ({ ...err, email: '' })); }}
                                                    onBlur={() => {
                                                        const email = bookingForm.email.trim();
                                                        if (!email) setBookingErrors(err => ({ ...err, email: '' }));
                                                        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setBookingErrors(err => ({ ...err, email: 'Please enter a valid email address' }));
                                                        else setBookingErrors(err => ({ ...err, email: '' }));
                                                    }}
                                                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.95rem' }}
                                                />
                                            </div>
                                            {bookingErrors.email && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>{bookingErrors.email}</p>}
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>Phone Number (10 digits)</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${bookingErrors.phone ? '#ef4444' : '#d1d5db'}`, borderRadius: '8px', padding: '10px 12px' }}>
                                                <Phone size={18} color={bookingErrors.phone ? '#ef4444' : '#9ca3af'} />
                                                <input
                                                    type="tel"
                                                    inputMode="numeric"
                                                    placeholder="e.g. 0771234567"
                                                    maxLength={10}
                                                    value={bookingForm.phone}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
                                                        setBookingForm(f => ({ ...f, phone: digitsOnly }));
                                                        setBookingErrors(err => ({ ...err, phone: '' }));
                                                    }}
                                                    onBlur={() => {
                                                        const phone = bookingForm.phone.trim();
                                                        const slPhoneRegex = /^(?:0|94|\+94)?(7[01245678]\d{7})$/;
                                                        if (!phone) setBookingErrors(err => ({ ...err, phone: '' }));
                                                        else if (!slPhoneRegex.test(phone)) setBookingErrors(err => ({ ...err, phone: 'Please enter a valid 10-digit mobile number (e.g. 0771234567)' }));
                                                        else setBookingErrors(err => ({ ...err, phone: '' }));
                                                    }}
                                                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.95rem' }}
                                                />
                                            </div>
                                            {bookingErrors.phone && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>{bookingErrors.phone}</p>}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>
                                                Preferred Date{getWeekdayFromSlot(bookingForm.timeSlot) !== null ? ` (${WEEKDAY_LABELS[getWeekdayFromSlot(bookingForm.timeSlot)]} only)` : ''}
                                            </label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${bookingErrors.preferredDate ? '#ef4444' : '#d1d5db'}`, borderRadius: '8px', padding: '10px 12px' }}>
                                                <Calendar size={18} color={bookingErrors.preferredDate ? '#ef4444' : '#9ca3af'} />
                                                <input
                                                    type="date"
                                                    value={bookingForm.preferredDate}
                                                    min={getMinDateForSlotWeekday(bookingForm.timeSlot)}
                                                    max={getMaxDateForTwoWeekWindow()}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        if (val && !isWithinTwoWeekWindow(val)) {
                                                            setBookingErrors(err => ({ ...err, preferredDate: 'Please select a date within this week or next week only.' }));
                                                            return;
                                                        }
                                                        const slotDay = getWeekdayFromSlot(bookingForm.timeSlot);
                                                        if (val && slotDay !== null) {
                                                            const [y, m, d] = val.split('-').map(Number);
                                                            const selectedDay = new Date(y, m - 1, d).getDay();
                                                            if (selectedDay !== slotDay) {
                                                                setBookingErrors(err => ({ ...err, preferredDate: `This slot is only available on ${WEEKDAY_LABELS[slotDay]}s.` }));
                                                                return;
                                                            }
                                                        }
                                                        setBookingForm(f => ({ ...f, preferredDate: val }));
                                                        setBookingErrors(err => ({ ...err, preferredDate: '' }));
                                                    }}
                                                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.95rem' }}
                                                />
                                            </div>
                                            {bookingErrors.preferredDate && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>{bookingErrors.preferredDate}</p>}
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>Available Time Slot</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${bookingErrors.timeSlot ? '#ef4444' : '#d1d5db'}`, borderRadius: '8px', padding: '10px 12px' }}>
                                                <Clock size={18} color={bookingErrors.timeSlot ? '#ef4444' : '#9ca3af'} />
                                                <select
                                                    value={bookingForm.timeSlot}
                                                    onChange={e => { setBookingForm(f => ({ ...f, timeSlot: e.target.value })); setBookingErrors(err => ({ ...err, timeSlot: '' })); }}
                                                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.95rem', background: 'transparent', color: bookingForm.timeSlot ? '#1f2937' : '#9ca3af' }}
                                                >
                                                    <option value="">Select a time</option>
                                                    {bookingDoctor.availableSlots.map(slot => (
                                                        <option key={slot} value={slot}>{slot}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {bookingErrors.timeSlot && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>{bookingErrors.timeSlot}</p>}
                                        </div>
                                    </div>



                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                        <button
                                            type="button"
                                            className="btn-outline"
                                            style={{ flex: 1, padding: '14px', fontSize: '1rem' }}
                                            onClick={() => { setBookingDoctor(null); setBookingSuccess(false); setBookingEmailPreviewUrl(null); }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            style={{ flex: 1, padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                            onClick={() => {
                                                const fullName = bookingForm.fullName.trim();
                                                const email = bookingForm.email.trim();
                                                const phone = bookingForm.phone.trim();
                                                const preferredDate = bookingForm.preferredDate;
                                                const timeSlot = bookingForm.timeSlot;
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                let selectedDate = null;
                                                if (preferredDate) {
                                                    const [y, m, d] = preferredDate.split('-').map(Number);
                                                    selectedDate = new Date(y, m - 1, d);
                                                }
                                                const isPastDate = selectedDate && selectedDate < today;

                                                // Phone Validation Logic for Sri Lanka
                                                // Allowed prefixes (after 0 or +94): 70, 71, 72, 74, 75, 76, 77, 78
                                                const slPhoneRegex = /^(?:0|94|\+94)?(7[01245678]\d{7})$/;
                                                const phoneValid = slPhoneRegex.test(phone);

                                                const slotWeekday = getWeekdayFromSlot(timeSlot);
                                                let preferredDateError = '';
                                                if (!preferredDate) preferredDateError = 'Please select a date';
                                                else if (isPastDate) preferredDateError = 'Appointment date cannot be in the past';
                                                else if (!isWithinTwoWeekWindow(preferredDate)) preferredDateError = 'Please select a date within this week or next week only.';
                                                else if (slotWeekday !== null && selectedDate) {
                                                    const selectedDay = selectedDate.getDay();
                                                    if (selectedDay !== slotWeekday) {
                                                        preferredDateError = `This slot is only available on ${WEEKDAY_LABELS[slotWeekday]}s. Please select a ${WEEKDAY_LABELS[slotWeekday]}.`;
                                                    }
                                                }
                                                const errors = {
                                                    fullName: !fullName ? 'Full name is required' : '',
                                                    email: !email ? 'Email is required' : (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Please enter a valid email address' : ''),
                                                    phone: !phone ? 'Phone number is required' : (!phoneValid ? 'Please enter a valid 10-digit mobile number (e.g. 0771234567)' : ''),
                                                    preferredDate: preferredDateError,
                                                    timeSlot: !timeSlot ? 'Please select a time slot' : ''
                                                };
                                                setBookingErrors(errors);
                                                const hasErrors = Object.values(errors).some(Boolean);
                                                if (!hasErrors) {
                                                    setBookingSubmitError('');
                                                    let appointmentCreated = false;
                                                    const appointmentPayload = {
                                                        doctor: bookingDoctor.name,
                                                        specialty: bookingDoctor.specialty,
                                                        date: preferredDate,
                                                        time: timeSlot,
                                                        avatar: bookingDoctor.image,
                                                        location: bookingDoctor.location || 'Clinic',
                                                        type: 'In Person',
                                                        patientEmail: email,
                                                        patientName: fullName,
                                                        patientPhone: phone
                                                    };
                                                    fetch(apiUrl('/api/appointments'), {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(appointmentPayload)
                                                    }).then(async (appointmentResponse) => {
                                                        if (!appointmentResponse.ok) {
                                                            const errData = await appointmentResponse.json().catch(() => ({}));
                                                            throw new Error(errData.message || 'Failed to create appointment.');
                                                        }
                                                        appointmentCreated = true;
                                                        setBookingSuccess(true);
                                                    }).catch((error) => {
                                                        const isAppointmentCreateFailure = !appointmentCreated;

                                                        const message = isAppointmentCreateFailure
                                                            ? (error?.message === 'Failed to fetch'
                                                                ? 'Cannot reach backend API. Start backend server on http://localhost:5000 and try again.'
                                                                : (error.message || 'Booking failed. Please try again.'))
                                                            : (error?.message || 'Booking was saved; check your email for confirmation.');
                                                        setBookingSubmitError(message);
                                                    });
                                                }
                                            }}
                                        >
                                            Confirm Booking <ChevronRight size={20} />
                                        </button>
                                    </div>
                                    {bookingSubmitError && (
                                        <p style={{ marginTop: '8px', color: '#ef4444', fontSize: '0.9rem' }}>{bookingSubmitError}</p>
                                    )}

                                    <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px', lineHeight: 1.5 }}>
                                        By booking, you agree to HealthSync's{' '}
                                        <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms of Service</a>
                                        {' '}and{' '}
                                        <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Privacy Policy</a>
                                        {' '}regarding your health data protection.
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                        <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <ShieldCheck size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>HIPAA Compliant</div>
                                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Your medical data is encrypted and stored securely.</div>
                                            </div>
                                        </div>
                                        <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <RefreshCw size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Flexible Rescheduling</div>
                                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Cancel or change your slot up to 24 hours before.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
        </div>
                </div >
            )}
        </div >
    );
};

export default FindSpecialist;
