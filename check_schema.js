const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const tables = ['applications', 'documents', 'notifications', 'schemes', 'ngo_requests', 'volunteer_registrations'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`[${table}] Error:`, error.message);
    } else {
      console.log(`[${table}] Exists. Columns:`, data.length > 0 ? Object.keys(data[0]).join(', ') : 'Empty table');
    }
  }
}

checkSchema();
