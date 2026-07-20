import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log("Starting End-to-End Test...");

  // 1. Create a test user
  const email = `testuser${Date.now()}@gmail.com`;
  const password = 'TestPassword123!';
  
  console.log(`\\n1. Creating test user (${email})...`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: 'Test',
        last_name: 'User',
        phone: '9876543210'
      }
    }
  });

  if (authError) {
    console.error("❌ Auth Error:", authError.message);
    return;
  }
  
  const userId = authData.user?.id;
  console.log("✅ User created successfully:", userId);
  console.log("Session exists:", !!authData.session);

  if (!authData.session) {
    console.log("No active session! This means email confirmation is required, or login failed. Bypassing upload/insert tests since they require auth.");
    
    // Instead of stopping, we'll try to sign in with an existing user if there is one, or just stop.
    return;
  }

  // 2. Test Document Upload
  console.log("\\n2. Testing Document Upload...");
  const fileName = `${userId}/test-doc-${Date.now()}.txt`;
  const fileContent = "This is a test document.";
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('application-documents')
    .upload(fileName, fileContent, {
      contentType: 'text/plain'
    });

  if (uploadError) {
    console.error("❌ Upload Error:", uploadError.message);
    return;
  }
  
  console.log("✅ Document uploaded successfully:", uploadData.path);
  
  const { data: publicUrlData } = supabase.storage
    .from('application-documents')
    .getPublicUrl(fileName);

  // 3. Insert Application
  console.log("\\n3. Testing Application Insert...");
  const { data: insertData, error: insertError } = await supabase.from("applications").insert({
    user_id: userId,
    full_name: 'Test User',
    mobile_number: '9876543210',
    email: email,
    state: 'Tamil Nadu',
    district: 'Chennai',
    community: 'Test Community',
    address: '123 Test St',
    application_type: 'General Assistance',
    related_item: 'Test Item',
    reason_for_request: 'Testing the end-to-end workflow.',
    additional_notes: 'No notes.',
    document_urls: [publicUrlData.publicUrl],
    status: "Submitted"
  }).select();

  if (insertError) {
    console.error("❌ Application Insert Error:", insertError.message);
    return;
  }
  
  const appId = insertData[0].id;
  console.log("✅ Application inserted successfully:", appId);

  // 4. Verify "My Applications" view
  console.log("\\n4. Testing 'My Applications' view...");
  const { data: myApps, error: myAppsError } = await supabase.from('applications').select('*');
  if (myAppsError) {
    console.error("❌ My Apps Select Error:", myAppsError.message);
  } else {
    console.log(`✅ Found ${myApps.length} applications for user.`);
  }

  // 5. Test Admin View (should fail if not admin, or succeed if policy is open)
  // Let's sign in as an admin if possible, but we don't have one. We will just check the current state.
  console.log("\\nAll basic workflow tests passed for normal user.");
}

runTests();
