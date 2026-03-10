import { Dumbbell, Timer, Flame, Heart, CalendarDays, Bike, Activity, BadgeCheck } from 'lucide-react';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import '../../styles/Priya/Exercise.css';

const recentHistory = [
  {
    id: 1,
    title: 'Morning Run',
    duration: '45 min',
    calories: '420 kcal',
    time: 'Today, 08:30 AM',
    icon: Activity,
    tone: 'blue',
  },
  {
    id: 2,
    title: 'Yoga Session',
    duration: '30 min',
    calories: '150 kcal',
    time: 'Yesterday, 06:15 PM',
    icon: Dumbbell,
    tone: 'purple',
  },
  {
    id: 3,
    title: 'Evening Cycling',
    duration: '60 min',
    calories: '550 kcal',
    time: '2 days ago',
    icon: Bike,
    tone: 'orange',
  },
];

export default function ExercisePage() {
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
                    <input id="duration" type="number" defaultValue="45" min="1" />
                    <span>MIN</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="calories">Calories Burned (kcal)</label>
                  <div className="pr-input-wrap">
                    <input id="calories" type="number" defaultValue="320" min="0" />
                    <span>KCAL</span>
                  </div>
                </div>
              </div>

              <label htmlFor="heartRate">Average Heart Rate (BPM)</label>
              <div className="pr-input-wrap">
                <Heart size={16} />
                <input id="heartRate" type="number" defaultValue="135" min="0" />
                <span>BPM</span>
              </div>

              <label htmlFor="activityDate">Date of Activity</label>
              <div className="pr-input-wrap">
                <input id="activityDate" type="date" />
                <CalendarDays size={16} />
              </div>

              <button type="button" className="pr-primary-btn">
                <BadgeCheck size={18} />
                Save Activity
              </button>
            </article>

            <aside className="pr-side-column">
              <div className="pr-stats-row">
                <article className="pr-card pr-stat pr-stat-blue">
                  <p>Today&apos;s Total</p>
                  <h3>
                    124 <span>min</span>
                  </h3>
                </article>
                <article className="pr-card pr-stat pr-stat-green">
                  <p>Calories</p>
                  <h3>
                    840 <span>kcal</span>
                  </h3>
                </article>
              </div>

              <article className="pr-card pr-history-card">
                <div className="pr-history-head">
                  <h2>Recent History</h2>
                  <a href="#0" onClick={(event) => event.preventDefault()}>
                    View All
                  </a>
                </div>

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

                <p className="pr-history-note">Auto-sync with Apple Health and Google Fit is active.</p>
              </article>

              <article className="pr-card pr-motivation-card">
                <h3>Keep it up, Alex!</h3>
                <p>You&apos;re only 3 workouts away from your weekly goal. Consistency is the key to longevity.</p>
              </article>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}

