import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import { useAuth } from '../../context/Imasha/AuthContext';
import '../../styles/Priya/FindSpecialist.css';

const API_BASE = `${import.meta.env.VITE_API_URL}/users/doctors`;
const APPOINTMENTS_API = `${import.meta.env.VITE_API_URL}/appointments`;

const HEALTH_CATEGORIES = [
  'all',
  'diabetes',
  'hypertension',
  'obesity',
  'heart_disease',
  'kidney_disease',
  'celiac',
  'lactose_intolerant',
  'high_cholesterol',
  'anemia',
  'osteoporosis',
  'other',
];

function formatCategoryLabel(value) {
  if (value === 'all') return 'All';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function matchSpecialist(doc, query) {
  if (!query || !query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    (doc.name || '').toLowerCase().includes(q) ||
    (doc.specialization || '').toLowerCase().includes(q) ||
    (doc.location || '').toLowerCase().includes(q)
  );
}

function getAppointmentDateBounds() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endAllowed = new Date(today);
  endAllowed.setDate(today.getDate() + 14);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    min: startCurrentWeek.toISOString().slice(0, 10),
    max: endNextWeek.toISOString().slice(0, 10),
  };
}

function isDateInAllowedRange(dateStr) {
  if (!dateStr) return false;
  const { min, max } = getAppointmentDateBounds();
  return dateStr >= min && dateStr <= max;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

function isValidPhone(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  return /^(070|071|072|074|076|077|078)\d{7}$/.test(digits);
}

function normalizePhone(phone) {
  return (phone || '').replace(/\D/g, '').slice(0, 10);
}

function getPhoneValidationMessage(phone) {
  const digits = normalizePhone(phone);
  if (!digits) return '';
  if (digits.length >= 3 && !/^(070|071|072|074|076|077|078)/.test(digits)) {
    return 'Phone must start with 070, 071, 072, 074, 076, 077, or 078.';
  }
  if (digits.length < 10) {
    return 'Phone must contain exactly 10 digits.';
  }
  if (!isValidPhone(digits)) {
    return 'Enter a valid mobile number.';
  }
  return '';
}

export default function FindSpecialistPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [dateBounds] = useState(() => getAppointmentDateBounds());
  const [form, setForm] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(API_BASE, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load specialists');

        if (isMounted) {
          setSpecialists(Array.isArray(data?.data) ? data.data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load specialists');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const filteredSpecialists = useMemo(
    () =>
      specialists.filter((doc) => {
        const conditions = Array.isArray(doc.conditions) ? doc.conditions : [];
        const matchesCategory = selectedCategory === 'all' || conditions.includes(selectedCategory);
        const matchesSearch = matchSpecialist(doc, searchQuery);
        return matchesCategory && matchesSearch;
      }),
    [specialists, searchQuery, selectedCategory]
  );

  function openBookingForm(doc) {
    if (!token) {
      toast.error('Please log in to book an appointment.');
      return;
    }

    setSelectedDoctor(doc);
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    setForm({
      patientName: fullName,
      patientEmail: user?.email || '',
      patientPhone: normalizePhone(user?.phone || ''),
      time: '',
      date: '',
    });
    setPhoneError(getPhoneValidationMessage(user?.phone || ''));
    setBookingOpen(true);
  }

  function closeBookingForm() {
    setBookingOpen(false);
    setSelectedDoctor(null);
    setBookingConfirmed(false);
    setLastBooking(null);
    setPhoneError('');
    setForm({
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      date: '',
      time: '',
    });
  }

  function onFormChange(e) {
    const { name, value } = e.target;
    if (name === 'patientPhone') {
      const nextPhone = normalizePhone(value);
      setForm((prev) => ({ ...prev, patientPhone: nextPhone }));
      setPhoneError(getPhoneValidationMessage(nextPhone));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function selectSlot(slot) {
    setForm((prev) => ({ ...prev, time: slot }));
  }

  async function submitAppointment(e) {
    e.preventDefault();
    if (!token) {
      toast.error('Please log in to book an appointment.');
      return;
    }
    if (!selectedDoctor?.id) {
      toast.error('Please select a doctor first.');
      return;
    }

    if (!form.patientName.trim()) {
      toast.error('Patient name is required.');
      return;
    }

    if (!isValidEmail(form.patientEmail)) {
      toast.error('Enter a valid patient email.');
      return;
    }

    const phoneValidationMessage = getPhoneValidationMessage(form.patientPhone);
    if (phoneValidationMessage) {
      setPhoneError(phoneValidationMessage);
      toast.error(phoneValidationMessage);
      return;
    }

    if (!form.date || !isDateInAllowedRange(form.date)) {
      toast.error('Date must be from today up to the next 2 weeks.');
      return;
    }

    if (!form.time) {
      toast.error('Please select a timeslot.');
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        doctorId: selectedDoctor.id,
        patientName: form.patientName.trim(),
        patientEmail: form.patientEmail.trim(),
        patientPhone: form.patientPhone.trim(),
        date: form.date,
        time: form.time,
        type: 'In Person',
        location: selectedDoctor.location || '',
      };

      const res = await fetch(APPOINTMENTS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to create appointment.');
      }

      if (data?.emailSent === false) {
        toast.success('Appointment booked, but email delivery failed. Please verify email config.');
      } else {
        toast.success('Appointment booked. Confirmation email sent.');
      }
      setLastBooking(data);
      setBookingConfirmed(true);
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="pr-specialist-page">
        <section className="pr-specialist-shell container">
          <header className="pr-specialist-head">
            <p className="pr-specialist-overview">Overview</p>
            <h1>Find a Specialist</h1>
            <p className="pr-specialist-subtitle">
              Connect with top-rated medical professionals from your system records.
            </p>

            <div className="pr-specialist-search-row">
              <div className="pr-specialist-search-wrap">
                <Search size={20} className="pr-specialist-search-icon" aria-hidden />
                <input
                  type="search"
                  placeholder="Search by name, specialization, or hospital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-specialist-search-input"
                  aria-label="Search specialists"
                />
              </div>
              <button type="button" className="pr-specialist-availability-btn">
                Availability
              </button>
            </div>
          </header>

          <div className="pr-specialist-filters">
            {HEALTH_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`pr-specialist-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {formatCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {loading && (
            <p className="pr-specialist-empty">Loading specialists...</p>
          )}

          {!loading && error && (
            <p className="pr-specialist-empty">{error}</p>
          )}

          {!loading && !error && filteredSpecialists.length === 0 ? (
            <p className="pr-specialist-empty">
              No specialists match your search or filter. Try a different keyword or category.
            </p>
          ) : null}

          {!loading && !error && filteredSpecialists.length > 0 ? (
            <div className="pr-specialist-grid">
              {filteredSpecialists.map((doc) => (
                <article key={doc.id} className="pr-specialist-card">
                  <div className="pr-specialist-card-image-wrap">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="pr-specialist-card-image"
                    />
                    {doc.availableToday && (
                      <span className="pr-specialist-badge">AVAILABLE TODAY</span>
                    )}
                    <div className="pr-specialist-rating">
                      <Star size={16} fill="currentColor" aria-hidden />
                      <span>{doc.rating}</span>
                    </div>
                  </div>
                  <div className="pr-specialist-card-body">
                    <h3 className="pr-specialist-card-name">{doc.name}</h3>
                    <p className="pr-specialist-card-meta">
                      {doc.specialization} - {doc.experience || 0} yrs exp.
                    </p>
                    <p className="pr-specialist-card-location">
                      <MapPin size={14} aria-hidden />
                      {doc.location}
                    </p>
                    <p className="pr-specialist-slots-label">AVAILABLE SLOTS</p>
                    <div className="pr-specialist-slots">
                      {(doc.slots || []).map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className="pr-specialist-slot-btn"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="pr-specialist-book-btn"
                      onClick={() => openBookingForm(doc)}
                    >
                      Book Now
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </main>

      {bookingOpen && selectedDoctor ? (
        <div className="pr-booking-overlay" onClick={closeBookingForm}>
          <section className="pr-booking-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="pr-booking-close" onClick={closeBookingForm} aria-label="Close booking form">
              x
            </button>
            {bookingConfirmed ? (
              <div className="pr-booking-success">
                <div className="pr-booking-success-icon">✓</div>
                <h2>Booking Received</h2>
                <p className="pr-booking-subtitle">
                  We have received your appointment request.
                </p>
                <div className="pr-booking-success-card">
                  <p><strong>Status:</strong> Pending confirmation</p>
                  <p><strong>Doctor:</strong> {lastBooking?.doctor || selectedDoctor.name}</p>
                  <p><strong>Date:</strong> {lastBooking?.date || form.date}</p>
                  <p><strong>Time:</strong> {lastBooking?.time || form.time}</p>
                  <p>
                    <strong>Email:</strong>{' '}
                    {lastBooking?.emailSent === false
                      ? `Failed (${lastBooking?.emailError || 'SMTP issue'})`
                      : 'Confirmation email sent'}
                  </p>
                </div>
                <div className="pr-booking-success-actions">
                  <button
                    type="button"
                    className="pr-booking-submit"
                    onClick={() => {
                      closeBookingForm();
                      navigate('/appointment');
                    }}
                  >
                    View Appointments
                  </button>
                  <button
                    type="button"
                    className="pr-booking-secondary"
                    onClick={() => {
                      closeBookingForm();
                      navigate('/find-specialist');
                    }}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="pr-booking-overview">Book Your Appointment</p>
                <h2>{selectedDoctor.name}</h2>
                <p className="pr-booking-subtitle">
                  Schedule your consultation with healthcare professionals in just a few steps.
                </p>

                <form className="pr-booking-form" onSubmit={submitAppointment}>
                  <label htmlFor="patientName">Patient Name</label>
                  <input
                    id="patientName"
                    name="patientName"
                    value={form.patientName}
                    onChange={onFormChange}
                    placeholder="e.g. John Doe"
                    required
                  />

                  <div className="pr-booking-row">
                    <div>
                      <label htmlFor="patientEmail">Patient Email</label>
                      <input
                        id="patientEmail"
                        name="patientEmail"
                        value={form.patientEmail}
                        onChange={onFormChange}
                        placeholder="john@example.com"
                        type="email"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="patientPhone">Patient Phone</label>
                      <input
                        id="patientPhone"
                        name="patientPhone"
                        value={form.patientPhone}
                        onChange={onFormChange}
                        placeholder="0771234567"
                        inputMode="numeric"
                        maxLength={10}
                        aria-invalid={phoneError ? 'true' : 'false'}
                        required
                      />
                      {phoneError ? <p className="pr-field-error">{phoneError}</p> : null}
                    </div>
                  </div>

                  <div className="pr-booking-row">
                    <div>
                      <label htmlFor="appointmentDate">Date</label>
                      <input
                        id="appointmentDate"
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={onFormChange}
                        min={dateBounds.min}
                        max={dateBounds.max}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="appointmentTime">Time (Timeslot)</label>
                      <select
                        id="appointmentTime"
                        name="time"
                        value={form.time}
                        onChange={onFormChange}
                        required
                      >
                        <option value="">Select a time</option>
                        {(selectedDoctor.slots || []).map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p className="pr-booking-note">
                    Allowed dates: from today up to the next 2 weeks.
                  </p>

                  <div className="pr-booking-slots">
                    {(selectedDoctor.slots || []).map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`pr-booking-slot ${form.time === slot ? 'active' : ''}`}
                        onClick={() => selectSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <button type="submit" className="pr-booking-submit" disabled={bookingLoading}>
                    {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      ) : null}

      <Footer />
      <ScrollToTop />
    </>
  );
}
