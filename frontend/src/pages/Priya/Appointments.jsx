import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import { useAuth } from '../../context/Imasha/AuthContext';
import '../../styles/Priya/Appointments.css';

const APPOINTMENTS_API = 'http://localhost:5000/api/appointments';

export default function AppointmentsPage() {
  const { token, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(APPOINTMENTS_API, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to fetch appointments.');

        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];
        const myEmail = (user?.email || '').toLowerCase();
        const mine = list.filter((a) => (a.patientEmail || '').toLowerCase() === myEmail);
        setAppointments(mine);
      } catch (err) {
        toast.error(err.message || 'Failed to fetch appointments.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [token, user?.email]);

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [appointments]
  );

  return (
    <>
      <Header />
      <main className="pr-appointments-page">
        <section className="container pr-appointments-shell">
          <div className="pr-appointments-head">
            <h1>My Appointments</h1>
            <Link to="/find-specialist" className="pr-appointments-back">Back to Specialists</Link>
          </div>

          {loading ? (
            <p className="pr-appointments-empty">Loading appointments...</p>
          ) : sorted.length === 0 ? (
            <p className="pr-appointments-empty">No appointments found yet.</p>
          ) : (
            <div className="pr-appointments-list">
              {sorted.map((a) => (
                <article key={a._id} className="pr-appointments-card">
                  <h3>{a.doctor || 'Doctor'}</h3>
                  <p><strong>Date:</strong> {a.date || '-'}</p>
                  <p><strong>Time:</strong> {a.time || '-'}</p>
                  <p><strong>Status:</strong> {a.status || 'Pending'}</p>
                  <p><strong>Location:</strong> {a.location || '-'}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
