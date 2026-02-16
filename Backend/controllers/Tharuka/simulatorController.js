import simulatorService from "../../services/Tharuka/simulatorService.js";

// ─── POST /api/health-data/simulator ─────────────────────────
const runSimulator = async (req, res) => {
  try {
    const { userId, scenario = "normal" } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const validScenarios = Object.keys(simulatorService.SCENARIOS);
    if (!validScenarios.includes(scenario)) {
      return res.status(400).json({
        success: false,
        message: `Invalid scenario. Valid options: ${validScenarios.join(", ")}`,
      });
    }

    const result = await simulatorService.runSimulator(userId, scenario);

    return res.status(201).json({
      success: true,
      message: `Simulated ${scenario} reading created`,
      data:    result,
    });
  } catch (error) {
    console.error("runSimulator error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/health-data/simulator/bulk ────────────────────
const bulkSimulate = async (req, res) => {
  try {
    const { userId, count = 5, scenario = "normal" } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const results = await simulatorService.bulkSimulate(userId, count, scenario);

    return res.status(201).json({
      success: true,
      message: `${results.length} simulated readings created`,
      data: {
        count:           results.length,
        scenario,
        alertsTriggered: results.reduce((sum, r) => sum + r.alerts.length, 0),
        readings:        results.map((r) => r.entry),
      },
    });
  } catch (error) {
    console.error("bulkSimulate error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  runSimulator,
  bulkSimulate,
};
