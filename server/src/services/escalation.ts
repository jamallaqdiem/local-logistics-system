import { pool } from "../data/connection.js";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const CHECK_INTERVAL_MS = 3 * 60 * 1000; // Runs every 3 minutes

export function startEscalationWorker() {
  console.log("⚡ Auto-escalation worker initialized.");

  setInterval(async () => {
    try {
      const thresholdTime = Date.now() - THIRTY_MINUTES_MS;

      const result = await pool.query(
        `UPDATE orders 
         SET priority = 'high', last_update = $1 
         WHERE status = 'pending' 
           AND priority = 'normal' 
           AND last_update <= $2 
         RETURNING id`,
        [Date.now(), thresholdTime],
      );

      if (result.rowCount && result.rowCount > 0) {
        console.log(
          `⚡ Auto-escalated ${result.rowCount} stale order(s) to HIGH priority.`,
        );
      }
    } catch (error) {
      console.error("Error running priority escalation worker:", error);
    }
  }, CHECK_INTERVAL_MS);
}
