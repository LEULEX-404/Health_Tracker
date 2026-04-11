import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/Imasha/AuthContext';
import { getNutritionAnalysis, getUserNutrition, deleteMeal, addMeal, updateMeal } from '../../services/Tharuka/nutritionService';
import { markReminderCompleted } from '../../services/Tharuka/mealReminderService';
import NutritionAnalysisWidget from '../../components/Tharuka/Nutrition/NutritionAnalysisWidget';
import DoctorAdviceCard from '../../components/Tharuka/Nutrition/DoctorAdviceCard';
import MealLogTable from '../../components/Tharuka/Nutrition/MealLogTable';
import MealFormModal from '../../components/Tharuka/Nutrition/MealFormModal';
import NutritionCheckModal from '../../components/Tharuka/Nutrition/NutritionCheckModal';
import MealPlanDashboard from '../../components/Tharuka/Nutrition/MealPlanDashboard';
import DeleteConfirmModal from '../../components/Tharuka/Nutrition/DeleteConfirmModal';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import { BarChart2, CalendarDays, Lightbulb, Zap, HeartPulse, TrendingUp, Apple, Salad, Flame, Utensils, Carrot, Coffee, Fish, Grape, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import HeroBanner from '../../assets/nutrition_hero_banner.png';
import './NutritionPage.css';

export default function NutritionPage() {
  const { user } = useAuth();
  const [loading,          setLoading]          = useState(true);
  const [analysisData,     setAnalysisData]     = useState(null);
  const [meals,            setMeals]            = useState([]);
  const [activeTab,        setActiveTab]        = useState('analysis');
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [selectedMeal,     setSelectedMeal]     = useState(null);
  const [deletingMealId,   setDeletingMealId]   = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const userId = user?.id || user?._id;

  const recommendations = useMemo(() =>
    meals.filter(m => m.doctorRecommendation).map(m => m.doctorRecommendation),
  [meals]);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [analysisRes, mealsRes] = await Promise.all([
        getNutritionAnalysis(userId, 'weekly'),
        getUserNutrition(userId, { limit: 10 }),
      ]);
      setAnalysisData(analysisRes.data);
      setMeals(mealsRes.data);
    } catch (error) {
      toast.error(error.message || 'Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleModalSubmit = async (formData) => {
    try {
      if (selectedMeal?._id) {
        await updateMeal(selectedMeal._id, { ...formData, userId });
        toast.success('Meal updated!');
        const { mealReminderId, ...mealData } = formData;
        await markReminderCompleted(mealReminderId, userId, mealData);
        toast.success('Meal logged and reminder completed!');
      } else {
        await addMeal({ ...formData, userId });
        toast.success('Meal logged!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save meal');
    }
  };

  const handleDeleteMeal = (mealId) => {
    setDeletingMealId(mealId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteMeal = async () => {
    setLoading(true);
    try {
      await deleteMeal(deletingMealId, userId);
      toast.success('Meal log deleted successfully');
      setIsDeleteModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to delete meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackgroundEffect />
      <Header />

      <main className="page-wrapper pn-page nu-page" style={{ position: 'relative', zIndex: 1, overflow: 'hidden' }}>

        {/* Floating neon icons behind main content */}
        <div className="pn-float-neon pn-fn-1"><Apple size={36} /></div>
        <div className="pn-float-neon pn-fn-2"><Flame size={42} /></div>
        <div className="pn-float-neon pn-fn-3"><Salad size={38} /></div>
        <div className="pn-float-neon pn-fn-4"><Utensils size={32} /></div>
        <div className="pn-float-neon pn-fn-5"><Carrot size={34} /></div>
        <div className="pn-float-neon pn-fn-6"><Coffee size={28} /></div>
        <div className="pn-float-neon pn-fn-7"><Fish size={32} /></div>
        <div className="pn-float-neon pn-fn-8"><Grape size={30} /></div>

        {/* ── Hero Banner ─────────────────────────────────────── */}
        <div className="nu-hero-banner">
          <img
            src={HeroBanner}
            alt="Healthy meals"
            className="nu-hero-img"
            loading="eager"
            decoding="async"
          />
          <div className="nu-hero-overlay" />

          <div className="nu-hero-text container">
            <motion.div
              className="nu-hero-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <Zap size={13} /> AI-Powered Nutrition
            </motion.div>
            <motion.h1
              className="nu-hero-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              Nutrition &amp; Meal Plans
            </motion.h1>
            <motion.p
              className="nu-hero-sub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
            >
              Monitor dietary trends, get clinical advice, and manage AI‑tailored meal regimens.
            </motion.p>
            <motion.div
              className="nu-hero-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24 }}
            >
              <span className="nu-hstat"><TrendingUp size={14} /> Weekly Analysis</span>
              <span className="nu-hstat"><HeartPulse size={14} /> Doctor Directives</span>
              <span className="nu-hstat"><Zap size={14} /> AI Meal Plans</span>
            </motion.div>
          </div>
        </div>

        {/* ── Content area ───────────────────────────────────── */}
        <div className="container pn-content" style={{ position: 'relative', zIndex: 2 }}>

          {/* Tabs — Lucide icons, no emojis */}
          <div className="pn-tabs-wrap">
            <div className="pn-tabs">
              <button
                className={`pn-tab ${activeTab === 'analysis' ? 'active' : ''}`}
                onClick={() => setActiveTab('analysis')}
              >
                <BarChart2 size={16} /> Analysis &amp; Logs
              </button>
              <button
                className={`pn-tab ${activeTab === 'planner' ? 'active' : ''}`}
                onClick={() => setActiveTab('planner')}
              >
                <CalendarDays size={16} /> Meal Planner
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div style={{ position: 'relative' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'analysis' && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="pn-grid"
                >
                  <div className="pn-col-main">
                    <NutritionAnalysisWidget data={analysisData} loading={loading} />
                    <MealLogTable
                      meals={meals}
                      loading={loading}
                      onAddClick={() => { setSelectedMeal(null); setIsModalOpen(true); }}
                      onEditClick={(meal) => { setSelectedMeal(meal); setIsModalOpen(true); }}
                      onDeleteClick={handleDeleteMeal}
                      onCheckClick={() => setIsCheckModalOpen(true)}
                    />
                  </div>

                  <div className="pn-col-side">
                    <div className="pn-tip-card n-card">
                      <div className="pn-sparks-wrap">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="pn-spark" style={{ 
                            top: `${Math.random() * 100}%`, 
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                          }} />
                        ))}
                      </div>
                      <div className="pn-tip-icon"><Lightbulb size={20} /></div>
                      <div>
                        <h4 className="pn-tip-title">Quick Tip</h4>
                        <p className="pn-tip-text">
                          Log meals daily — the AI needs at least <strong>3 days</strong> of data for accurate weekly macro analysis.
                        </p>
                      </div>
                    </div>
                    <DoctorAdviceCard recommendation={recommendations[0] || null} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'planner' && (
                <motion.div
                  key="planner"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <MealPlanDashboard 
                    onLogMeal={(preFilledData) => {
                      setSelectedMeal(preFilledData);
                      setIsModalOpen(true);
                    }}
                    onRefresh={loadData}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global Energy Sweep Overlay */}
            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ left: '-100%' }}
                  animate={{ left: '200%' }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  style={{
                    position: 'absolute',
                    top: 0, bottom: 0, width: '50%',
                    background: 'linear-gradient(90deg, transparent, rgba(0,200,151,0.2), transparent)',
                    zIndex: 10,
                    pointerEvents: 'none',
                    skewX: -20
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>{/* end .container.pn-content */}
      </main>

      <Footer />
      <ScrollToTop />

      <NutritionCheckModal 
        isOpen={isCheckModalOpen} 
        onClose={() => setIsCheckModalOpen(false)} 
        onLogResolvedMeal={(mealData) => {
          setSelectedMeal(mealData);
          setIsModalOpen(true);
        }}
      />
      <MealFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedMeal}
        isSimple={!selectedMeal?._id && !selectedMeal?.mealReminderId}
      />
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeletingMealId(null); }}
        onConfirm={confirmDeleteMeal}
        loading={loading}
        title="Remove Meal Log?"
        message="This record will be deleted from your nutrition analysis history. This cannot be undone."
      />
    </>
  );
}
