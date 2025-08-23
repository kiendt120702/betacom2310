// Script to check and update Supabase bucket settings
// Run with: node check-bucket-settings.js

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://agshelsxkotwfvkzlwtn.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase bucket configuration...');
console.log(`Project URL: ${supabaseUrl}`);
console.log(`Bucket: training-videos`);
console.log('');

console.log('❌ Current issue: 264MB file upload failed');
console.log('✅ Expected: 2GB file size limit');
console.log('');

console.log('🔧 Manual fix required:');
console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/projects');
console.log(`2. Select your project: ${supabaseUrl.split('//')[1].split('.')[0]}`);
console.log('3. Navigate: Storage → Buckets');
console.log('4. Find "training-videos" bucket');
console.log('5. Click three dots (...) → Edit');
console.log('6. Change "File size limit" from current to: 2 GB');
console.log('7. Save changes');
console.log('');

console.log('📋 Alternative via SQL (if RLS allows):');
console.log(`
-- Update bucket configuration (requires service_role key)
UPDATE storage.buckets 
SET file_size_limit = 2147483648  -- 2GB in bytes
WHERE id = 'training-videos';
`);

console.log('🧪 After fix, test with:');
console.log('- Small file (< 50MB)');
console.log('- Medium file (100-300MB) ← Your current case'); 
console.log('- Large file (1-2GB)');