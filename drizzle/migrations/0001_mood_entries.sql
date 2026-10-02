CREATE TABLE public.mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  mood smallint NOT NULL CHECK (mood BETWEEN 1 AND 10),
  sleep_hours numeric(3,1) NOT NULL DEFAULT 7,
  stress smallint NOT NULL DEFAULT 5 CHECK (stress BETWEEN 1 AND 10),
  energy smallint NOT NULL DEFAULT 5 CHECK (energy BETWEEN 1 AND 10),
  exercise_minutes integer NOT NULL DEFAULT 0,
  social_hours numeric(3,1) NOT NULL DEFAULT 1,
  study_hours numeric(3,1) NOT NULL DEFAULT 4,
  screen_hours numeric(3,1) NOT NULL DEFAULT 4,
  emotions text[] DEFAULT '{}',
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, entry_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_entries TO authenticated;
GRANT ALL ON public.mood_entries TO service_role;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own mood entries" ON public.mood_entries FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());