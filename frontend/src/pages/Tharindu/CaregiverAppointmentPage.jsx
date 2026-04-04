/**
 * CaregiverAppointmentPage.jsx
 * ---------------------------------------------------------
 * Patient-facing page that wraps the PatientAppointmentsTab
 * component inside the standard site layout (Header + Footer).
 * Accessible from the navbar at /caregiver-appointment.
 */

import React from 'react';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import PatientAppointmentsTab from './PatientAppointmentsTab';
import '../../styles/Tharindu/caregiverAppointment.css';

export default function CaregiverAppointmentPage() {
  return (
    <>
      <Header />
      <main className="cg-appointment-page">
        {/* Centered content container */}
        <div className="cg-appointment-page__container">
          {/* Page title */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 className="cg-appointment-page__title">
              Caregiver Appointments
            </h1>
            <p className="cg-appointment-page__subtitle">
              Browse available caregivers and book your appointment with ease.
            </p>
          </div>

          {/* Booking UI */}
          <PatientAppointmentsTab />
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
