import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define storage buckets
export const STORAGE_BUCKETS = {
  CUSTOMER_LOGOS: 'customer-logos',
  PRODUCT_IMAGES: 'product-images',
  ARTWORK_FILES: 'artwork-files',
  MIX_INSTRUCTION_IMAGES: 'mix-instruction-images'
};

/**
 * Upload a file to Supabase storage
 * @param {File} file - The file to upload
 * @param {string} bucketName - The bucket to upload to
 * @param {string} fileName - Optional custom file name
 * @returns {Promise<{data: Object, error: Error}>} - The upload result
 */
export const uploadFile = async (file, bucketName, fileName = null) => {
  try {
    // Generate a unique file name if not provided
    const uniqueFileName = fileName || `${Date.now()}_${file.name}`;
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, file);
    
    if (error) {
      throw error;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);
    
    return { data: { ...data, publicUrl: urlData.publicUrl }, error: null };
  } catch (error) {
    console.error(`Error uploading file to ${bucketName}:`, error);
    return { data: null, error };
  }
};

/**
 * Delete a file from Supabase storage
 * @param {string} bucketName - The bucket containing the file
 * @param {string} filePath - The path of the file to delete
 * @returns {Promise<{data: Object, error: Error}>} - The deletion result
 */
export const deleteFile = async (bucketName, filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error deleting file from ${bucketName}:`, error);
    return { data: null, error };
  }
};