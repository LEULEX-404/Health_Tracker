import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import { useAuth } from '../../context/Imasha/AuthContext';
import '../../styles/Priya/Appointment.css';

const APPOINTMENTS_API = 'http://localhost:5000/api/appointments';
const BACKEND_ORIGIN = 'http://localhost:5000';
const FALLBACK_DOCTOR_IMAGE = '/images/Priya/doctor-01.png';

function resolveAvatarSrc(src) {
  if (!src || !String(src).trim()) return FALLBACK_DOCTOR_IMAGE;
  const value = String(src).trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `${BACKEND_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`;
}

function parseAppointmentDate(dateStr) {
  const date = new Date(`${dateStr || ''}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizePhone(phone) {
  return (phone || '').replace(/\D/g, '').slice(0, 10);
}

function isValidSriLankaMobile(phone) {
  return /^(070|071|072|074|075|076|077|078)\d{7}$/.test(normalizePhone(phone));
}

function getPhoneValidationMessage(phone) {
  const digits = normalizePhone(phone);
  if (!digits) return 'Phone is required';
  if (digits.length >= 3 && !/^(070|071|072|074|075|076|077|078)/.test(digits)) {
    return 'Phone must start with 070, 071, 072, 074, 075, 076, 077, or 078.';
  }
  if (digits.length < 10) {
    return 'Phone must contain exactly 10 digits.';
  }
  if (!isValidSriLankaMobile(digits)) {
    return 'Enter a valid mobile number.';
  }
  return '';
}

export default function AppointmentPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editForm, setEditForm] = useState({ patientName: '', patientPhone: '' });
  const [editPhoneError, setEditPhoneError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [doctorFilter, setDoctorFilter] = useState('');

  const myEmail = (user?.email || '').toLowerCase();
  const myId = user?.id || user?._id;
  const myName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim().toLowerCase();

  const loadAppointments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(APPOINTMENTS_API, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load appointments');

      const list = Array.isArray(data) ? data : [];
      const mine = list.filter((item) => {
        const byUserId = myId && (item.patientUserId === myId || item.patientUserId?._id === myId);
        const byEmail = (item.patientEmail || '').toLowerCase() === myEmail;
        const byName = (item.patientName || '').toLowerCase() === myName;
        return byUserId || byEmail || byName;
      });
      setAppointments(mine);
    } catch (err) {
      toast.error(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [token, myEmail, myId, myName]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  function startEdit(apt) {
    setEditingId(apt._id);
    setEditingAppointment(apt);
    setEditForm({
      patientName: apt.patientName || '',
      patientPhone: apt.patientPhone || '',
    });
    setEditPhoneError(getPhoneValidationMessage(apt.patientPhone || ''));
  }

  function cancelEdit() {
    setEditingId('');
    setEditingAppointment(null);
    setEditForm({ patientName: '', patientPhone: '' });
    setEditPhoneError('');
  }

  async function saveEdit(id) {
    if (!editForm.patientName.trim() || !editForm.patientPhone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    const phoneValidationMessage = getPhoneValidationMessage(editForm.patientPhone);
    if (phoneValidationMessage) {
      setEditPhoneError(phoneValidationMessage);
      toast.error(phoneValidationMessage);
      return;
    }

    try {
      const res = await fetch(`${APPOINTMENTS_API}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          patientName: editForm.patientName.trim(),
          patientPhone: normalizePhone(editForm.patientPhone),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update appointment');
      toast.success('Appointment updated');
      cancelEdit();
      loadAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to update appointment');
    }
  }

  async function deleteAppointment(id) {
    const ok = window.confirm('Do you want to cancel this appointment?');
    if (!ok) return;

    try {
      const res = await fetch(`${APPOINTMENTS_API}/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to cancel appointment');
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
    }
  }

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [appointments]
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const visibleAppointments = useMemo(() => {
    const filtered = sorted.filter((apt) =>
      (apt.doctor || '').toLowerCase().includes(doctorFilter.trim().toLowerCase())
    );

    return filtered.filter((apt) => {
      const date = parseAppointmentDate(apt.date);
      const isPast = date ? date < today : false;
      return activeTab === 'upcoming' ? !isPast : isPast;
    });
  }, [sorted, doctorFilter, activeTab, today]);

  return (
    <>
      <Header />
      <main className="pr-appointment-page">
        <section className="container pr-appointment-shell">
          <div className="pr-appointment-head">
            <div>
              <h1>My Appointments</h1>
              <p>Manage and track your medical consultations</p>
            </div>
            <Link to="/find-specialist" className="pr-appointment-new-btn">
              + Schedule New
            </Link>
          </div>

          {loading ? (
            <p className="pr-appointment-empty">Loading appointments...</p>
          ) : sorted.length === 0 ? (
            <p className="pr-appointment-empty">No appointments found.</p>
          ) : (
            <div className="pr-appointment-panel">
              <div className="pr-appointment-toolbar">
                <div className="pr-appointment-tabs">
                  <button
                    type="button"
                    className={activeTab === 'upcoming' ? 'active' : ''}
                    onClick={() => setActiveTab('upcoming')}
                  >
                    Upcoming
                  </button>
                  <button
                    type="button"
                    className={activeTab === 'past' ? 'active' : ''}
                    onClick={() => setActiveTab('past')}
                  >
                    Past History
                  </button>
                </div>

                <input
                  className="pr-appointment-filter"
                  type="search"
                  placeholder="Filter by doctor..."
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                />
              </div>

              {visibleAppointments.length === 0 ? (
                <p className="pr-appointment-empty">No appointments in this section.</p>
              ) : (
                <div className="pr-appointment-grid">
                  {visibleAppointments.map((apt) => (
                    <article key={apt._id} className="pr-appointment-card">
                      <div className="pr-appointment-card-top">
                        <div className="pr-appointment-doctor">
                          <img
                            src={resolveAvatarSrc(apt.avatar)}
                            alt={apt.doctor || 'Doctor'}
                            className="pr-appointment-doctor-image"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_DOCTOR_IMAGE;
                            }}
                          />
                          <div>
                            <h3>{apt.doctor || 'Doctor'}</h3>
                            <p className="pr-appointment-sub">{apt.specialty || 'Consultation'}</p>
                          </div>
                        </div>

                        <div className="pr-appointment-actions">
                          <button type="button" onClick={() => startEdit(apt)}>Edit</button>
                          <button type="button" className="danger" onClick={() => deleteAppointment(apt._id)}>
                            Cancel
                          </button>
                        </div>
                      </div>

                      <div className="pr-appointment-meta">
                        <p><strong>Date:</strong> {apt.date || '-'}</p>
                        <p><strong>Time:</strong> {apt.time || '-'}</p>
                        <p><strong>Status:</strong> {apt.status || 'Pending'}</p>
                      </div>

                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      {editingId && editingAppointment ? (
        <div className="pr-appointment-modal-overlay" onClick={cancelEdit}>
          <aside className="pr-appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pr-appointment-modal-head">
              <h2>Edit Appointment</h2>
              <button type="button" onClick={cancelEdit}>x</button>
            </div>
            <p className="pr-appointment-modal-sub">
              {editingAppointment.doctor || 'Doctor'} • {editingAppointment.date || '-'} • {editingAppointment.time || '-'}
            </p>
            <div className="pr-appointment-edit">
              <label htmlFor="editPatientName">Patient Name</label>
              <input
                id="editPatientName"
                value={editForm.patientName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, patientName: e.target.value }))}
                placeholder="Patient name"
              />
              <label htmlFor="editPatientPhone">Patient Phone</label>
              <input
                id="editPatientPhone"
                value={editForm.patientPhone}
                onChange={(e) => {
                  const nextPhone = normalizePhone(e.target.value);
                  setEditForm((prev) => ({ ...prev, patientPhone: nextPhone }));
                  setEditPhoneError(getPhoneValidationMessage(nextPhone));
                }}
                placeholder="0771234567"
                inputMode="numeric"
                maxLength={10}
                aria-invalid={editPhoneError ? 'true' : 'false'}
              />
              {editPhoneError ? <p className="pr-field-error">{editPhoneError}</p> : null}
              <div className="pr-appointment-modal-actions">
                <button type="button" className="primary" onClick={() => saveEdit(editingId)}>Save Changes</button>
                <button type="button" onClick={cancelEdit}>Close</button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
      <Footer />
      <ScrollToTop />
    </>
  );
}
