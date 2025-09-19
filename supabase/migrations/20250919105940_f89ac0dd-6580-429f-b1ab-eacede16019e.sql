-- Create enum types for user roles and mental health assessments
CREATE TYPE user_role AS ENUM ('student', 'counselor', 'admin', 'peer_volunteer');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE support_request_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE resource_type AS ENUM ('video', 'audio', 'article', 'guide', 'exercise');

-- User profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT,
  full_name TEXT,
  role user_role DEFAULT 'student',
  college_name TEXT,
  department TEXT,
  year_of_study INTEGER,
  phone TEXT,
  emergency_contact TEXT,
  language_preference TEXT DEFAULT 'english',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mental health assessments table (PHQ-9, GAD-7, etc.)
CREATE TABLE public.mental_health_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL, -- 'PHQ-9', 'GAD-7', 'GHQ', etc.
  responses JSONB NOT NULL,
  total_score INTEGER,
  severity_level TEXT,
  risk_level support_request_priority DEFAULT 'low',
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Counselors table
CREATE TABLE public.counselors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  specialization TEXT[],
  qualification TEXT,
  experience_years INTEGER,
  availability_schedule JSONB, -- JSON object with available time slots
  is_available BOOLEAN DEFAULT TRUE,
  max_appointments_per_day INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  counselor_id UUID REFERENCES public.counselors(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status appointment_status DEFAULT 'pending',
  mode TEXT DEFAULT 'in-person', -- 'in-person', 'video', 'phone'
  notes TEXT,
  student_notes TEXT,
  counselor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI chat conversations table
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conversation_data JSONB NOT NULL, -- Store full conversation history
  risk_assessment support_request_priority DEFAULT 'low',
  requires_human_intervention BOOLEAN DEFAULT FALSE,
  emergency_flags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Psychoeducational resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content_type resource_type NOT NULL,
  description TEXT,
  content_url TEXT,
  content_text TEXT,
  language TEXT DEFAULT 'english',
  category TEXT, -- 'anxiety', 'depression', 'stress', 'sleep', etc.
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Peer support forum posts
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE,
  is_moderated BOOLEAN DEFAULT FALSE,
  moderator_notes TEXT,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum replies
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  is_moderated BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crisis support requests
CREATE TABLE public.crisis_support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  priority support_request_priority NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  contact_preference TEXT, -- 'phone', 'email', 'in-person'
  status TEXT DEFAULT 'open', -- 'open', 'in-progress', 'resolved'
  assigned_to UUID REFERENCES auth.users(id),
  response_time TIMESTAMP WITH TIME ZONE,
  resolution_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_support_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mental health assessments
CREATE POLICY "Users can view their own assessments" ON public.mental_health_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" ON public.mental_health_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors and admins can view assessments" ON public.mental_health_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('counselor', 'admin')
    )
  );

-- RLS Policies for appointments
CREATE POLICY "Students can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Counselors can view their appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.counselors
      WHERE user_id = auth.uid() AND id = appointments.counselor_id
    )
  );

-- RLS Policies for AI conversations
CREATE POLICY "Users can view their own conversations" ON public.ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.ai_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for resources (public read access)
CREATE POLICY "Anyone can view resources" ON public.resources
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins and counselors can manage resources" ON public.resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'counselor')
    )
  );

-- RLS Policies for forum posts
CREATE POLICY "Anyone can view forum posts" ON public.forum_posts
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can create forum posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for forum replies
CREATE POLICY "Anyone can view forum replies" ON public.forum_replies
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can create forum replies" ON public.forum_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for crisis support requests
CREATE POLICY "Users can view their own crisis requests" ON public.crisis_support_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create crisis requests" ON public.crisis_support_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors and admins can view all crisis requests" ON public.crisis_support_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('counselor', 'admin')
    )
  );

-- Create function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();