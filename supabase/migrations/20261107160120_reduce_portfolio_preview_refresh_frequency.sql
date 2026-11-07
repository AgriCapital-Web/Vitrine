-- Portfolio preview screenshots are informational assets, not real-time data.
-- Refresh them once per day instead of every 15 minutes to avoid repeated uploads/deletes.
SELECT cron.alter_job(2, '15 3 * * *', NULL, NULL, NULL, NULL);
