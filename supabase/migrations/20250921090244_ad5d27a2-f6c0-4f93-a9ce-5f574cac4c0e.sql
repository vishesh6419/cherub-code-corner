-- Add sample counselors
INSERT INTO profiles (user_id, email, full_name, college_name, department, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'dr.smith@university.edu', 'Dr. Sarah Smith', 'University Mental Health Center', 'Psychology', 'counselor'),
  ('22222222-2222-2222-2222-222222222222', 'dr.johnson@university.edu', 'Dr. Michael Johnson', 'University Mental Health Center', 'Clinical Psychology', 'counselor'),
  ('33333333-3333-3333-3333-333333333333', 'dr.williams@university.edu', 'Dr. Emily Williams', 'University Mental Health Center', 'Therapy', 'counselor'),
  ('44444444-4444-4444-4444-444444444444', 'dr.brown@university.edu', 'Dr. David Brown', 'University Mental Health Center', 'Counseling Psychology', 'counselor');

-- Add sample counselor profiles
INSERT INTO counselors (user_id, qualification, specialization, experience_years, is_available) VALUES
  ('11111111-1111-1111-1111-111111111111', 'PhD in Clinical Psychology', ARRAY['Anxiety', 'Depression', 'Academic Stress'], 8, true),
  ('22222222-2222-2222-2222-222222222222', 'Licensed Clinical Social Worker', ARRAY['Trauma', 'PTSD', 'Crisis Intervention'], 12, true),
  ('33333333-3333-3333-3333-333333333333', 'PhD in Counseling Psychology', ARRAY['Relationship Issues', 'Self-Esteem', 'Adjustment Disorders'], 6, true),
  ('44444444-4444-4444-4444-444444444444', 'Masters in Mental Health Counseling', ARRAY['Substance Abuse', 'Family Therapy', 'Group Therapy'], 10, true);

-- Add sample resources
INSERT INTO resources (title, description, content_type, category, content_text, language, created_by) VALUES
  ('Managing Academic Stress', 'Practical strategies for handling academic pressure and exam anxiety', 'article', 'stress_management', 'Academic stress is a common experience for college students. Here are some effective strategies to manage it: 1. Time Management - Create a schedule and stick to it. 2. Break large tasks into smaller, manageable pieces. 3. Take regular breaks during study sessions. 4. Practice relaxation techniques like deep breathing. 5. Maintain a healthy lifestyle with proper sleep, nutrition, and exercise.', 'english', '11111111-1111-1111-1111-111111111111'),
  
  ('Mindfulness for Mental Wellness', 'Introduction to mindfulness practices for improving mental health', 'article', 'mindfulness', 'Mindfulness is the practice of being present in the moment without judgment. Research shows it can significantly improve mental health. Benefits include: reduced anxiety and depression, improved focus and concentration, better emotional regulation, and increased self-awareness. Simple practices include: daily meditation, mindful breathing exercises, body scan techniques, and mindful walking.', 'english', '22222222-2222-2222-2222-222222222222'),
  
  ('Building Healthy Relationships', 'Guide to developing and maintaining positive relationships in college', 'article', 'relationships', 'Healthy relationships are crucial for mental wellness in college. Key principles include: effective communication, setting boundaries, mutual respect, trust and honesty, and emotional support. Tips for building relationships: be genuine and authentic, show interest in others, practice active listening, be reliable and trustworthy, and resolve conflicts constructively.', 'english', '33333333-3333-3333-3333-333333333333'),
  
  ('Sleep Hygiene for Students', 'Essential tips for better sleep quality and mental health', 'article', 'sleep', 'Good sleep is fundamental to mental health. Poor sleep can worsen anxiety and depression. Sleep hygiene tips: maintain a consistent sleep schedule, create a relaxing bedtime routine, limit screen time before bed, keep your room cool and dark, avoid caffeine and alcohol before bedtime, and use your bed only for sleep and rest.', 'english', '44444444-4444-4444-4444-444444444444'),
  
  ('Coping with Anxiety', 'Understanding and managing anxiety in academic settings', 'video', 'anxiety', 'This comprehensive guide covers: understanding what anxiety is, recognizing anxiety symptoms, breathing techniques for immediate relief, cognitive strategies for long-term management, when to seek professional help, and creating a personal anxiety management plan.', 'english', '11111111-1111-1111-1111-111111111111'),
  
  ('Depression Awareness and Support', 'Recognizing signs of depression and finding help', 'article', 'depression', 'Depression is more than just feeling sad. Key signs include: persistent sadness or hopelessness, loss of interest in activities, changes in appetite or sleep, fatigue, difficulty concentrating, and thoughts of self-harm. If you experience these symptoms, reach out for help. Treatment options include therapy, medication, lifestyle changes, and support groups.', 'english', '22222222-2222-2222-2222-222222222222');

-- Update resources to be featured
UPDATE resources SET is_featured = true WHERE title IN ('Managing Academic Stress', 'Mindfulness for Mental Wellness', 'Coping with Anxiety');