CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN auth.role() = 'service_role' THEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text = _role)
    WHEN auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN false
    ELSE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = _role)
  END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN auth.role() = 'service_role' THEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
    WHEN auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN false
    ELSE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = _role)
  END;
$function$;

REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

ALTER POLICY "Users can insert their own profile" ON public.profiles
  WITH CHECK (((SELECT auth.uid()) = user_id) OR (SELECT public.is_admin()));
ALTER POLICY "Users can update their own profile" ON public.profiles
  USING (((SELECT auth.uid()) = user_id) OR (SELECT public.is_admin()))
  WITH CHECK (((SELECT auth.uid()) = user_id) OR (SELECT public.is_admin()));
ALTER POLICY "Users can view their own profile" ON public.profiles
  USING (((SELECT auth.uid()) = user_id) OR (SELECT public.is_admin()));
ALTER POLICY "Users manage own push subscriptions" ON public.push_subscriptions
  USING ((user_id = (SELECT auth.uid())) OR (SELECT public.is_admin()))
  WITH CHECK (user_id = (SELECT auth.uid()));
ALTER POLICY "user_roles_select_own" ON public.user_roles
  USING (user_id = (SELECT auth.uid()));
ALTER POLICY "Staff read broken images" ON public.broken_image_logs
  USING ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
      OR (SELECT public.has_role((SELECT auth.uid()), 'moderator'::public.app_role)));
ALTER POLICY "Staff update broken images" ON public.broken_image_logs
  USING ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
      OR (SELECT public.has_role((SELECT auth.uid()), 'moderator'::public.app_role)))
  WITH CHECK ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
      OR (SELECT public.has_role((SELECT auth.uid()), 'moderator'::public.app_role)));
