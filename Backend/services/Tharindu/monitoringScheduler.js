import cron from "node-cron";
import { runEscalationScan } from "./escalationService.js";

// Runs every minute to check for unacknowledged critical alerts
export const startMonitoringSchedulers = () => {
  cron.schedule("* * * * *", async () => {
    await runEscalationScan();
  });
};

