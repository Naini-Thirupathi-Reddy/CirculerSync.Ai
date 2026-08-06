import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

async function checkSupabaseStorage() {
  console.log('🔍 Checking Supabase project connection & storage buckets...');
  console.log('Project URL:', env.SUPABASE_URL);

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('❌ Error listing Supabase buckets:', error.message);
      process.exit(1);
    }

    console.log('✅ Supabase Auth & Storage API connected successfully!');
    console.log('Existing buckets:', buckets.map(b => b.name));

    const hasWastePhotos = buckets.some(b => b.name === 'waste-photos');
    if (!hasWastePhotos) {
      console.log('⚙️ Creating "waste-photos" storage bucket...');
      const { data: newBucket, error: createErr } = await supabase.storage.createBucket('waste-photos', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      });

      if (createErr) {
        console.warn('Bucket creation notice:', createErr.message);
      } else {
        console.log('✅ Successfully created public storage bucket "waste-photos"');
      }
    } else {
      console.log('✅ Storage bucket "waste-photos" exists and is ready!');
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

checkSupabaseStorage();
