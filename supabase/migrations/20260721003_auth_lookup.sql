-- Function to securely look up an email by phone number
-- SECURITY DEFINER allows it to bypass RLS, ensuring unauthenticated users can still look up emails for login
CREATE OR REPLACE FUNCTION public.get_email_by_phone(p_phone text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_email text;
BEGIN
  -- Strict exact match lookup
  SELECT email INTO v_email
  FROM public.profiles
  WHERE phone = p_phone
  LIMIT 1;
  
  RETURN v_email;
END;
$$;

-- Security hardening: Remove default execution privileges from all users
REVOKE ALL ON FUNCTION public.get_email_by_phone(text) FROM PUBLIC;

-- Grant execution specifically to the roles required for the authentication flow
GRANT EXECUTE ON FUNCTION public.get_email_by_phone(text) TO anon, authenticated;
