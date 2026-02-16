import HealthData from "../../models/Tharuka/HealthData.js";
import alertService from "../Tharuka/alertService.js";

// ─── Random helpers ───────────────────────────────────────────
const rand     = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);
const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Normal Reading Generator ─────────────────────────────────
const generateNormalReadings = () => ({
  heartRate:    randInt(60, 100),
  bloodPressure:{ systolic: randInt(110, 130), diastolic: randInt(70, 85) },
  oxygenLevel:  rand(96, 100),
  temperature:  rand(36.1, 37.2),
  glucoseLevel: randInt(80, 140),
});

// ─── Emergency Spike Generator ───────────────────────────────
const generateEmergencySpike = () => ({
  heartRate:    randInt(150, 200),
  bloodPressure:{ systolic: randInt(180, 220), diastolic: randInt(110, 130) },
  oxygenLevel:  rand(92, 95),
  temperature:  rand(39.5, 41.0),
  glucoseLevel: randInt(350, 500),
});

// ─── Oxygen Drop Generator ────────────────────────────────────
const generateOxygenDrop = () => ({
  heartRate:    randInt(90, 130),
  bloodPressure:{ systolic: randInt(100, 130), diastolic: randInt(65, 85) },
  oxygenLevel:  rand(78, 88),
  temperature:  rand(36.5, 37.8),
  glucoseLevel: randInt(80, 160),
});

// ─── Map scenario name → generator ───────────────────────────
const SCENARIOS = {
  normal:        generateNormalReadings,
  emergency:     generateEmergencySpike,
  oxygen_drop:   generateOxygenDrop,
};

/**
 * Generate and persist one simulated reading.
 * @param {string} userId
 * @param {string} scenario  - "normal" | "emergency" | "oxygen_drop"
 */
const runSimulator = async (userId, scenario = "normal") => {
  const generator = SCENARIOS[scenario] || generateNormalReadings;
  const vitals    = generator();

  const isEmergency = scenario === "emergency" || scenario === "oxygen_drop";

  const entry = await HealthData.create({
    userId,
    ...vitals,
    source:      "simulator",
    isEmergency,
    recordedAt:  new Date(),
    metadata: {
      reportName:  `Simulated - ${scenario}`,
      extractedAt: new Date(),
    },
  });

  const alerts = await alertService.analyzeAndCreateAlerts(entry);
  return { entry, alerts, scenario };
};

/**
 * Bulk simulate — generate N readings in one call.
 * Useful for seeding test data.
 */
const bulkSimulate = async (userId, count = 5, scenario = "normal") => {
  const results = [];
  for (let i = 0; i < Math.min(count, 20); i++) {
    results.push(await runSimulator(userId, scenario));
  }
  return results;
};

export default {
  SCENARIOS,
  runSimulator,
  bulkSimulate,
};