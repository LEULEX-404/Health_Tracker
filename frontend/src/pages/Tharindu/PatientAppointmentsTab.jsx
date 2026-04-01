import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/Imasha/AuthContext';
import { Calendar, Stethoscope, HeartHandshake, Loader2, Clock, MapPin, User, ChevronRight, CheckCircle2, AlertCircle, Phone, Sparkles, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PatientAppointmentsTab({ onBookingSuccess }) {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('caregiver'); // 'doctor' | 'caregiver'
  const [myBookings, setMyBookings] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Flow State
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Time slots for demo
  const TIME_SLOTS = [
    '08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch My Bookings
      const bookRes = await fetch(`${import.meta.env.VITE_API_URL}/tharindu/bookings/my-bookings`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const bookData = await bookRes.json();
      if (!bookRes.ok) throw new Error(bookData.message || 'Failed to fetch your bookings');
      setMyBookings(bookData.data || []);

      // Fetch Available Caregivers via new dedicated route
      const cgRes = await fetch(`${import.meta.env.VITE_API_URL}/tharindu/bookings/caregivers`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const cgData = await cgRes.json();
      if (!cgRes.ok) throw new Error(cgData.message || 'Failed to fetch available caregivers');
      if (cgData && cgData.data) {
        // Client-side safety: also filter out the logged-in user
        const filtered = cgData.data.filter(cg => cg._id !== (user?.id || user?._id));
        setCaregivers(filtered);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'caregiver') {
      fetchData();
    }
  }, [activeTab, token]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedCaregiver || !bookingDate || !bookingTime) {
      toast.error('Please select a caregiver, date, and time slot.');
      return;
    }

    setSubmitting(true);
    try {
      // Calculate end time (assuming 2 hour blocks for caregivers)
      const baseHourStr = bookingTime.split(':')[0];
      const period = bookingTime.split(' ')[1];
      let endHour = parseInt(baseHourStr, 10) + 2;
      let endPeriod = period;
      if (endHour >= 12) {
        if (endHour > 12) endHour -= 12;
        if (baseHourStr !== '12') {
          endPeriod = period === 'AM' ? 'PM' : 'AM';
        }
      }
      const endTime = `${endHour.toString().padStart(2, '0')}:00 ${endPeriod}`;

      const payload = {
        caregiverId: selectedCaregiver._id,
        date: bookingDate,
        startTime: bookingTime,
        endTime,
        notes: bookingNotes
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/tharindu/bookings/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to book appointment');
      
      toast.success('Caregiver appointment requested successfully!');
      if (onBookingSuccess) onBookingSuccess();
      
      // Reset flow and refresh
      setSelectedCaregiver(null);
      setBookingDate('');
      setBookingTime('');
      setBookingNotes('');
      fetchData();

    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tharindu/bookings/my-bookings/report`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to generate report');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Caregiver_Bookings_Report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDownloadingReport(false);
    }
  };

  const renderStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <span className="status-pill active"><CheckCircle2 size={12} style={{marginRight: '4px'}}/> Approved</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="status-pill warn"><AlertCircle size={12} style={{marginRight: '4px'}}/> Cancelled</span>;
      case 'completed':
        return <span className="status-pill success"><CheckCircle2 size={12} style={{marginRight: '4px'}}/> Completed</span>;
      default:
        return <span className="status-pill" style={{background: 'rgba(245,158,11,0.1)', color: '#f59e0b'}}><Clock size={12} style={{marginRight: '4px'}}/> Pending</span>;
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── SEGMENTED HEADER ── */}
      <div style={{ display: 'flex', background: 'var(--admin-card-bg)', borderRadius: '16px', border: '1px solid var(--admin-border)', padding: '0.5rem', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('doctor')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '1rem', borderRadius: '12px',
            border: activeTab === 'doctor' ? '1px solid var(--p-cyan)' : '1px solid transparent',
            background: activeTab === 'doctor' ? 'rgba(0,180,216,0.1)' : 'transparent',
            color: activeTab === 'doctor' ? 'var(--p-cyan)' : 'var(--admin-text-muted)',
            fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease'
          }}
        >
          <Stethoscope size={20} /> Doctor Appointments
        </button>

        <button
          onClick={() => setActiveTab('caregiver')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '1rem', borderRadius: '12px',
            border: activeTab === 'caregiver' ? '1px solid var(--p-green)' : '1px solid transparent',
            background: activeTab === 'caregiver' ? 'rgba(0,200,151,0.1)' : 'transparent',
            color: activeTab === 'caregiver' ? 'var(--p-green)' : 'var(--admin-text-muted)',
            fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease'
          }}
        >
          <HeartHandshake size={20} /> Caregiver Appointments
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ── DOCTOR TAB (PLACEHOLDER) ── */}
        {activeTab === 'doctor' && (
          <motion.div
            key="docTab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center', background: 'var(--admin-card-bg)', borderRadius: '16px', border: '1px dashed var(--admin-border)' }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,180,216,0.1)', color: 'var(--p-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Stethoscope size={32} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--admin-text)', fontSize: '1.3rem' }}>Doctor Appointments Module</h3>
            <p style={{ color: 'var(--admin-text-muted)', maxWidth: '400px', margin: 0, lineHeight: 1.5 }}>
              This section is coming soon. You'll be able to book full consultations with verified medical professionals here.
            </p>
          </motion.div>
        )}

        {/* ── CAREGIVER TAB ── */}
        {activeTab === 'caregiver' && (
          <motion.div
            key="cgTab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── CAREGIVER ROLE GUARD ── */}
            {user?.role === 'caregiver' && (
              <div style={{
                padding: '2.5rem',
                borderRadius: '16px',
                border: '1px dashed rgba(245,158,11,0.4)',
                background: 'rgba(245,158,11,0.06)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HeartHandshake size={26} color="#f59e0b" />
                </div>
                <h3 style={{ margin: 0, color: 'var(--admin-text)', fontSize: '1.1rem' }}>Booking Unavailable for Caregivers</h3>
                <p style={{ margin: 0, color: 'var(--admin-text-muted)', maxWidth: '420px', lineHeight: 1.55, fontSize: '0.92rem' }}>
                  As a caregiver, you cannot book appointments with yourself or other caregivers.
                  Switch to a patient account if you need caregiver services.
                </p>
              </div>
            )}
            {loading ? (
              <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="spin" size={32} color="var(--p-green)" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* UPCOMING BOOKINGS SECTION */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={20} color="var(--p-cyan)" /> My Upcoming Caregiver Bookings
                    </h3>
                    <button 
                      onClick={handleDownloadReport}
                      disabled={downloadingReport}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(0,200,151,0.1)', color: 'var(--p-green)', border: '1px solid var(--p-green)', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', opacity: downloadingReport ? 0.7 : 1 }}
                    >
                      {downloadingReport ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
                      {downloadingReport ? 'Generating...' : 'Download Report'}
                    </button>
                  </div>
                  
                  {myBookings.length === 0 ? (
                    <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                      <p style={{ margin: 0, color: 'var(--admin-text-muted)' }}>You have no active caregiver bookings.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {myBookings.map(book => (
                        <div key={book._id} style={{ minWidth: '300px', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ color: 'var(--p-green)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>{new Date(book.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                              <div style={{ color: 'var(--admin-text)', fontWeight: 600, fontSize: '1.1rem' }}>{book.startTime}</div>
                            </div>
                            {renderStatus(book.status)}
                          </div>
                          <div style={{ height: '1px', background: 'var(--admin-border)' }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p-cyan)' }}>
                              <User size={18} />
                            </div>
                            <div>
                              <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>Your Caregiver</div>
                              <div style={{ color: 'var(--admin-text)', fontWeight: 600, fontSize: '0.95rem' }}>
                                {book.caregiverId
                                  ? (book.caregiverId.firstName || book.caregiverId.lastName)
                                    ? `${book.caregiverId.firstName ?? ''} ${book.caregiverId.lastName ?? ''}`.trim()
                                    : book.caregiverId.name || 'Unknown Caregiver'
                                  : 'Unknown Caregiver'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOOK A NEW APPOINTMENT SECTION — hidden for caregivers */}
                {user?.role !== 'caregiver' && <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={20} color="var(--p-green)" /> Book a Caregiver
                    </h3>
                  </div>

                  {!selectedCaregiver ? (
                    // Caregiver Grid View
                    <>
                      <p style={{ margin: 0, color: 'var(--admin-text-muted)', fontSize: '0.95rem' }}>Select an available dedicated professional below to schedule an appointment.</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                        {caregivers.length === 0 ? (
                          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>No caregivers available at the moment.</div>
                        ) : (
                          caregivers.map(cg => (
                            <motion.div 
                              key={cg._id} 
                              whileHover={{ scale: 1.02, y: -4 }}
                              onClick={() => setSelectedCaregiver(cg)}
                              style={{ background: 'var(--glass-bg)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'center' }}
                            >
                              <img 
                                src={cg.profilePicture || `https://ui-avatars.com/api/?name=${cg.firstName}+${cg.lastName}&background=random`} 
                                alt="Avatar" 
                                style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(0,200,151,0.2)' }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <div style={{ color: 'var(--admin-text)', fontWeight: 700, fontSize: '1.1rem' }}>{cg.firstName} {cg.lastName}</div>
                                <div style={{ color: 'var(--p-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>Professional Caregiver</div>
                                <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginTop: '0.4rem' }}><Phone size={12}/> {cg.phone || 'N/A'}</div>
                              </div>
                              <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'rgba(0,200,151,0.1)', color: 'var(--p-green)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', width: '100%' }}>
                                Select
                              </button>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    // Booking Form View
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ border: '1px solid var(--admin-border)', background: 'var(--glass-bg)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}
                    >
                      <button 
                        onClick={() => setSelectedCaregiver(null)}
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                        title="Change Caregiver"
                      >
                        <X size={16} />
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '1.5rem' }}>
                        <img 
                          src={selectedCaregiver.profilePicture || `https://ui-avatars.com/api/?name=${selectedCaregiver.firstName}+${selectedCaregiver.lastName}&background=random`} 
                          alt="Avatar" 
                          style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)' }}>Booking an appointment with</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--admin-text)' }}>{selectedCaregiver.firstName} {selectedCaregiver.lastName}</div>
                        </div>
                      </div>

                      <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ color: 'var(--admin-text)', fontWeight: 600, fontSize: '0.95rem' }}>Select Date</label>
                          <input 
                            type="date" 
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            style={{ padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: 'var(--admin-text)', outline: 'none', colorScheme: 'dark', fontSize: '1rem' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ color: 'var(--admin-text)', fontWeight: 600, fontSize: '0.95rem' }}>Available Time Slots</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.8rem' }}>
                            {TIME_SLOTS.map(time => (
                              <button
                                type="button"
                                key={time}
                                onClick={() => setBookingTime(time)}
                                style={{
                                  padding: '0.8rem',
                                  borderRadius: '10px',
                                  border: bookingTime === time ? '1px solid var(--p-green)' : '1px solid var(--admin-border)',
                                  background: bookingTime === time ? 'rgba(0,200,151,0.15)' : 'rgba(0,0,0,0.1)',
                                  color: bookingTime === time ? 'var(--p-green)' : 'var(--admin-text)',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  outline: 'none'
                                }}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                          {!bookingTime && <small style={{ color: 'var(--admin-text-muted)', marginTop: '0.3rem' }}>Please select a 2-hour time block from above.</small>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ color: 'var(--admin-text)', fontWeight: 600, fontSize: '0.95rem' }}>Additional Notes (Optional)</label>
                          <textarea 
                            rows={3}
                            placeholder="Any special requirements or instructions for the caregiver..."
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                            style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: 'var(--admin-text)', outline: 'none', resize: 'vertical' }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                          <button 
                            type="submit" 
                            disabled={submitting}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', background: 'linear-gradient(135deg, var(--p-green), var(--p-cyan))', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: submitting ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0, 200, 151, 0.3)' }}
                          >
                            {submitting ? <Loader2 size={18} className="spin" /> : <Calendar size={18} />}
                            {submitting ? 'Confirming...' : 'Request Appointment'}
                          </button>
                        </div>

                      </form>
                    </motion.div>
                  )}
                </div>}

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
