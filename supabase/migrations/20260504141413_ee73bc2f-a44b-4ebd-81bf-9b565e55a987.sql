REVOKE EXECUTE ON FUNCTION public.find_matching_pros(double precision, double precision, uuid, double precision, integer, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.haversine_km(double precision, double precision, double precision, double precision) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.find_matching_pros(double precision, double precision, uuid, double precision, integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.haversine_km(double precision, double precision, double precision, double precision) TO authenticated;