-- Add sample counselors for the booking system
INSERT INTO public.counselors (user_id, qualification, specialization, experience_years, availability_schedule, is_available, max_appointments_per_day) VALUES
-- We'll use placeholder user IDs - in real system these would be actual counselor user accounts
(gen_random_uuid(), 'PhD in Clinical Psychology', ARRAY['Anxiety Disorders', 'Depression', 'Academic Stress'], 8, 
 '{"monday": {"9:00": "available", "10:00": "available", "11:00": "available", "14:00": "available", "15:00": "available", "16:00": "available"}, 
   "tuesday": {"9:00": "available", "10:00": "available", "11:00": "available", "14:00": "available", "15:00": "available", "16:00": "available"},
   "wednesday": {"9:00": "available", "10:00": "available", "11:00": "available", "14:00": "available", "15:00": "available", "16:00": "available"},
   "thursday": {"9:00": "available", "10:00": "available", "11:00": "available", "14:00": "available", "15:00": "available", "16:00": "available"},
   "friday": {"9:00": "available", "10:00": "available", "11:00": "available", "14:00": "available", "15:00": "available", "16:00": "available"}}'::jsonb, 
 true, 6),

(gen_random_uuid(), 'MA in Counseling Psychology', ARRAY['Relationship Issues', 'Self-Esteem', 'Trauma Counseling'], 5, 
 '{"tuesday": {"10:00": "available", "11:00": "available", "13:00": "available", "14:00": "available", "15:00": "available"}, 
   "wednesday": {"10:00": "available", "11:00": "available", "13:00": "available", "14:00": "available", "15:00": "available"},
   "thursday": {"10:00": "available", "11:00": "available", "13:00": "available", "14:00": "available", "15:00": "available"},
   "friday": {"10:00": "available", "11:00": "available", "13:00": "available", "14:00": "available", "15:00": "available"}}'::jsonb, 
 true, 5),

(gen_random_uuid(), 'PsyD in Clinical Psychology', ARRAY['ADHD', 'Learning Disabilities', 'Academic Performance'], 12, 
 '{"monday": {"8:00": "available", "9:00": "available", "10:00": "available", "15:00": "available", "16:00": "available", "17:00": "available"}, 
   "wednesday": {"8:00": "available", "9:00": "available", "10:00": "available", "15:00": "available", "16:00": "available", "17:00": "available"},
   "friday": {"8:00": "available", "9:00": "available", "10:00": "available", "15:00": "available", "16:00": "available", "17:00": "available"}}'::jsonb, 
 true, 6),

(gen_random_uuid(), 'MSW with Mental Health Specialization', ARRAY['Group Therapy', 'Crisis Intervention', 'Family Counseling'], 6, 
 '{"monday": {"11:00": "available", "13:00": "available", "14:00": "available", "15:00": "available"}, 
   "tuesday": {"11:00": "available", "13:00": "available", "14:00": "available", "15:00": "available"},
   "thursday": {"11:00": "available", "13:00": "available", "14:00": "available", "15:00": "available"},
   "friday": {"11:00": "available", "13:00": "available", "14:00": "available", "15:00": "available"}}'::jsonb, 
 true, 4),

(gen_random_uuid(), 'PhD in Behavioral Psychology', ARRAY['Stress Management', 'Sleep Disorders', 'Mindfulness Therapy'], 10, 
 '{"tuesday": {"9:00": "available", "10:00": "available", "14:00": "available", "15:00": "available", "16:00": "available"}, 
   "wednesday": {"9:00": "available", "10:00": "available", "14:00": "available", "15:00": "available", "16:00": "available"},
   "thursday": {"9:00": "available", "10:00": "available", "14:00": "available", "15:00": "available", "16:00": "available"}}'::jsonb, 
 true, 5);

-- Also add corresponding profiles for these counselors so they have names
INSERT INTO public.profiles (user_id, full_name, email, role, college_name, department) 
SELECT 
  c.user_id,
  CASE 
    WHEN c.qualification LIKE '%PhD in Clinical%' THEN 'Dr. Sarah Johnson'
    WHEN c.qualification LIKE '%MA in Counseling%' THEN 'Lisa Martinez'
    WHEN c.qualification LIKE '%PsyD%' THEN 'Dr. Michael Chen'
    WHEN c.qualification LIKE '%MSW%' THEN 'Jennifer Williams'
    WHEN c.qualification LIKE '%PhD in Behavioral%' THEN 'Dr. David Thompson'
  END as full_name,
  CASE 
    WHEN c.qualification LIKE '%PhD in Clinical%' THEN 'sarah.johnson@university.edu'
    WHEN c.qualification LIKE '%MA in Counseling%' THEN 'lisa.martinez@university.edu'
    WHEN c.qualification LIKE '%PsyD%' THEN 'michael.chen@university.edu'
    WHEN c.qualification LIKE '%MSW%' THEN 'jennifer.williams@university.edu'
    WHEN c.qualification LIKE '%PhD in Behavioral%' THEN 'david.thompson@university.edu'
  END as email,
  'counselor'::user_role as role,
  'University Mental Health Center' as college_name,
  'Psychology Department' as department
FROM public.counselors c
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = c.user_id);

-- Create a games table for the relaxing games section
CREATE TABLE public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  game_type text NOT NULL,
  difficulty_level text DEFAULT 'easy',
  estimated_time text,
  instructions text,
  game_data jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for games table
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Create policy for games (public access for viewing)
CREATE POLICY "Anyone can view games" 
ON public.games 
FOR SELECT 
USING (is_active = true);

-- Insert sample relaxing games
INSERT INTO public.games (title, description, game_type, difficulty_level, estimated_time, instructions, game_data) VALUES
('Mindful Chess', 'A relaxing chess game focused on mindfulness and strategic thinking', 'chess', 'medium', '15-30 minutes', 'Take your time with each move. Focus on breathing and thinking clearly about your strategy.', '{"theme": "zen", "timer": false, "hints": true}'),

('Memory Garden', 'A peaceful memory matching game with nature themes', 'memory', 'easy', '5-10 minutes', 'Match pairs of cards by clicking on them. Take your time and enjoy the beautiful nature imagery.', '{"theme": "nature", "cards": 16, "difficulty": "easy"}'),

('Stress-Free Sudoku', 'A gentle sudoku puzzle without time pressure', 'puzzle', 'easy', '10-20 minutes', 'Fill the grid with numbers 1-9. No rush - this is about relaxation and mental exercise.', '{"difficulty": "easy", "hints": true, "timer": false}'),

('Breathing Bubble Pop', 'A simple bubble-popping game synchronized with breathing exercises', 'breathing', 'easy', '5-15 minutes', 'Pop bubbles in rhythm with your breathing. Inhale as bubbles appear, exhale as you pop them.', '{"speed": "slow", "colors": ["blue", "green", "purple"], "breathing_guide": true}'),

('Case Study Scenarios', 'Interactive scenarios to practice problem-solving and empathy', 'case-study', 'medium', '10-25 minutes', 'Read through realistic scenarios and choose how you would respond. Learn from different perspectives.', '{"scenarios": ["academic_stress", "social_anxiety", "time_management", "relationship_issues"], "feedback": true}');