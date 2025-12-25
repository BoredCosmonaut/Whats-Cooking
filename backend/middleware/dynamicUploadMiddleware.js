const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

const uploadToSupabase = async (file, folder) => {
    const timestamp = Date.now();
    const cleanFileName = file.originalname
        .replace(/[^a-z0-9.]/gi, '_')
        .replace(/_{2,}/g, '_');

    const fullPath = `${folder}/${timestamp}-${cleanFileName}`;

    const { data, error } = await supabase.storage
        .from('images')
        .upload(fullPath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fullPath);

    return { 
        image_name: `${timestamp}-${cleanFileName}`, 
        image_url: publicUrl 
    };
};


module.exports = { upload, uploadToSupabase };