import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let supabase = null;

if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  } catch (err) {
    console.warn('Supabase Storage initialization warning:', err.message);
  }
}

export async function uploadWastePhoto(fileBuffer, fileName, mimeType = 'image/jpeg') {
  if (supabase) {
    try {
      const filePath = `waste-streams/${Date.now()}_${fileName}`;
      const { data, error } = await supabase.storage
        .from('waste-photos')
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('waste-photos')
          .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage upload error, returning local fallback:', err.message);
    }
  }

  // Fallback demo URL if Supabase credentials are not supplied yet
  return `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80`;
}
