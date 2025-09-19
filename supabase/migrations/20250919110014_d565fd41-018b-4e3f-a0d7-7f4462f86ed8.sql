-- Fix security issues from the previous migration

-- Add missing RLS policy for counselors table
CREATE POLICY "Counselors can view their own profile" ON public.counselors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Counselors can update their own profile" ON public.counselors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Counselors can create their own profile" ON public.counselors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all counselors" ON public.counselors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Fix the handle_new_user function to have proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Fix the update_updated_at_column function to have proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;