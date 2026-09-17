-- ENUMS
CREATE TYPE public.user_role AS ENUM ('student','provider','counselor','admin','peer_volunteer');
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TYPE public.appointment_status AS ENUM ('pending','confirmed','cancelled','completed');
CREATE TYPE public.resource_type AS ENUM ('video','audio','article','guide','exercise');
CREATE TYPE public.support_request_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.provider_profession AS ENUM ('psychologist','counselor','therapist','psychiatrist','clinical_doctor');

-- UTILITY
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- INSTITUTIONS
CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  city text,
  state text,
  subscription_id text NOT NULL DEFAULT concat('SUB-', substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  subscription_tier text NOT NULL DEFAULT 'basic',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.institutions TO anon, authenticated;
GRANT ALL ON public.institutions TO service_role;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institutions are public" ON public.institutions FOR SELECT TO anon, authenticated USING (true);

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text,
  full_name text,
  phone text,
  role public.user_role NOT NULL DEFAULT 'student',
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  institution_subscription_id text,
  college_name text,
  department text,
  year_of_study integer,
  emergency_contact text,
  language_preference text DEFAULT 'en',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inst_id uuid; inst_sub text;
BEGIN
  BEGIN
    inst_id := nullif(NEW.raw_user_meta_data->>'institution_id','')::uuid;
  EXCEPTION WHEN others THEN inst_id := NULL;
  END;
  IF inst_id IS NOT NULL THEN
    SELECT subscription_id INTO inst_sub FROM public.institutions WHERE id = inst_id;
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name, phone, role, institution_id, institution_subscription_id, college_name, department, year_of_study)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(nullif(NEW.raw_user_meta_data->>'role','')::public.user_role, 'student'),
    inst_id,
    inst_sub,
    NEW.raw_user_meta_data->>'college_name',
    NEW.raw_user_meta_data->>'department',
    nullif(NEW.raw_user_meta_data->>'year_of_study','')::int
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PROVIDERS
CREATE TABLE public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  profession public.provider_profession NOT NULL DEFAULT 'counselor',
  bio text,
  qualification text,
  experience_years integer DEFAULT 0,
  specialization text[] DEFAULT '{}',
  certification_url text,
  clinic_name text,
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  languages text[] DEFAULT ARRAY['English'],
  session_modes text[] DEFAULT ARRAY['video-call','in-person'],
  is_verified boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.providers TO anon, authenticated;
GRANT INSERT, UPDATE ON public.providers TO authenticated;
GRANT ALL ON public.providers TO service_role;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers directory is public" ON public.providers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users create own provider profile" ON public.providers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Providers update own profile" ON public.providers FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- APPOINTMENTS
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  duration_minutes integer DEFAULT 45,
  mode text DEFAULT 'video-call',
  status public.appointment_status NOT NULL DEFAULT 'pending',
  student_notes text,
  provider_notes text,
  institution_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own appointments" ON public.appointments FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_id AND p.user_id = auth.uid()));
CREATE POLICY "Students book appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students or providers update appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_id AND p.user_id = auth.uid()));
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- AI CONVERSATIONS
CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conversation_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_assessment public.support_request_priority,
  emergency_flags text[],
  requires_human_intervention boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own ai conversations" ON public.ai_conversations FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ASSESSMENTS
CREATE TABLE public.mental_health_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assessment_type text NOT NULL,
  responses jsonb NOT NULL,
  total_score integer,
  severity_level text,
  risk_level public.support_request_priority,
  notes text,
  taken_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.mental_health_assessments TO authenticated;
GRANT ALL ON public.mental_health_assessments TO service_role;
ALTER TABLE public.mental_health_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own assessments select" ON public.mental_health_assessments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Own assessments insert" ON public.mental_health_assessments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- CRISIS
CREATE TABLE public.crisis_support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  description text NOT NULL,
  priority public.support_request_priority NOT NULL DEFAULT 'high',
  contact_preference text,
  location text,
  status text DEFAULT 'open',
  assigned_to uuid,
  response_time timestamptz,
  resolution_time timestamptz,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.crisis_support_requests TO authenticated;
GRANT ALL ON public.crisis_support_requests TO service_role;
ALTER TABLE public.crisis_support_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own crisis select" ON public.crisis_support_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Own crisis insert" ON public.crisis_support_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- FORUM
CREATE TABLE public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  is_anonymous boolean DEFAULT true,
  is_moderated boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  moderator_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.forum_posts TO authenticated;
GRANT ALL ON public.forum_posts TO service_role;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Forum posts readable" ON public.forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own forum posts insert" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Forum posts update" ON public.forum_posts FOR UPDATE TO authenticated USING (true);

CREATE TABLE public.forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_anonymous boolean DEFAULT true,
  is_moderated boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.forum_replies TO authenticated;
GRANT ALL ON public.forum_replies TO service_role;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Forum replies readable" ON public.forum_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own forum replies insert" ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- RESOURCES
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content_type public.resource_type NOT NULL DEFAULT 'article',
  content_url text,
  content_text text,
  category text,
  language text DEFAULT 'en',
  tags text[],
  is_featured boolean DEFAULT false,
  views_count integer DEFAULT 0,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, UPDATE ON public.resources TO anon, authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resources public read" ON public.resources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Resources view counter" ON public.resources FOR UPDATE TO anon, authenticated USING (true);

-- SEED INSTITUTIONS
INSERT INTO public.institutions (name, city, state, subscription_tier) VALUES
 ('Amity University Noida','Noida','Uttar Pradesh','premium'),
 ('Delhi University','New Delhi','Delhi','premium'),
 ('Jawaharlal Nehru University','New Delhi','Delhi','standard'),
 ('IIT Delhi','New Delhi','Delhi','premium'),
 ('Banaras Hindu University','Varanasi','Uttar Pradesh','standard'),
 ('Manipal University Jaipur','Jaipur','Rajasthan','standard'),
 ('VIT Vellore','Vellore','Tamil Nadu','premium'),
 ('Christ University Bangalore','Bengaluru','Karnataka','standard'),
 ('Savitribai Phule Pune University','Pune','Maharashtra','basic'),
 ('Osmania University','Hyderabad','Telangana','basic');

-- SEED PROVIDERS
INSERT INTO public.providers (name, email, phone, profession, bio, qualification, experience_years, specialization, is_verified, clinic_name, languages) VALUES
 ('Dr. Ananya Sharma','ananya.sharma@campuscare.in','+919812345601','psychologist','Clinical psychologist supporting students with anxiety, exam stress and burnout.','PhD Clinical Psychology',12,ARRAY['Anxiety','Academic Stress','Burnout'],true,'MindSpace Clinic',ARRAY['English','Hindi']),
 ('Dr. Rohan Mehta','rohan.mehta@campuscare.in','+919812345602','psychiatrist','Psychiatrist specialising in depression, sleep disorders and medication management.','MD Psychiatry',15,ARRAY['Depression','Sleep Disorders'],true,'Calm Mind Care',ARRAY['English','Hindi','Marathi']),
 ('Ms. Priya Nair','priya.nair@campuscare.in','+919812345603','counselor','Campus counsellor focused on social isolation, relationships and adjustment issues.','MA Counselling Psychology',8,ARRAY['Relationships','Social Isolation'],true,'Campus Wellness Cell',ARRAY['English','Malayalam','Hindi']),
 ('Mr. Arjun Verma','arjun.verma@campuscare.in','+919812345604','therapist','CBT therapist helping students build coping skills and manage panic attacks.','M.Phil Clinical Psychology',6,ARRAY['CBT','Panic Attacks','Mindfulness'],true,'Balance Therapy Room',ARRAY['English','Hindi']),
 ('Dr. Kavita Rao','kavita.rao@campuscare.in','+919812345605','clinical_doctor','Physician coordinating student health, sleep hygiene and referrals.','MBBS, Diploma in Psychological Medicine',10,ARRAY['Sleep Hygiene','Student Health'],true,'Campus Health Centre',ARRAY['English','Kannada']),
 ('Ms. Sneha Iyer','sneha.iyer@campuscare.in','+919812345606','counselor','Peer-support trained counsellor for first-year adjustment and homesickness.','MSc Psychology',3,ARRAY['Adjustment','Homesickness'],false,'Student Support Desk',ARRAY['English','Tamil']);

-- SEED RESOURCES
INSERT INTO public.resources (title, description, content_type, content_url, category, language, is_featured, tags) VALUES
 ('5-Minute Breathing Reset','A short guided breathing exercise to calm exam anxiety.','audio','https://www.youtube.com/watch?v=inpok4MKVLM','relaxation','en',true,ARRAY['breathing','anxiety']),
 ('Understanding Academic Burnout','What burnout looks like for students and how to recover.','article',NULL,'education','en',true,ARRAY['burnout','stress']),
 ('Sleep Hygiene Guide for Students','Practical steps to fix a broken sleep cycle.','guide',NULL,'wellness','en',false,ARRAY['sleep']),
 ('Progressive Muscle Relaxation','Guided full-body relaxation practice.','exercise','https://www.youtube.com/watch?v=ihO02wUzgkc','relaxation','en',false,ARRAY['relaxation']),
 ('Managing Exam Stress (Hindi)','Hindi-language video on handling exam pressure.','video','https://www.youtube.com/watch?v=hnpQrMqDoqE','education','hi',true,ARRAY['exams','hindi']);
