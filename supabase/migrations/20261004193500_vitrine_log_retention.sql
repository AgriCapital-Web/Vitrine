-- Rétention des logs applicatifs de la Vitrine.
-- Les données éditoriales et métier ne sont pas touchées.
DO $$
DECLARE j record;
BEGIN
  FOR j IN SELECT jobid FROM cron.job WHERE jobname='vitrine-log-retention' LOOP
    PERFORM cron.unschedule(j.jobid);
  END LOOP;
END $$;

SELECT cron.schedule(
  'vitrine-log-retention',
  '35 3 * * *',
  $cron$
    DELETE FROM public.page_visits
    WHERE created_at < now() - interval '180 days';

    DELETE FROM public.email_logs
    WHERE created_at < now() - interval '180 days';

    DELETE FROM public.ai_chat_logs
    WHERE created_at < now() - interval '180 days';

    DELETE FROM public.dataroom_access_logs
    WHERE created_at < now() - interval '365 days';

    DELETE FROM public.audit_logs
    WHERE created_at < now() - interval '365 days';
  $cron$
);
