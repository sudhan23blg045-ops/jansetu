import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log("1. Checking URL & Key...");
  console.log("URL:", supabaseUrl);
  console.log("Key Length:", supabaseKey?.length);

  console.log("\\n2. Checking 'applications' table existence...");
  const { data: appData, error: appError } = await supabase.from('applications').select('id').limit(1);
  if (appError) {
    console.error("❌ 'applications' table error:", appError.message);
  } else {
    console.log("✅ 'applications' table exists.");
  }

  console.log("\\n3. Checking 'application-documents' storage bucket...");
  const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('application-documents');
  if (bucketError) {
    console.error("❌ Storage bucket error:", bucketError.message);
  } else {
    console.log("✅ 'application-documents' storage bucket exists. Public:", bucketData.public);
  }

  console.log("\\n4. Testing Insert (without auth, might fail RLS but shouldn't fail schema)...");
  const { data: insertData, error: insertError } = await supabase.from('applications').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    full_name: 'Test Verify',
    mobile_number: '1234567890',
    email: 'test@test.com',
    state: 'State',
    district: 'District',
    community: 'Community',
    address: 'Address',
    application_type: 'Government Scheme',
    reason_for_request: 'Testing verification',
    status: 'Submitted'
  }).select();
  
  if (insertError) {
    console.log("Insert result (Error expected due to RLS if auth missing):", insertError.message);
  } else {
    console.log("✅ Insert succeeded:", insertData);
  }
}

verifyMigration();
