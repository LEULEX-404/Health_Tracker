import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/Imasha/AuthContext';
import { getAllUsers } from '../../utils/Imasha/adminApi';
import { Calendar, Stethoscope, HeartHandshake, Loader2, Clock, MapPin, User, ChevronRight, CheckCircle2, AlertCircle, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminAppointmentsTab() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('caregiver'); // 'doctor' | 'caregiver'
  const [bookings, setBookings] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('patient'); // 'patient' | 'caregiver'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Approved' | 'Cancelled'

  useEffect(() => {
    if (activeTab === 'caregiver') {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch Bookings
          const res = await fetch('http://localhost:5000/api/tharindu/bookings/admin/all', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to fetch bookings');
          setBookings(data);

          // Fetch Available Caregivers (using the existing Admin API)
          const cgData = await getAllUsers(token, { role: 'caregiver' });
          if (cgData && cgData.data) {
            setCaregivers(cgData.data);
          }
        } catch (e) {
          toast.error(e.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [activeTab, token]);

  const renderStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <span className="status-pill active"><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Approved</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="status-pill warn"><AlertCircle size={12} style={{ marginRight: '4px' }} /> Cancelled</span>;
      case 'completed':
        return <span className="status-pill success"><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Completed</span>;
      default:
        return <span className="status-pill" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><Clock size={12} style={{ marginRight: '4px' }} /> Pending</span>;
    }
  };

  const filteredBookings = bookings.filter(book => {
    // Status filter
    if (statusFilter === 'Approved' && book.status?.toLowerCase() !== 'approved') return false;
    if (statusFilter === 'Cancelled' && !['cancelled', 'rejected'].includes(book.status?.toLowerCase())) return false;

    // Search Filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      if (searchType === 'patient') {
        const name = `${book.patientId?.firstName || ''} ${book.patientId?.lastName || ''}`.toLowerCase();
        if (!name.includes(term)) return false;
      } else {
        const name = `${book.caregiverId?.firstName || ''} ${book.caregiverId?.lastName || ''}`.toLowerCase();
        if (!name.includes(term)) return false;
      }
    }
    return true;
  });

  return (
    <div className="admin-module-card tharindu-alerts-module" style={{ padding: '0', overflow: 'hidden' }}>

      {/* ── SEGMENTED HEADER ── */}
      <div
        style={{
          display: 'flex',
          background: 'var(--admin-card-bg)',
          borderBottom: '1px solid var(--admin-border)',
          padding: '1rem 1.5rem',
          gap: '1rem'
        }}
      >
        <button
          onClick={() => setActiveTab('doctor')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
            borderRadius: '12px',
            border: activeTab === 'doctor' ? '1px solid var(--p-cyan)' : '1px solid transparent',
            background: activeTab === 'doctor' ? 'rgba(0,180,216,0.1)' : 'transparent',
            color: activeTab === 'doctor' ? 'var(--p-cyan)' : 'var(--admin-text-muted)',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <Stethoscope size={20} /> Doctor Appointments
        </button>

        <button
          onClick={() => setActiveTab('caregiver')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
            borderRadius: '12px',
            border: activeTab === 'caregiver' ? '1px solid var(--p-green)' : '1px solid transparent',
            background: activeTab === 'caregiver' ? 'rgba(0,200,151,0.1)' : 'transparent',
            color: activeTab === 'caregiver' ? 'var(--p-green)' : 'var(--admin-text-muted)',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <HeartHandshake size={20} /> Caregiver Appointments
        </button>
      </div>

      <div style={{ padding: '1.5rem', minHeight: '500px' }}>
        <AnimatePresence mode="wait">

          {/* ── DOCTOR TAB (PLACEHOLDER) ── */}
          {activeTab === 'doctor' && (
            <motion.div
              key="docTab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '400px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px dashed rgba(255,255,255,0.1)'
              }}
            >
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(0,180,216,0.1)', color: 'var(--p-cyan)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Stethoscope size={32} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--admin-text)', fontSize: '1.2rem' }}>
                Doctor Appointments Module
              </h3>
              <p style={{ color: 'var(--admin-text-muted)', maxWidth: '400px', margin: 0, lineHeight: 1.5 }}>
                This section will be independently managed. Check back during the next deployment phase for the integrated doctor schedule interface.
              </p>
            </motion.div>
          )}


          {/* ── CAREGIVER TAB ── */}
          {activeTab === 'caregiver' && (
            <motion.div
              key="cgTab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <div className="loading-state" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 className="spin" size={32} color="var(--p-green)" />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

                  {/* Left Column: Schedule List */}
                  <div>
                    <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={18} color="var(--p-green)" />
                      Schedule
                    </h3>

                    {/* Filters Section */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flex: 1, minWidth: '250px', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '10px', overflow: 'hidden' }}>
                        <select
                          value={searchType}
                          onChange={(e) => setSearchType(e.target.value)}
                          style={{ background: 'transparent', border: 'none', borderRight: '1px solid var(--admin-border)', padding: '0.6rem 1rem', color: 'var(--admin-text)', outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                        >
                          <option value="patient" style={{ color: '#000' }}>Patient</option>
                          <option value="caregiver" style={{ color: '#000' }}>Caregiver</option>
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', color: 'var(--admin-text-muted)' }}>
                          <ChevronRight size={14} />
                        </div>
                        <input
                          type="text"
                          placeholder={`Search ${searchType} name...`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ flex: 1, background: 'transparent', border: 'none', padding: '0.6rem 1rem 0.6rem 0.5rem', color: 'var(--admin-text)', outline: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setStatusFilter('all')}
                          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: statusFilter === 'all' ? 'var(--admin-text)' : 'transparent', color: statusFilter === 'all' ? 'var(--admin-bg)' : 'var(--admin-text)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setStatusFilter('Approved')}
                          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', background: statusFilter === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : 'transparent', color: '#10b981', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
                        >
                          Approved
                        </button>
                        <button
                          onClick={() => setStatusFilter('Cancelled')}
                          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', background: statusFilter === 'Cancelled' ? 'rgba(239, 68, 68, 0.15)' : 'transparent', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
                        >
                          Cancelled
                        </button>
                      </div>
                    </div>

                    {filteredBookings.length === 0 ? (
                      <div className="empty-state" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <div style={{ opacity: 0.5, marginBottom: '1rem' }}><HeartHandshake size={48} /></div>
                        <p style={{ margin: 0, color: 'var(--admin-text)' }}>No Caregiver Bookings Found.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredBookings.map(book => (
                          <div
                            key={book._id}
                            style={{
                              background: 'var(--admin-card-bg)',
                              border: '1px solid var(--admin-border)',
                              borderRadius: '14px',
                              padding: '1.25rem',
                              display: 'grid',
                              gridTemplateColumns: 'auto 1fr auto',
                              gap: '1.5rem',
                              alignItems: 'center',
                              transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                          >

                            {/* Schedule Date Cube */}
                            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', minWidth: '80px' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--p-green)', fontWeight: 700, textTransform: 'uppercase' }}>
                                {new Date(book.date).toLocaleString('default', { month: 'short' })}
                              </div>
                              <div style={{ fontSize: '1.5rem', color: 'var(--admin-text)', fontWeight: 800, lineHeight: 1 }}>
                                {new Date(book.date).getDate()}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
                                {book.startTime}
                              </div>
                            </div>

                            {/* Booking Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={14} color="var(--admin-text-muted)" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', minWidth: '60px' }}>Patient:</span>
                                <span style={{ fontSize: '0.95rem', color: 'var(--admin-text)', fontWeight: 600 }}>
                                  {book.patientId?.firstName} {book.patientId?.lastName}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <HeartHandshake size={14} color="var(--p-cyan)" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', minWidth: '60px' }}>Caregiver:</span>
                                <span style={{ fontSize: '0.95rem', color: 'var(--admin-text)', fontWeight: 600 }}>
                                  {book.caregiverId?.firstName} {book.caregiverId?.lastName}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>#{book._id.slice(-6).toUpperCase()}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>• {book.endTime}</span>
                              </div>
                            </div>

                            {/* Status */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                              {renderStatus(book.status)}
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Available Caregivers */}
                  <div style={{
                    background: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    position: 'sticky',
                    top: '20px'
                  }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <HeartHandshake size={16} /> Available Caregivers
                    </h3>

                    {caregivers.length === 0 ? (
                      <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', textAlign: 'center', margin: '2rem 0' }}>No active caregivers found.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {caregivers.slice(0, 8).map(cg => (
                          <div key={cg._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(128,128,128,0.1)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                            <img
                              src={cg.profilePicture || `https://ui-avatars.com/api/?name=${cg.firstName}+${cg.lastName}&background=random`}
                              alt="Avatar"
                              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {cg.firstName} {cg.lastName}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                                <Phone size={10} /> {cg.phone || 'N/A'}
                              </div>
                            </div>
                          </div>
                        ))}
                        {caregivers.length > 8 && (
                          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.5rem' }}>
                            + {caregivers.length - 8} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
