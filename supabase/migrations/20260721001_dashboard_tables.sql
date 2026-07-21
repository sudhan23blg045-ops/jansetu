-- Migration: User Documents
CREATE TABLE IF NOT EXISTS public.user_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, 
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'Pending Verification', 
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, document_type)
);

ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own documents" ON public.user_documents;
CREATE POLICY "Users can view their own documents" ON public.user_documents FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own documents" ON public.user_documents;
CREATE POLICY "Users can insert their own documents" ON public.user_documents FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own documents" ON public.user_documents;
CREATE POLICY "Users can update their own documents" ON public.user_documents FOR UPDATE USING (auth.uid() = user_id);
