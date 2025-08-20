
-- Create upload_history table to track report uploads
CREATE TABLE public.upload_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name text NOT NULL,
  shop_id uuid NOT NULL,
  uploaded_by uuid NOT NULL,
  upload_date timestamp with time zone NOT NULL DEFAULT now(),
  file_size bigint,
  record_count integer,
  month_year text NOT NULL,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.upload_history 
  ADD CONSTRAINT upload_history_shop_id_fkey 
  FOREIGN KEY (shop_id) REFERENCES public.shops(id);

ALTER TABLE public.upload_history 
  ADD CONSTRAINT upload_history_uploaded_by_fkey 
  FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

-- Enable Row Level Security
ALTER TABLE public.upload_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins and leaders can view all upload history" 
  ON public.upload_history 
  FOR SELECT 
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'leader'::user_role]));

CREATE POLICY "Admins and leaders can insert upload history" 
  ON public.upload_history 
  FOR INSERT 
  WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'leader'::user_role]));

CREATE POLICY "Users can view their own upload history" 
  ON public.upload_history 
  FOR SELECT 
  USING (uploaded_by = auth.uid());

-- Create index for better performance
CREATE INDEX idx_upload_history_shop_id ON public.upload_history(shop_id);
CREATE INDEX idx_upload_history_uploaded_by ON public.upload_history(uploaded_by);
CREATE INDEX idx_upload_history_month_year ON public.upload_history(month_year);
CREATE INDEX idx_upload_history_upload_date ON public.upload_history(upload_date DESC);
