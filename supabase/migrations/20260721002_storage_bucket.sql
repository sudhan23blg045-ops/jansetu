-- Migration: User Documents Storage Bucket (Private & Secure)

-- 1. Create a PRIVATE bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop any existing insecure policies
DROP POLICY IF EXISTS "Anyone can read user documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload user documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- 3. Strict RLS Policies tied to auth.uid()
-- Note: Files are uploaded to a folder matching the user's ID (e.g., "uuid/filename.pdf")
-- The policy ensures (storage.foldername(name))[1] matches the authenticated user's ID.

-- SELECT: Users can only read their own files
CREATE POLICY "Users can read their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- INSERT: Users can only upload files to their own folder
CREATE POLICY "Authenticated users can upload user documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-documents' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- UPDATE: Users can only update their own files
CREATE POLICY "Users can update their own documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-documents' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- DELETE: Users can only delete their own files
CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
