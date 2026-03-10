import { useState } from 'react';
import { Search, Star, MapPin } from 'lucide-react';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import '../../styles/Priya/FindSpecialist.css';

/* Same health condition categories as auth (RegisterPage) */
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

const SPECIALISTS = [
  {
    id: 1,
    name: 'Dr. Rohan Perera',
    specialization: 'General Physician',
    experience: 8,
    location: 'Nawaloka Hospital, Colombo',
    rating: 4.8,
    availableToday: true,
    conditions: ['diabetes', 'hypertension', 'heart_disease'],
    image: '/images/Priya/doctor-01.png',
    slots: ['10:00 AM', '04:30 PM', '06:00 PM'],
  },
  {
    id: 2,
    name: 'Dr. Anjali Fernando',
    specialization: 'Internal Medicine',
    experience: 12,
    location: 'Asiri Central Hospital, Colombo',
    rating: 5,
    availableToday: true,
    conditions: ['obesity', 'high_cholesterol', 'diabetes'],
    image: '/images/Priya/doctor-02.png',
    slots: ['Mon, 09:00 AM', '11:00 AM', '03:00 PM'],
  },
  {
    id: 3,
    name: 'Dr. Sameera Wijesinghe',
    specialization: 'Cardiology',
    experience: 15,
    location: 'Durdans Hospital, Colombo',
    rating: 4.7,
    availableToday: false,
    conditions: ['heart_disease', 'hypertension', 'high_cholesterol'],
    image: '/images/Priya/doctor-03.png',
    slots: ['04:00 PM', '09:30 AM', '02:30 PM'],
  },
  {
    id: 4,
    name: 'Dr. Kavitha Jayawardena',
    specialization: 'Pediatrics',
    experience: 6,
    location: 'Lady Ridgeway Hospital, Colombo',
    rating: 4.9,
    availableToday: true,
    conditions: ['celiac', 'lactose_intolerant', 'anemia'],
    image: '/images/Priya/doctor-04.png',
    slots: ['Tue, 10:00 AM', '02:00 PM', '05:00 PM'],
  },
  {
    id: 5,
    name: 'Dr. Nimal Silva',
    specialization: 'Nephrology',
    experience: 10,
    location: 'National Hospital, Kandy',
    rating: 4.6,
    availableToday: true,
    conditions: ['kidney_disease', 'hypertension', 'diabetes'],
    image: '/images/Priya/doctor-05.png',
    slots: ['Wed, 08:00 AM', '12:00 PM', '04:30 PM'],
  },
  {
    id: 6,
    name: 'Dr. Tharanga Dissanayake',
    specialization: 'Endocrinology',
    experience: 14,
    location: 'Lanka Hospital, Colombo',
    rating: 4.8,
    availableToday: false,
    conditions: ['osteoporosis', 'anemia', 'other'],
    image: '/images/Priya/doctor-06.png',
    slots: ['Thu, 09:00 AM', '01:00 PM', '06:00 PM'],
  },
  {
    id: 7,
    name: 'Dr. Chamari Gunaratne',
    specialization: 'General Physician',
    experience: 7,
    location: 'Hemas Hospital, Wattala',
    rating: 4.7,
    availableToday: true,
    conditions: ['diabetes', 'obesity', 'high_cholesterol'],
    image: '/images/Priya/doctor-07.png',
    slots: ['Fri, 09:00 AM', '02:00 PM', '04:00 PM'],
  },
  {
    id: 8,
    name: 'Dr. Sanath Jayasuriya',
    specialization: 'Cardiology',
    experience: 11,
    location: 'Asiri Surgical, Colombo',
    rating: 4.9,
    availableToday: true,
    conditions: ['heart_disease', 'hypertension', 'diabetes'],
    image: '/images/Priya/doctor-08.png',
    slots: ['10:30 AM', '03:00 PM', '05:30 PM'],
  },
  {
    id: 9,
    name: 'Dr. Dilini Wickramasinghe',
    specialization: 'Pediatrics',
    experience: 9,
    location: 'Ninewells Hospital, Kandy',
    rating: 4.8,
    availableToday: false,
    conditions: ['celiac', 'anemia', 'lactose_intolerant'],
    image: '/images/Priya/doctor-09.png',
    slots: ['Sat, 08:00 AM', '11:00 AM', '01:00 PM'],
  },
  {
    id: 10,
    name: 'Dr. Mahesh De Silva',
    specialization: 'Nephrology',
    experience: 13,
    location: 'Nawaloka Hospital, Colombo',
    rating: 4.9,
    availableToday: true,
    conditions: ['kidney_disease', 'diabetes', 'hypertension'],
    image: '/images/Priya/doctor-10.png',
    slots: ['Mon, 10:00 AM', '12:00 PM', '03:30 PM'],
  },
  {
    id: 11,
    name: 'Dr. Nadeesha Abeywickrama',
    specialization: 'Internal Medicine',
    experience: 5,
    location: 'Durdans Hospital, Colombo',
    rating: 4.6,
    availableToday: true,
    conditions: ['obesity', 'diabetes', 'high_cholesterol'],
    image: '/images/Priya/doctor-11.png',
    slots: ['Tue, 09:30 AM', '02:00 PM', '05:00 PM'],
  },
  {
    id: 12,
    name: 'Dr. Ruwan Bandara',
    specialization: 'General Physician',
    experience: 16,
    location: 'Teaching Hospital, Galle',
    rating: 5,
    availableToday: false,
    conditions: ['hypertension', 'heart_disease', 'other'],
    image: '/images/Priya/doctor-12.png',
    slots: ['Wed, 08:30 AM', '11:30 AM', '04:00 PM'],
  },
  {
    id: 13,
    name: 'Dr. Chathuri Ranasinghe',
    specialization: 'Endocrinology',
    experience: 10,
    location: 'Lanka Hospital, Colombo',
    rating: 4.7,
    availableToday: true,
    conditions: ['diabetes', 'osteoporosis', 'obesity'],
    image: '/images/Priya/doctor-13.png',
    slots: ['Thu, 10:00 AM', '01:00 PM', '06:00 PM'],
  },
  {
    id: 14,
    name: 'Dr. Asanka Herath',
    specialization: 'Cardiology',
    experience: 14,
    location: 'Asiri Central Hospital, Colombo',
    rating: 4.8,
    availableToday: true,
    conditions: ['heart_disease', 'high_cholesterol', 'hypertension'],
    image: '/images/Priya/doctor-14.png',
    slots: ['Fri, 09:00 AM', '12:00 PM', '03:00 PM'],
  },
  {
    id: 15,
    name: 'Dr. Sandya Peiris',
    specialization: 'Pediatrics',
    experience: 8,
    location: 'Lady Ridgeway Hospital, Colombo',
    rating: 4.9,
    availableToday: true,
    conditions: ['anemia', 'celiac', 'lactose_intolerant', 'other'],
    image: '/images/Priya/doctor-15.png',
    slots: ['Sat, 08:00 AM', '10:30 AM', '02:30 PM'],
  },
];

function matchSpecialist(doc, query) {
  if (!query || !query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    doc.name.toLowerCase().includes(q) ||
    doc.specialization.toLowerCase().includes(q) ||
    doc.location.toLowerCase().includes(q)
  );
}

export default function FindSpecialistPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredSpecialists = SPECIALISTS.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'all' || doc.conditions.includes(selectedCategory);
    const matchesSearch = matchSpecialist(doc, searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Header />
      <main className="pr-specialist-page">
        <section className="pr-specialist-shell container">
          <header className="pr-specialist-head">
            <p className="pr-specialist-overview">Overview</p>
            <h1>Find a Specialist</h1>
            <p className="pr-specialist-subtitle">
              Connect with 120+ top-rated medical professionals.
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

          {filteredSpecialists.length === 0 ? (
            <p className="pr-specialist-empty">
              No specialists match your search or filter. Try a different keyword or category.
            </p>
          ) : (
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
                    {doc.specialization} • {doc.experience} yrs exp.
                  </p>
                  <p className="pr-specialist-card-location">
                    <MapPin size={14} aria-hidden />
                    {doc.location}
                  </p>
                  <p className="pr-specialist-slots-label">AVAILABLE SLOTS</p>
                  <div className="pr-specialist-slots">
                    {doc.slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className="pr-specialist-slot-btn"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="pr-specialist-book-btn">
                    Book Now
                  </button>
                </div>
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
