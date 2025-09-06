-- Create analyses table to store resume analysis results
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pdf_url TEXT NOT NULL,
  pdf_filename TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url')
);

-- Create index for faster lookups by share token
CREATE INDEX IF NOT EXISTS idx_analyses_share_token ON public.analyses(share_token);

-- Create index for faster lookups by creation date
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);

-- Since we don't have authentication yet, we'll make this table publicly readable
-- but only allow inserts (no updates/deletes for security)
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read analyses (for sharing)
CREATE POLICY "Allow public read access" ON public.analyses
  FOR SELECT USING (true);

-- Allow anyone to insert new analyses
CREATE POLICY "Allow public insert" ON public.analyses
  FOR INSERT WITH CHECK (true);

-- Prevent updates and deletes for now
CREATE POLICY "Prevent updates" ON public.analyses
  FOR UPDATE USING (false);

CREATE POLICY "Prevent deletes" ON public.analyses
  FOR DELETE USING (false);
