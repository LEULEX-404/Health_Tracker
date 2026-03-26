import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Dumbbell, Timer, Flame, CalendarDays, Bike, Activity, BadgeCheck, Pencil, Trash2, X } from 'lucide-react';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import { useAuth } from '../../context/Imasha/AuthContext';
import {
  getExerciseLogs,
  getExerciseStats,
  createExerciseLog,
  updateExerciseLog,
  deleteExerciseLog,
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

const INITIAL_CREATE_FORM = {
  type: '',
  duration: '',
  calories: '',
  date: ''
};

const INITIAL_EDIT_FORM = {
  id: '',
  type: '',
  duration: '',
  calories: '',
  date: ''
};

function formatHistoryTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T12:00:00`);
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
    raw: log,
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
  const [editSaving, setEditSaving] = useState(false);
  const [createForm, setCreateForm] = useState(INITIAL_CREATE_FORM);
  const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM);
  const [dateBounds, setDateBounds] = useState(() => getExerciseDateBounds());
  const guestDateBounds = getExerciseDateBounds();

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

  const closeEditForm = useCallback(() => {
    setEditForm(INITIAL_EDIT_FORM);
  }, []);

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    toast.error('Please log in or sign up to save your exercise.');
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateExerciseForm = (formValues) => {
    const type = formValues.type.trim();
    const duration = parseInt(formValues.duration, 10);
    const calories = parseInt(formValues.calories, 10);
    const date = formValues.date.trim();

    if (!type) {
      throw new Error('Please select an activity type.');
    }
    if (!Number.isFinite(duration) || duration < 1) {
      throw new Error('Please enter a valid duration (at least 1 min).');
    }
    if (!Number.isFinite(calories) || calories < 0) {
      throw new Error('Please enter valid calories burned.');
    }
    if (!date) {
      throw new Error('Please select the date of activity.');
    }
    if (!isDateInAllowedRange(date)) {
      throw new Error('Date must be from today up to the next 2 weeks. Previous days are not allowed.');
    }

    return { type, duration, calories, date };
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!user || !token) {
      toast.error('Please log in to save exercise.');
      return;
    }

    try {
      const payload = validateExerciseForm(createForm);
      setSaving(true);
      await createExerciseLog(token, payload);
      toast.success('Activity saved.');
      await fetchData();
      setCreateForm(INITIAL_CREATE_FORM);
    } catch (err) {
      toast.error(err.message || 'Failed to save activity');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!token || !editForm.id) {
      toast.error('Unable to update this activity.');
      return;
    }

    try {
      const payload = validateExerciseForm(editForm);
      setEditSaving(true);
      await updateExerciseLog(token, editForm.id, payload);
      toast.success('Activity updated.');
      await fetchData();
      closeEditForm();
    } catch (err) {
      toast.error(err.message || 'Failed to update activity');
    } finally {
      setEditSaving(false);
    }
  };

  const handleEdit = (log) => {
    setEditForm({
      id: log.id,
      type: log.type || '',
      duration: String(log.duration ?? ''),
      calories: String(log.calories ?? ''),
      date: log.date || ''
    });
  };

  const handleDelete = async (log) => {
    if (!token) {
      toast.error('Please log in to delete exercise.');
      return;
    }

    const confirmed = window.confirm(`Delete ${log.type || 'this activity'} from ${log.date || 'the selected date'}?`);
    if (!confirmed) return;

    try {
      await deleteExerciseLog(token, log.id);
      toast.success('Activity deleted.');

      if (editForm.id === log.id) {
        closeEditForm();
      }

      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete activity');
    }
  };

  const recentHistory = logs.slice(0, 5).map((log, i) => logToHistoryItem(log, i));
  const isLoggedIn = !!user;
  const isEditOpen = Boolean(editForm.id);

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
                <form className="pr-guest-form" onSubmit={handleGuestSubmit}>
                  <label htmlFor="activityType">Exercise Type</label>
                  <select id="activityType" defaultValue="">
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
                        <input id="duration" type="number" min={1} placeholder="45" />
                        <span>MIN</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="calories">Calories Burned (kcal)</label>
                      <div className="pr-input-wrap">
                        <input id="calories" type="number" min={0} placeholder="320" />
                        <span>KCAL</span>
                      </div>
                    </div>
                  </div>

                  <label htmlFor="activityDate">Date of Activity (today to next 2 weeks)</label>
                  <div className="pr-input-wrap">
                    <input
                      id="activityDate"
                      type="date"
                      min={guestDateBounds.min}
                      max={guestDateBounds.max}
                    />
                    <CalendarDays size={16} />
                  </div>

                  <button type="submit" className="pr-primary-btn">
                    <BadgeCheck size={18} />
                    Save Activity
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCreateSubmit}>
                  <label htmlFor="activityType">Exercise Type</label>
                  <select id="activityType" name="type" required value={createForm.type} onChange={handleCreateFormChange}>
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
                        <input id="duration" name="duration" type="number" value={createForm.duration} onChange={handleCreateFormChange} min={1} placeholder="45" required />
                        <span>MIN</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="calories">Calories Burned (kcal)</label>
                      <div className="pr-input-wrap">
                        <input id="calories" name="calories" type="number" value={createForm.calories} onChange={handleCreateFormChange} min={0} placeholder="320" required />
                        <span>KCAL</span>
                      </div>
                    </div>
                  </div>

                  <label htmlFor="activityDate">Date of Activity (today to next 2 weeks)</label>
                  <div className="pr-input-wrap">
                    <input
                      id="activityDate"
                      name="date"
                      type="date"
                      value={createForm.date}
                      onChange={handleCreateFormChange}
                      min={dateBounds.min}
                      max={dateBounds.max}
                      required
                    />
                    <CalendarDays size={16} />
                  </div>

                  <button type="submit" className="pr-primary-btn" disabled={saving}>
                    <BadgeCheck size={18} />
                    {saving ? 'Saving...' : 'Save Activity'}
                  </button>
                </form>
              )}
            </article>

            <aside className="pr-side-column">
              <div className="pr-stats-row">
                <article className="pr-card pr-stat pr-stat-blue">
                  <p>Total Active</p>
                  <h3>
                    {loading && isLoggedIn ? '...' : (isLoggedIn ? (stats.activeMinutes ?? 0) : '-')} <span>min</span>
                  </h3>
                </article>
                <article className="pr-card pr-stat pr-stat-green">
                  <p>Calories</p>
                  <h3>
                    {loading && isLoggedIn ? '...' : (isLoggedIn ? (stats.caloriesBurned ?? 0) : '-')} <span>kcal</span>
                  </h3>
                </article>
              </div>

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
                  <p className="pr-history-note">Log in or sign up to view your recent exercise history.</p>
                ) : loading ? (
                  <p className="pr-history-note">Loading...</p>
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
                            <div className="pr-history-side">
                              <p className="pr-history-time">{item.time}</p>
                              <div className="pr-history-actions">
                                <button
                                  type="button"
                                  className="pr-icon-btn"
                                  onClick={() => handleEdit(item.raw)}
                                  aria-label={`Edit ${item.title}`}
                                  title="Edit"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="pr-icon-btn danger"
                                  onClick={() => handleDelete(item.raw)}
                                  aria-label={`Delete ${item.title}`}
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="pr-history-note">You can only log dates from today up to the next 2 weeks.</p>
                  </>
                )}
              </article>

              <article className="pr-card pr-motivation-card">
                <h3>Keep it up{isLoggedIn && user?.firstName ? `, ${user.firstName}` : ''}!</h3>
                <p>Consistency is the key to longevity. Log your workouts to track progress.</p>
              </article>
            </aside>
          </div>
        </section>
      </main>

      {isEditOpen ? (
        <div className="pr-exercise-modal-overlay" onClick={closeEditForm}>
          <section className="pr-exercise-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pr-exercise-modal-head">
              <h2>Edit Activity</h2>
              <button type="button" className="pr-icon-btn" onClick={closeEditForm} aria-label="Close edit form">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <label htmlFor="editActivityType">Exercise Type</label>
              <select id="editActivityType" name="type" required value={editForm.type} onChange={handleEditFormChange}>
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
                  <label htmlFor="editDuration">Duration (min)</label>
                  <div className="pr-input-wrap">
                    <input id="editDuration" name="duration" type="number" value={editForm.duration} onChange={handleEditFormChange} min={1} placeholder="45" required />
                    <span>MIN</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="editCalories">Calories Burned (kcal)</label>
                  <div className="pr-input-wrap">
                    <input id="editCalories" name="calories" type="number" value={editForm.calories} onChange={handleEditFormChange} min={0} placeholder="320" required />
                    <span>KCAL</span>
                  </div>
                </div>
              </div>

              <label htmlFor="editActivityDate">Date of Activity (today to next 2 weeks)</label>
              <div className="pr-input-wrap">
                <input
                  id="editActivityDate"
                  name="date"
                  type="date"
                  value={editForm.date}
                  onChange={handleEditFormChange}
                  min={dateBounds.min}
                  max={dateBounds.max}
                  required
                />
                <CalendarDays size={16} />
              </div>

              <div className="pr-form-actions">
                <button type="button" className="pr-secondary-btn" onClick={closeEditForm} disabled={editSaving}>
                  <X size={18} />
                  Cancel
                </button>
                <button type="submit" className="pr-primary-btn" disabled={editSaving}>
                  <BadgeCheck size={18} />
                  {editSaving ? 'Updating...' : 'Update Activity'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <Footer />
      <ScrollToTop />
    </>
  );
}
