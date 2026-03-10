import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Dumbbell, Timer, Flame, Heart, CalendarDays, Bike, Activity, BadgeCheck, LogIn, UserPlus } from 'lucide-react';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import { useAuth } from '../../context/Imasha/AuthContext';
import {
  getExerciseLogs,
  getExerciseStats,
  createExerciseLog,
  getExerciseDateBounds,
  isDateInAllowedRange
} from '../../utils/Priya/exerciseApi';
import '../../styles/Priya/Exercise.css';

const ACTIVITY_ICONS = {
  Running: Activity,
  Cycling: Bike,
  Yoga: Dumbbell,
  Walking: Activity,
  'Strength Training': Dumbbell
};
const TONES = ['blue', 'purple', 'orange'];

function formatHistoryTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - d) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays >= 2 && diffDays <= 6) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

function logToHistoryItem(log, index) {
  const Icon = ACTIVITY_ICONS[log.type] || Dumbbell;
  const tone = TONES[index % TONES.length];
  return {
    id: log.id,
    title: log.type,
    duration: `${log.duration} min`,
    calories: `${log.calories} kcal`,
    time: formatHistoryTime(log.date),
    icon: Icon,
    tone
  };
}

export default function ExercisePage() {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ activeMinutes: 0, caloriesBurned: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dateBounds, setDateBounds] = useState(() => getExerciseDateBounds());

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [logsData, statsData] = await Promise.all([
        getExerciseLogs(token),
        getExerciseStats(token)
      ]);
      setLogs(Array.isArray(logsData) ? logsData : []);
      setStats(statsData || { activeMinutes: 0, caloriesBurned: 0 });
    } catch (err) {
      toast.error(err.message || 'Failed to load exercise data');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) fetchData();
  }, [user, token, fetchData]);

  useEffect(() => {
    setDateBounds(getExerciseDateBounds());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      toast.error('Please log in to save exercise.');
      return;
    }
    const type = document.getElementById('activityType')?.value?.trim();
    const duration = parseInt(document.getElementById('duration')?.value, 10);
    const calories = parseInt(document.getElementById('calories')?.value, 10);
    const date = document.getElementById('activityDate')?.value?.trim();

    if (!type) {
      toast.error('Please select an activity type.');
      return;
    }
    if (!Number.isFinite(duration) || duration < 1) {
      toast.error('Please enter a valid duration (at least 1 min).');
      return;
    }
    if (!Number.isFinite(calories) || calories < 0) {
      toast.error('Please enter valid calories burned.');
      return;
    }
    if (!date) {
      toast.error('Please select the date of activity.');
      return;
    }
    if (!isDateInAllowedRange(date)) {
      toast.error('Date must be within the current week or next week. Past dates are not allowed.');
      return;
    }

    setSaving(true);
    try {
      await createExerciseLog(token, { type, duration, calories, date });
      toast.success('Activity saved.');
      fetchData();
      e.target.reset();
    } catch (err) {
      toast.error(err.message || 'Failed to save activity');
    } finally {
      setSaving(false);
    }
  };

  const recentHistory = logs.slice(0, 5).map((log, i) => logToHistoryItem(log, i));
  const isLoggedIn = !!user;

  return (
    <>
      <Header />
      <main className="pr-exercise-page">
        <section className="pr-exercise-shell container">
          <header className="pr-exercise-head">
            <h1>Log Exercise</h1>
            <p>Keep track of your fitness journey and reach your goals.</p>
          </header>

          <div className="pr-exercise-grid">
            <article className="pr-card pr-form-card">
              <h2>
                <Dumbbell size={20} />
                Activity Details
              </h2>

              {!isLoggedIn ? (
                <div className="pr-exercise-gate">
                  <p>Log in or sign up to log your exercises and see your recent history.</p>
                  <div className="pr-exercise-gate-actions">
                    <Link to="/login" className="pr-primary-btn pr-btn-login">
                      <LogIn size={18} />
                      Log in
                    </Link>
                    <Link to="/register" className="pr-primary-btn pr-btn-signup">
                      <UserPlus size={18} />
                      Sign up
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <label htmlFor="activityType">Exercise Type</label>
                  <select id="activityType" required defaultValue="">
                    <option value="" disabled>
                      Select activity (e.g. Running, Cycling)
                    </option>
                    <option>Running</option>
                    <option>Cycling</option>
                    <option>Yoga</option>
                    <option>Walking</option>
                    <option>Strength Training</option>
                  </select>

                  <div className="pr-form-row">
                    <div>
                      <label htmlFor="duration">Duration (min)</label>
                      <div className="pr-input-wrap">
                        <input id="duration" type="number" defaultValue="45" min={1} required />
                        <span>MIN</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="calories">Calories Burned (kcal)</label>
                      <div className="pr-input-wrap">
                        <input id="calories" type="number" defaultValue="320" min={0} required />
                        <span>KCAL</span>
                      </div>
                    </div>
                  </div>

                  <label htmlFor="heartRate">Average Heart Rate (BPM)</label>
                  <div className="pr-input-wrap">
                    <Heart size={16} />
                    <input id="heartRate" type="number" defaultValue="135" min={0} />
                    <span>BPM</span>
                  </div>

                  <label htmlFor="activityDate">Date of Activity (current or next week only)</label>
                  <div className="pr-input-wrap">
                    <input
                      id="activityDate"
                      type="date"
                      min={dateBounds.min}
                      max={dateBounds.max}
                      required
                    />
                    <CalendarDays size={16} />
                  </div>

                  <button type="submit" className="pr-primary-btn" disabled={saving}>
                    <BadgeCheck size={18} />
                    {saving ? 'Saving…' : 'Save Activity'}
                  </button>
                </form>
              )}
            </article>

            <aside className="pr-side-column">
              {isLoggedIn && (
                <div className="pr-stats-row">
                  <article className="pr-card pr-stat pr-stat-blue">
                    <p>Total Active</p>
                    <h3>
                      {loading ? '…' : (stats.activeMinutes ?? 0)} <span>min</span>
                    </h3>
                  </article>
                  <article className="pr-card pr-stat pr-stat-green">
                    <p>Calories</p>
                    <h3>
                      {loading ? '…' : (stats.caloriesBurned ?? 0)} <span>kcal</span>
                    </h3>
                  </article>
                </div>
              )}

              <article className="pr-card pr-history-card">
                <div className="pr-history-head">
                  <h2>Recent History</h2>
                  {isLoggedIn && (
                    <a href="#0" onClick={(e) => { e.preventDefault(); fetchData(); }}>
                      Refresh
                    </a>
                  )}
                </div>

                {!isLoggedIn ? (
                  <div className="pr-exercise-gate pr-history-gate">
                    <p>Log in or sign up to see your exercise history.</p>
                    <div className="pr-exercise-gate-actions">
                      <Link to="/login" className="pr-primary-btn pr-btn-login">
                        <LogIn size={18} />
                        Log in
                      </Link>
                      <Link to="/register" className="pr-primary-btn pr-btn-signup">
                        <UserPlus size={18} />
                        Sign up
                      </Link>
                    </div>
                  </div>
                ) : loading ? (
                  <p className="pr-history-note">Loading…</p>
                ) : recentHistory.length === 0 ? (
                  <p className="pr-history-note">No exercises logged yet. Add one above!</p>
                ) : (
                  <>
                    <ul>
                      {recentHistory.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.id}>
                            <div className={`pr-history-icon ${item.tone}`}>
                              <Icon size={18} />
                            </div>
                            <div className="pr-history-content">
                              <h4>{item.title}</h4>
                              <div className="pr-history-meta">
                                <span>
                                  <Timer size={14} />
                                  {item.duration}
                                </span>
                                <span>
                                  <Flame size={14} />
                                  {item.calories}
                                </span>
                              </div>
                            </div>
                            <p className="pr-history-time">{item.time}</p>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="pr-history-note">You can only log dates in the current week or next week.</p>
                  </>
                )}
              </article>

              {isLoggedIn && (
                <article className="pr-card pr-motivation-card">
                  <h3>Keep it up{user?.firstName ? `, ${user.firstName}` : ''}!</h3>
                  <p>Consistency is the key to longevity. Log your workouts to track progress.</p>
                </article>
              )}
            </aside>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
