import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Flame, Target, Activity, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import './NutritionComponents.css';

const NutritionAnalysisWidget = React.memo(function NutritionAnalysisWidget({ data, loading }) {
  // Memoize all derived data so it only recalculates when data changes
  const { chartData, macros, avgCalories } = useMemo(() => {
    if (!data?.averages) return { chartData: [], macros: [], avgCalories: 0 };
    const { averages, topCalorieMeals = [] } = data;
    return {
      avgCalories: Math.round(averages.avgDailyCalories || 0),
      chartData: topCalorieMeals.map(meal => ({
        name: meal.mealName
          ? meal.mealName.split(' ')[0]
          : new Date(meal.date).toLocaleDateString('en-US', { weekday: 'short' }),
        calories: Math.round(meal.calories || 0),
      })),
      macros: [
        { key: 'cal',  label: 'Calories', value: averages.avgDailyCalories  || 0, unit: 'kcal', Icon: Flame,    max: 2000 },
        { key: 'pro',  label: 'Protein',  value: averages.avgDailyProtein    || 0, unit: 'g',    Icon: Target,   max: 150  },
        { key: 'carb', label: 'Carbs',    value: averages.avgDailyCarbohydrates || 0, unit: 'g', Icon: Activity, max: 300  },
        { key: 'fat',  label: 'Fat',      value: averages.avgDailyFat        || 0, unit: 'g',    Icon: Droplets, max: 70   },
      ],
    };
  }, [data]);

  if (loading) {
    return (
      <div className="n-card">
        <div className="n-loader">
          <div className="n-spinner" />
          <span>Loading analysis…</span>
        </div>
      </div>
    );
  }

  if (!data?.averages) {
    return (
      <div className="n-card">
        <div className="n-loader">
          <Activity size={48} style={{ opacity: 0.15 }} />
          <strong>No Analysis Yet</strong>
          <span style={{ textAlign: 'center', maxWidth: 300 }}>Log a few meals to unlock your weekly nutrition trends.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="n-card n-widget" style={{ animation: 'n-neon-pulse 5s ease-in-out infinite' }}>
      {/* Header */}
      <div className="n-widget-header">
        <div>
          <h3 className="n-widget-title">Weekly Nutrition Analysis</h3>
          <p className="n-widget-sub">Average daily intake across your logged meals</p>
        </div>
        <div className="n-cal-badge">
          <span>Avg Daily</span>
          <strong>{avgCalories}</strong>
          <em>kcal</em>
        </div>
      </div>

      {/* Macro cards */}
      <div className="n-macro-grid">
        {macros.map((m, i) => {
          const pct = Math.min(100, Math.round((m.value / m.max) * 100));
          return (
            <motion.div
              key={m.key}
              className={`n-macro-card ${m.key}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ position: 'relative' }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <div className="n-macro-icon"><m.Icon size={18} /></div>
              <div className="n-macro-val" style={{ margin: '4px 0' }}>{Math.round(m.value)}</div>
              <div className="n-macro-lbl">{m.label} ({m.unit})</div>
              <div className="n-progress-bar">
                <div className="n-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="n-chart-wrap">
          <h4 className="n-chart-title">Caloric Load — Top Meals</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ncGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--n-blue)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--n-blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--n-border)" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--n-muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--n-muted)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ 
                  background: 'var(--n-card)', 
                  border: '1px solid var(--n-border)', 
                  borderRadius: 12, 
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)' 
                }}
                itemStyle={{ color: 'var(--n-blue)', fontWeight: 800 }}
                labelStyle={{ color: 'var(--n-muted)', fontSize: 11, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="var(--n-blue)"
                strokeWidth={3}
                fill="url(#ncGrad)"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff', boxShadow: '0 0 10px var(--n-blue)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
});

export default NutritionAnalysisWidget;
