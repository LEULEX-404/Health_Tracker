import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import HeroSection from '../../components/Tharuka/Home/HeroSection';
import FeaturesSection from '../../components/Tharuka/Home/FeaturesSection';
import ServicesSection from '../../components/Tharuka/Home/ServicesSection';
import StatsSection from '../../components/Tharuka/Home/StatsSection';
import HowItWorksSection from '../../components/Tharuka/Home/HowItWorksSection';
import TestimonialsSection from '../../components/Tharuka/Home/TestimonialsSection';
import CaregiverSection from '../../components/Tharuka/Home/CaregiverSection';
import CtaSection from '../../components/Tharuka/Home/CtaSection';

export default function HomePage() {
  return (
    <>
      <BackgroundEffect />
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
        <StatsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CaregiverSection />
        <CtaSection />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
