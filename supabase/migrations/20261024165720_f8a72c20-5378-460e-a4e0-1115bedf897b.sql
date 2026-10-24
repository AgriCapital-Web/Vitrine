GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
DO $$ BEGIN
  EXECUTE (SELECT string_agg(format('GRANT EXECUTE ON FUNCTION %s TO anon, authenticated;', p.oid::regprocedure), ' ')
           FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
           WHERE n.nspname='public' AND p.proname IN ('is_admin','has_role'));
END $$;