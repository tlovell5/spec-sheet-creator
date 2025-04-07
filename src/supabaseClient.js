import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
export const STORAGE_BUCKET = 'spec-sheets';

// Define folders within the bucket
export const STORAGE_FOLDERS = {
  LOGOS: 'logos',
  PRODUCT_IMAGES: 'product-images',
  PRODUCTION_DETAILS: 'production-details',
  SIGNATURES: 'signatures'
};

// Mock file upload function that simulates successful uploads
export const uploadFile = async (file, folder, options = {}) => {
  if (!file) return { success: false, error: 'No file provided' };
  
  try {
    console.log(`Mock uploading file ${file.name} to folder ${folder}...`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    // Create a mock URL for the file
    // For images, we can use a data URL to actually display the image
    let mockUrl = '';
    
    if (file.type.startsWith('image/')) {
      // For images, create a data URL that can actually be displayed
      mockUrl = await readFileAsDataURL(file);
    } else {
      // For other files, create a mock URL
      mockUrl = `https://example.com/mock-storage/${filePath}`;
    }
    
    console.log(`Mock upload successful: ${mockUrl.substring(0, 50)}...`);
    
    return { 
      success: true, 
      filePath, 
      publicUrl: mockUrl,
      bucket: 'mock-bucket',
      isMock: true
    };
  } catch (error) {
    console.error('Error in mock upload:', error);
    return { success: false, error };
  }
};

// Helper function to read a file as a data URL
const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};