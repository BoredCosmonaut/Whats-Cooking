`const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { type } = require('os');

const ALLOWED_TYPES = ['recipes','profile','reviews']

const getStorage = (type) => {
    if (!ALLOWED_TYPES.includes(type)) {
    throw new Error('Not a valid file type');
    }

    const uploadPath = path.join(__dirname,'..','..','images',type);
    fs.mkdirSync(uploadPath, { recursive: true });
    return multer.diskStorage({
        destination: (req, file, cb) => {
        cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
        }
    });
};

const dynamicUpload = (type) => {
    const storage = getStorage(type);
    return multer({storage});
};

module.exports= dynamicUpload;`

const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

// 1. Supabase Bağlantısı
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 2. Hafıza Depolama (Disk yerine RAM kullanıyoruz)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Maksimum 5MB
});

/**
 * Supabase'e yükleme yapan yardımcı fonksiyon
 * @param {Object} file - multer'dan gelen dosya
 * @param {String} folder - 'profile', 'recipes' veya 'reviews'
 */
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

    // HEM temizlenmiş ismi (klasörsüz) HEM DE tam URL'i döndürüyoruz
    return { 
        image_name: `${timestamp}-${cleanFileName}`, 
        image_url: publicUrl 
    };
};

// 'upload' objesini ve yardımcı fonksiyonu dışarı aktar
module.exports = { upload, uploadToSupabase };