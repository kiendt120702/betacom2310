-- Create tags table for general training exercises
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for general training exercise tags
CREATE TABLE public.general_training_exercise_tags (
  exercise_id UUID NOT NULL REFERENCES general_training_exercises(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_training_exercise_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags table
CREATE POLICY "Anyone can view tags" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON public.tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for exercise tags junction table
CREATE POLICY "Anyone can view exercise tags" ON public.general_training_exercise_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage exercise tags" ON public.general_training_exercise_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_tags_name ON public.tags(name);
CREATE INDEX idx_exercise_tags_exercise_id ON public.general_training_exercise_tags(exercise_id);
CREATE INDEX idx_exercise_tags_tag_id ON public.general_training_exercise_tags(tag_id);

-- Insert some default tags for training positions
INSERT INTO public.tags (name) VALUES
  ('Leader'),
  ('Sale'),
  ('Trưởng phòng'),
  ('Chuyên viên'),
  ('Tất cả')
ON CONFLICT (name) DO NOTHING;