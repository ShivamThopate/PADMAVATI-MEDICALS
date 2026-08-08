import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ryfsyyptktuqcjskfxjw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_secret_q7FuaMbRLlJg4od87hjPhQ__1Rj6GWG';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = supabase;

/**
 * Uploads a file to the Supabase 'inventory-images' public bucket
 * @param {File} file 
 * @returns {Promise<string>} The public URL of the uploaded file
 */
window.uploadProductImage = async function(file) {
  if (!file) throw new Error('No file provided');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('inventory-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('inventory-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Supabase upload error:', err);
    throw err;
  }
};
